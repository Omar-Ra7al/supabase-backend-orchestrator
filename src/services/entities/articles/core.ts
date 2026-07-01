import { createServerClient } from "@/lib/supabase/server";
import { createEntityService } from "@/services/core/entity";
import { EntityServiceConfig } from "@/services/core/types";
import { updateTag } from "next/cache";

/**
 * Single-client example: a server-only entity. Every action goes through
 * the authenticated server client (`createServerClient`) created per request.
 */
export const articleServiceConfig: EntityServiceConfig = {
  dbServiceConfig: {
    tableName: "articles",
    cacheTag: "articles",
    primaryKey: "id",
  },
  storageServiceConfig: {
    bucketName: "test",
    groupFolder: "articles",
  },
};

export const getArticleService = async () => {
  const client = await createServerClient();
  return createEntityService({
    supabaseClient: client,
    updateTag,
    ...articleServiceConfig,
  });
};
