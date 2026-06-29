"use server";

import { unstable_cache } from "next/cache";
import { getFeatureService, featureServiceConfig } from "./core";
// import { YourRecord, YourSchemaType } from "@/schemas/yourSchema";

/**
 * Copy to `services/entities/your-feature/server.ts` and replace placeholders.
 *
 * Single-client server actions: always uses createServerClient() per request.
 * Pass createPublicServerClient() only inside unstable_cache callbacks.
 *
 * Conventions:
 * - Writes use object params: `{ payload }`, `{ id, payload }`, `{ ids }`
 * - Reads with args use object params: `{ id }`, `{ slug }`, `{ route }`
 * - Schema type for writes; Record type for reads
 * - Import actions from components — never import entity services directly
 *
 * Image uploads: pass `File` for new images and `string` URLs for unchanged
 * ones — createEntityService handles upload/remove automatically. Keep manual
 * upload logic only for nested fields (e.g. JSON arrays) the factory cannot cover.
 */

// export const createFeature = async ({
//   payload,
// }: {
//   payload: YourSchemaType;
// }) => {
//   const service = await getFeatureService();
//   return service.create({ payload });
// };

export const getFeatures = async () => {
  const service = await getFeatureService();
  // return service.getAll<YourRecord>({});
  return service.getAll({});
};

export const getFeatureById = async ({ id }: { id: number }) => {
  const service = await getFeatureService();
  // return service.getById<YourRecord>({ id });
  return service.getById({ id });
};

// export const updateFeature = async ({
//   id,
//   payload,
// }: {
//   id: number;
//   payload: YourSchemaType;
// }) => {
//   const service = await getFeatureService();
//   return service.update({ id, payload });
// };

export const deleteFeature = async ({ id }: { id: number }) => {
  const service = await getFeatureService();
  return service.remove({ id });
};

export const saveFeaturesSort = async ({ ids }: { ids: number[] }) => {
  const service = await getFeatureService();
  return service.saveSort({ ids });
};

export const getSortedFeatures = async () => {
  const service = await getFeatureService();
  // return service.getAllSorted<YourRecord>({});
  return service.getAllSorted({});
};

export const getSortedFeaturesCached = unstable_cache(
  // async () => service.getAllSorted<YourRecord>({}),
  async () => {
    const service = await getFeatureService();
    return service.getAllSorted({});
  },
  ["sorted-feature"],
  { tags: [featureServiceConfig.dbServiceConfig.cacheTag ?? ""] },
);
