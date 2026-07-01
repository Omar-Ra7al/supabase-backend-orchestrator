/**
 * Copy this folder to `services/entities/your-feature/` and replace placeholders.
 *
 * Single-client pattern: use when all access goes through server actions
 * with the authenticated server client (`createServerClient`).
 */
import { createServerClient } from "@/lib/supabase/server";
import { createEntityService } from "@/services/core/entity";
import { EntityServiceConfig } from "@/services/core/types";
import { updateTag } from "next/cache";

export const featureServiceConfig: EntityServiceConfig = {
  dbServiceConfig: {
    tableName: "your_table",
    cacheTag: "your-cache-tag",
    primaryKey: "id",
  },
  storageServiceConfig: {
    bucketName: "your_bucket",
    groupFolder: "your_folder",
    payloadKey: "title",
  },
  sortingServiceConfig: {
    tableName: "sort",
    sortRowId: "your_table",
    primaryKey: "column_id",
  },
};

export const getFeatureService = async () => {
  const client = await createServerClient();
  return createEntityService({
    supabaseClient: client,
    updateTag,
    ...featureServiceConfig,
  });
};
