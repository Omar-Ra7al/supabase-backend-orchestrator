import { createEntityService } from "@/services/core/entity";
import { EntityServiceConfig } from "@/services/core/types";
import type { SupabaseClient } from "@supabase/supabase-js";

// Configuration
export const projectServiceConfig: EntityServiceConfig = {
  dbServiceConfig: {
    tableName: "projects",
    cacheTag: "projects",
    primaryKey: "id",
  },
  storageServiceConfig: {
    bucketName: "test",
    groupFolder: "projects",
  },
  sortingServiceConfig: {
    tableName: "sort",
    sortRowId: "projects",
  },
};

// Pure generator
export const generateProjectService = (
  client: SupabaseClient,
  updateTag?: (tag: string) => void,
) => {
  return createEntityService({
    supabaseClient: client,
    updateTag,
    ...projectServiceConfig,
  });
};
