"use server";

import { createEntityService } from "@/services/core/entity";
import { createServerClient } from "@/lib/supabase/server";
import { revalidateTag } from "next/cache";

export const testService = createEntityService({
  dbServiceConfig: {
    tableName: "test",
    cacheTag: "test",
    primaryKey: "id",
    supabaseClient: await createServerClient(),
  },
  storageServiceConfig: {
    bucketName: "test",
    groupFolder: "test",
    supabaseClient: await createServerClient(),
  },
  revalidateFn: revalidateTag as (tag: string) => void,
});
