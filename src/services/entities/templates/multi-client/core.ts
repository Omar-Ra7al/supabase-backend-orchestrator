/**
 * Copy this folder to `services/entities/your-feature/` and replace placeholders.
 *
 * Multi-client pattern: use when you need browser hooks, admin bypass,
 * or public cached reads. Pass any SupabaseClient to the generator.
 */
import { createEntityService } from "@/services/core/entity";
import { EntityServiceConfig } from "@/services/core/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export const featureServiceConfig: EntityServiceConfig = {
  dbServiceConfig: {
    tableName: "your_table",
    cacheTag: "your-cache-tag",
    primaryKey: "id",
  },
  storageServiceConfig: {
    bucketName: "testing",
    groupFolder: "your_folder",
    payloadKey: "title",
  },
  sortingServiceConfig: {
    tableName: "sort",
    sortRowId: "your_table",
    primaryKey: "column_id",
  },
};

export const generateFeatureService = (
  client: SupabaseClient,
  updateTag?: (tag: string) => void,
) => {
  return createEntityService({
    supabaseClient: client,
    updateTag,
    ...featureServiceConfig,
  });
};
