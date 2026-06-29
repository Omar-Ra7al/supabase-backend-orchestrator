"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import { createPublicServerClient } from "@/lib/supabase/publicServer";
import { generateFeatureService, featureServiceConfig } from "./core";
import type { SupabaseClient } from "@supabase/supabase-js";
// import { YourRecord, YourSchemaType } from "@/schemas/yourSchema";

/**
 * Copy to `services/entities/your-feature/server.ts` and replace placeholders.
 *
 * Multi-client server actions: pass `customClient` to switch auth context.
 * - Default (`createServerClient`): authenticated, cookie-aware writes
 * - `createAdminClient()`: bypass RLS for admin operations
 * - `createPublicServerClient()`: cache-safe reads (no cookies)
 *
 * Conventions:
 * - Writes use object params: `{ payload }`, `{ id, payload }`, `{ ids }`
 * - Reads with args use object params: `{ id }`, `{ slug }`, `{ route }`
 * - Schema type for writes; Record type for reads
 * - Import actions from components — never import entity services directly
 */

const getFeatureService = async (customClient?: SupabaseClient) => {
  const client = customClient ?? (await createServerClient());
  return generateFeatureService(client, revalidateTag as (tag: string) => void);
};

// export const createFeature = async ({
//   payload,
// }: {
//   payload: YourSchemaType;
// }) => {
//   const service = await getFeatureService();
//   return service.create({ payload });
// };

// export const createFeatureAsAdmin = async ({
//   payload,
// }: {
//   payload: YourSchemaType;
// }) => {
//   const service = await getFeatureService(createAdminClient());
//   return service.create({ payload });
// };

// export const createFeatureAsPublic = async ({
//   payload,
// }: {
//   payload: YourSchemaType;
// }) => {
//   const service = await getFeatureService(createPublicServerClient());
//   return service.create({ payload });
// };

export const getFeatures = async () => {
  const service = await getFeatureService();
  // return service.getAll<YourRecord>({});
  return service.getAll({});
};

export const getFeaturesCached = unstable_cache(
  async () => {
    const service = await getFeatureService(createPublicServerClient());
    // return service.getAll<YourRecord>({});
    return service.getAll({});
  },
  ["your-feature-list"],
  { tags: [featureServiceConfig.dbServiceConfig.cacheTag ?? ""] },
);

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
  async () => {
    const service = await getFeatureService(createPublicServerClient());
    // return service.getAllSorted<YourRecord>({});
    return service.getAllSorted({});
  },
  ["sorted-your-feature"],
  { tags: [featureServiceConfig.dbServiceConfig.cacheTag ?? ""] },
);
