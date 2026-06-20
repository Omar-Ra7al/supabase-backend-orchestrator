"use server";

import { unstable_cache } from "next/cache";

// import { YourRecord, YourSchemaType } from "@/schemas/yourSchema";
import { featureConfig, featureService } from "@/services/entities/template";

/**
 * Copy to `services/entities/your-feature/actions.ts` and replace placeholders.
 *
 * Conventions:
 * - Writes use object params: `{ payload }`, `{ id, payload }`, `{ ids }`
 * - Reads with args use object params: `{ id }`, `{ slug }`, `{ route }`
 * - Schema type for writes; Record type (`YourSchemaType & { id: number }`) for reads
 * - All exports return `response()`
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
//   return featureService.create({ payload });
// };

export const getFeatures = async () => {
  // return featureService.getAll<YourRecord>();
  return featureService.getAll();
};

export const getFeatureById = async ({ id }: { id: number }) => {
  // return featureService.getById<YourRecord>({ id });
  return featureService.getById({ id });
};

// export const updateFeature = async ({
//   id,
//   payload,
// }: {
//   id: number;
//   payload: YourSchemaType;
// }) => {
//   return featureService.update({ id, payload });
// };

export const deleteFeature = async ({ id }: { id: number }) => {
  return featureService.remove({ id });
};

export const saveFeaturesSort = async ({ ids }: { ids: number[] }) => {
  return featureService.saveSort({ ids });
};

export const getSortedFeatures = async () => {
  // return featureService.getAllSorted<YourRecord>({});
  return featureService.getAllSorted({});
};

export const getSortedFeaturesCached = unstable_cache(
  // async () => featureService.getAllSorted<YourRecord>({}),
  async () => featureService.getAllSorted({}),
  ["sorted-your-feature"],
  { tags: [featureConfig.dbServiceConfig.cacheTag ?? ""] },
);
