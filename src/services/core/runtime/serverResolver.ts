import { createServerClient } from "@/lib/supabase/server";
import { createPublicServerClient } from "@/lib/supabase/publicServer";
import { createAdminClient } from "@/lib/supabase/admin";

export type ServerClientType = "server" | "public" | "admin";

// Resolve a Supabase client based on the client type `lazily` (to avoid initializing multiple clients in a single request)
export const resolveClient = async (type: ServerClientType = "server") => {
  switch (type) {
    case "server":
      return await createServerClient();
    case "public":
      return createPublicServerClient();
    case "admin":
      return createAdminClient();
    default:
      throw new Error(`Unhandled client type: ${type}`);
  }
};
