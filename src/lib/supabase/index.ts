import { createServerClient } from "@/lib/supabase/server";
import { createPublicServerClient } from "@/lib/supabase/publicServer";
import { createAdminClient } from "@/lib/supabase/admin";
import { createBrowserClient } from "@/lib/supabase/client";

export type DbClientType = "server" | "public" | "admin" | "browser";

// Resolve a Supabase client based on the client type `lazily` (to avoid initializing multiple clients in a single request)
export const resolveClient = (type: DbClientType = "server") => {
  switch (type) {
    case "server":
      return createServerClient();
    case "public":
      return createPublicServerClient();
    case "admin":
      return createAdminClient();
    case "browser":
      return createBrowserClient();
    default:
      const exhaustiveCheck: never = type;
      throw new Error(`Unhandled client type: ${exhaustiveCheck}`);
  }
};
