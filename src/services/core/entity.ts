import { updateTag } from "next/cache";
import { ApiResponse, response } from "@/utils/response";

import type {
  BaseEntityInstance,
  BaseParams,
  EntityCreateParams,
  EntityGetAllSortedParams,
  EntityGetByIdParams,
  EntityGetParams,
  EntityRemoveParams,
  EntitySaveSortParams,
  EntityServiceConfig,
  EntityUpdateParams,
  PayloadRecord,
} from "@/services/core/types";
import { createStorageService, hasBinaryAssets } from "./factories/storage";
import { createSortingService } from "./factories/sorting";
import { createDbService } from "./factories/db";

export function createEntityService({
  dbServiceConfig,
  sortingServiceConfig,
  storageServiceConfig,
}: EntityServiceConfig): BaseEntityInstance {
  const dbService = createDbService(dbServiceConfig);

  const storageService = storageServiceConfig
    ? createStorageService(storageServiceConfig)
    : undefined;

  const sortingService = sortingServiceConfig
    ? createSortingService({
        dbService: createDbService({
          tableName: sortingServiceConfig.tableName,
          primaryKey: sortingServiceConfig.primaryKey,
        }),
        sortRowId: sortingServiceConfig.sortRowId,
      })
    : undefined;

  const invalidateCache = () => {
    if (dbServiceConfig.cacheTag) updateTag(dbServiceConfig.cacheTag);
  };

  const validateStorageRequirement = (payload: PayloadRecord) => {
    const hasBinaryAssetsFlag = hasBinaryAssets(payload as PayloadRecord);

    if (hasBinaryAssetsFlag && !storageService) {
      return response(
        {} as PayloadRecord,
        false,
        "Storage service is not enabled",
        "Create failed",
      );
    }
  };

  return {
    /**
     * CREATE
     */
    create: async <T extends object>({
      payload,
      clientType = "server",
    }: EntityCreateParams<T>) => {
      const storageGuardError = validateStorageRequirement(
        payload as PayloadRecord,
      );
      if (storageGuardError) return storageGuardError as ApiResponse<T>;

      const targetPayload = storageService
        ? await storageService.processUploadTree({
            payload: payload as PayloadRecord,
            payloadKey: storageServiceConfig?.payloadKey,
            clientType,
          })
        : payload;

      const result = await dbService.create<T>({
        payload: targetPayload as T,
        clientType,
      });

      if (result.success) invalidateCache();

      return response(
        result.data,
        result.success,
        result.error,
        result.success ? "Created successfully" : "Create failed",
      );
    },

    /**
     * UPDATE
     */
    update: async <T extends object>({
      id,
      payload,
      clientType = "server",
    }: EntityUpdateParams<T>) => {
      const storageGuardError = validateStorageRequirement(
        payload as PayloadRecord,
      );
      if (storageGuardError) return storageGuardError as ApiResponse<T>;

      const databaseSnapshot = await dbService.getById<T>({ id, clientType });

      let targetPayload = payload;
      if (storageService && databaseSnapshot.success && databaseSnapshot.data) {
        targetPayload = (await storageService.processUpdateTree({
          databaseSnapshot: databaseSnapshot.data as PayloadRecord,
          payload: payload as PayloadRecord,
          payloadKey: storageServiceConfig?.payloadKey,
          clientType,
        })) as T;
      }

      const result = await dbService.update<T>({
        id,
        payload: targetPayload,
        clientType,
      });

      if (result.success) invalidateCache();

      return response(
        result.data,
        result.success,
        result.error,
        result.success ? "Updated successfully" : "Update failed",
      );
    },

    /**
     * REMOVE
     */
    remove: async <T extends object = PayloadRecord>({
      id,
      clientType = "server",
    }: EntityRemoveParams) => {
      const databaseSnapshot = await dbService.getById<T>({ id, clientType });
      const result = await dbService.remove<T>({ id, clientType });

      if (result.success) {
        invalidateCache();

        if (storageService && databaseSnapshot.data) {
          await storageService.removeTree({
            payload: databaseSnapshot.data as PayloadRecord,
            clientType,
          });
        }

        if (sortingService) {
          await sortingService.removeItemFromOrder({ id, clientType });
        }
      }

      return response(
        result.data,
        result.success,
        result.error,
        result.success ? "Deleted successfully" : "Delete failed",
      );
    },

    /**
     * GET ALL
     */
    getAll: async <T extends object>({
      clientType = "public",
    }: BaseParams = {}) => {
      const result = await dbService.getAll<T>({ clientType });
      return response(
        result.data ?? [],
        result.success,
        result.error,
        result.success ? "Fetched successfully" : "Fetch failed",
      );
    },

    /**
     * GET BY ID
     */
    getById: async <T extends object>({
      id,
      clientType = "public",
    }: EntityGetByIdParams) => {
      const result = await dbService.getById<T>({ id, clientType });
      return response(
        result.data,
        result.success,
        result.error,
        result.success ? "Fetched successfully" : "Fetch failed",
      );
    },

    /**
     * GET WITH QUERY
     */
    get: (async <T extends object>(query: EntityGetParams<T> = {}) => {
      const result = await dbService.get(query);
      return response(
        result.data,
        result.success,
        result.error,
        result.success ? "Fetched successfully" : "Fetch failed",
      );
    }) as BaseEntityInstance["get"],

    /**
     * GET SORT ORDER ARRAY
     */
    getSort: async ({ clientType = "public" }: BaseParams = {}) => {
      if (!sortingService)
        return response(null, false, null, "Sorting service is not enabled");
      return sortingService.getSort({ clientType });
    },

    /**
     * SAVE SORT ORDER ARRAY
     */
    saveSort: async ({ ids, clientType = "server" }: EntitySaveSortParams) => {
      if (!sortingService)
        return response(null, false, null, "Sorting service is not enabled");
      const res = await sortingService.saveSort({ ids, clientType });
      if (res.success) invalidateCache();
      return res;
    },

    /**
     * GET ALL SORTED ENTITIES
     */
    getAllSorted: async <T extends object>(
      query: EntityGetAllSortedParams<T>,
    ) => {
      if (!sortingService) {
        return response<T[]>([], false, null, "Sorting service is not enabled");
      }

      // 1. Fetch the tracking row sequence order map
      const sortResponse = await sortingService.getSort({
        clientType: query.clientType,
      });
      if (!sortResponse.success) {
        return response<T[]>(
          [],
          false,
          sortResponse.error,
          "Failed to fetch sort scheme array map",
        );
      }

      const sortRow = sortResponse.data as { ids?: number[] } | null;
      const sortOrder = sortRow?.ids ?? [];

      // 2. Query target entities from DB
      const itemsResponse = query.where
        ? await dbService.get<T>({
            where: query.where,
            clientType: query.clientType,
          })
        : await dbService.getAll<T>({ clientType: query.clientType });

      // Guard clause against DB failures
      if (!itemsResponse.success) {
        return response<T[]>(
          [],
          false,
          itemsResponse.error,
          "Failed to fetch matching sorted elements",
        );
      }

      // Clean, direct type casting without duplicate fallbacks
      const rawItems = itemsResponse.data as unknown as { id: number }[];

      // 3. Delegate safely to the smart sorting engine helper
      const sortedData = await sortingService.sortByOrder<{ id: number }>({
        items: rawItems,
        order: sortOrder,
      });

      return response<T[]>(
        sortedData as T[],
        true,
        null,
        "Sorted elements array fetched successfully",
      );
    },
  };
}
