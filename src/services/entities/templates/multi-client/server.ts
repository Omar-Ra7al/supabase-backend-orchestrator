"use server";

import { unstable_cache } from "next/cache";
import { generateFeatureService, featureServiceConfig } from "./core";
import { createServiceRunner } from "@/services/core/runtime/runner";
// import { YourRecord, YourSchemaType } from "@/schemas/yourSchema";

/**
 * Copy to `services/entities/your-feature/server.ts` and replace placeholders.
 *
 * Multi-client server actions: `runWithService(clientType, action)` resolves
 * the right Supabase client per call and passes `updateTag` into the service.
 * - "server": authenticated, cookie-aware writes (default)
 * - "admin": bypass RLS for admin operations
 * - "public": cache-safe reads (no cookies) — use inside unstable_cache
 *
 * Conventions:
 * - Writes use object params: `{ payload }`, `{ id, payload }`, `{ ids }`
 * - Reads with args use object params: `{ id }`, `{ slug }`, `{ route }`
 * - Schema type for writes; Record type for reads
 * - Import actions from components — never import entity services directly
 */

const runWithService = createServiceRunner(generateFeatureService);

// export const createFeature = async ({
//   payload,
// }: {
//   payload: YourSchemaType;
// }) => runWithService("server", (service) => service.create({ payload }));

// export const createFeatureAsAdmin = async ({
//   payload,
// }: {
//   payload: YourSchemaType;
// }) => runWithService("admin", (service) => service.create({ payload }));

// export const createFeatureAsPublic = async ({
//   payload,
// }: {
//   payload: YourSchemaType;
// }) => runWithService("public", (service) => service.create({ payload }));

export const getFeatures = async () =>
  // runWithService("server", (service) => service.getAll<YourRecord>({}));
  runWithService("server", (service) => service.getAll({}));

export const getFeaturesCached = unstable_cache(
  async () =>
    // runWithService("public", (service) => service.getAll<YourRecord>({})),
    runWithService("public", (service) => service.getAll({})),
  ["your-feature-list"],
  { tags: [featureServiceConfig.dbServiceConfig.cacheTag ?? ""] },
);

export const getFeatureById = async ({ id }: { id: number }) =>
  // runWithService("server", (service) => service.getById<YourRecord>({ id }));
  runWithService("server", (service) => service.getById({ id }));

// export const updateFeature = async ({
//   id,
//   payload,
// }: {
//   id: number;
//   payload: YourSchemaType;
// }) => runWithService("server", (service) => service.update({ id, payload }));

export const deleteFeature = async ({ id }: { id: number }) =>
  runWithService("server", (service) => service.remove({ id }));

export const saveFeaturesSort = async ({ ids }: { ids: number[] }) =>
  runWithService("server", (service) => service.saveSort({ ids }));

export const getSortedFeatures = async () =>
  // runWithService("server", (service) => service.getAllSorted<YourRecord>({}));
  runWithService("server", (service) => service.getAllSorted({}));

export const getSortedFeaturesCached = unstable_cache(
  async () =>
    // runWithService("public", (service) => service.getAllSorted<YourRecord>({})),
    runWithService("public", (service) => service.getAllSorted({})),
  ["sorted-your-feature"],
  { tags: [featureServiceConfig.dbServiceConfig.cacheTag ?? ""] },
);
