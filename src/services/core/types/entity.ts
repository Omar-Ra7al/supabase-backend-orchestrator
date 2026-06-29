import type { ApiResponse } from "@/services/core/response";

import type { DbServiceConfig, GetShape } from "./db";
import type { SortingServiceConfig } from "./sorting";
import type { StorageServiceConfig } from "./storage";
import type {
  BaseParams,
  OrderBy,
  PayloadRecord,
  SortIds,
  WithId,
  WithPayload,
  WithPayloadKey,
} from "./shared";

export type EntitySortingConfig = Omit<SortingServiceConfig, "dbService"> & {
  tableName: string;
  primaryKey?: string;
};

export type EntityServiceConfig = {
  dbServiceConfig: DbServiceConfig & { cacheTag?: string };
  sortingServiceConfig?: EntitySortingConfig;
  storageServiceConfig?: StorageServiceConfig & { payloadKey?: WithPayloadKey };
  revalidateFn?: (tag: string) => void;
};

export type EntityCreateParams<T> = WithPayload<T>;

export type EntityUpdateParams<T> = WithId<WithPayload<T>>;

export type EntityRemoveParams = WithId;

export type EntityGetByIdParams = WithId;

type EntityGetBase<T> = BaseParams & {
  where?: Partial<T>;
  limit?: number;
  orderBy?: OrderBy;
};

export type EntityGetParams<T> =
  | (EntityGetBase<T> & { shape?: "list" })
  | (EntityGetBase<T> & { shape: "single" });

export type { GetShape };

export type EntitySaveSortParams = BaseParams & { ids: SortIds };

export type EntityGetAllSortedParams<T> = BaseParams & {
  where?: Partial<T>;
};

export interface BaseEntityInstance {
  create: <T extends object>(
    params: EntityCreateParams<T>,
  ) => Promise<ApiResponse<T>>;
  update: <T extends object>(
    params: EntityUpdateParams<T>,
  ) => Promise<ApiResponse<T>>;
  remove: <T extends object = PayloadRecord>(
    params: EntityRemoveParams,
  ) => Promise<ApiResponse<T>>;
  getAll: <T extends object>(params: BaseParams) => Promise<ApiResponse<T[]>>;
  getById: <T extends object>(
    params: EntityGetByIdParams,
  ) => Promise<ApiResponse<T>>;
  get<T extends object>(
    params: EntityGetParams<T> & { shape: "single" },
  ): Promise<ApiResponse<T | null>>;
  get<T extends object>(params?: EntityGetParams<T>): Promise<ApiResponse<T[]>>;
  getSort: (params: BaseParams) => Promise<ApiResponse<unknown>>;
  saveSort: (params: EntitySaveSortParams) => Promise<ApiResponse<unknown>>;
  getAllSorted: <T extends object>(
    params: EntityGetAllSortedParams<T>,
  ) => Promise<ApiResponse<T[]>>;
}
