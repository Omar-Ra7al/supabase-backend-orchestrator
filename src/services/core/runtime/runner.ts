import { updateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveClient } from "@/services/core/runtime/serverResolver";
import type { ServerClientType } from "@/services/core/runtime/serverResolver";

export function createServiceRunner<TService>(
  generateService: (client: SupabaseClient, updateTag?: (tag: string) => void) => TService,
) {
  return async <TResult>(
    clientType: ServerClientType,
    action: (service: TService) => Promise<TResult>,
  ): Promise<TResult> => {
    const client = await resolveClient(clientType);
    const service = generateService(client, updateTag);
    return action(service);
  };
}
