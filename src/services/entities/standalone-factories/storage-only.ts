import { createServerClient } from "@/lib/supabase/server";
import { createStorageService } from "@/services/core/factories/storage";

/**
 * STORAGE FACTORY, ALONE
 *
 * Direct file upload/remove with no database row attached.
 * Reach for this for one-off uploads — importing a file, generating a
 * public URL, clearing an asset — without wiring up a full entity.
 *
 * The factory is a pure builder: give it a bucket and a client, get back
 * `upload`, `remove`, `removeTree`, and the payload-tree processors.
 */
export const getMediaStorage = async () => {
  const supabaseClient = await createServerClient();
  return createStorageService({
    bucketName: "media",
    groupFolder: "uploads",
    supabaseClient,
  });
};

// Usage:
//
//   const storage = await getMediaStorage();
//
//   // upload returns the public URL in `data`
//   const { data: url } = await storage.upload({ file, path: "avatars" });
//
//   // remove by the public URL it returned
//   await storage.remove({ fileUrl: url });
