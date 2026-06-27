import { createEntityService } from "@/services/core/entity";
import { createBrowserClient } from "@/lib/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Copy this folder to `services/entities/your-feature/` and replace placeholders.
 */

export const projectService = async ({
  supabaseClient,
}: {
  supabaseClient?: SupabaseClient;
}) =>
  createEntityService({
    dbServiceConfig: {
      tableName: "projects",
      cacheTag: "projects ",
      primaryKey: "id",
      supabaseClient: supabaseClient ?? (await createBrowserClient()),
    },
  });
