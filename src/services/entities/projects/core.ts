import { createEntityService } from "@/services/core/entity";
import type { SupabaseClient } from "@supabase/supabase-js";

// Pure generator
export const generateProjectService = (
  client: SupabaseClient,
  revalidateFn?: (tag: string) => void,
) => {
  return createEntityService({
    revalidateFn,
    dbServiceConfig: {
      tableName: "projects",
      cacheTag: "projects",
      primaryKey: "id",
      supabaseClient: client,
    },
    storageServiceConfig: {
      bucketName: "test",
      groupFolder: "projects",
      supabaseClient: client,
    },
  });
};
