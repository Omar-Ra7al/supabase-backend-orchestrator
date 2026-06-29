import { createServerClient } from "@/lib/supabase/server";
import { createEntityService } from "@/services/core/entity";
import { EntityServiceConfig } from "@/services/core/types";
import { revalidateTag } from "next/cache";

export const testServiceConfig: EntityServiceConfig = {
  dbServiceConfig: {
    tableName: "test",
    cacheTag: "test",
    primaryKey: "id",
  },
  storageServiceConfig: {
    bucketName: "test",
    groupFolder: "test",
  },
};

export const getTestService = async () => {
  const client = await createServerClient();
  return createEntityService({
    supabaseClient: client,
    revalidateFn: revalidateTag as (tag: string) => void,
    ...testServiceConfig,
  });
};
