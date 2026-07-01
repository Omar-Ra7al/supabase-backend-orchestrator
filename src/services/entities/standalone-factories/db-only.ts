import { createServerClient } from "@/lib/supabase/server";
import { createDbService } from "@/services/core/factories/db";

/**
 * DB FACTORY, ALONE
 *
 * Plain table access — no storage, no sorting, no cache wiring.
 * Reach for this when a table just needs CRUD and nothing the
 * orchestrator (`createEntityService`) would otherwise add.
 *
 * The factory is a pure builder: give it a table name and a client,
 * get back `create`, `update`, `remove`, `getById`, `get`, `getAll`.
 */
export const getTagsDb = async () => {
  const supabaseClient = await createServerClient();
  return createDbService({ tableName: "tags", supabaseClient });
};

// Usage:
//
//   const tags = await getTagsDb();
//
//   await tags.create({ payload: { name: "typescript" } });
//   const { data: all } = await tags.getAll({});
//   const { data: one } = await tags.get({
//     where: { name: "typescript" },
//     shape: "single",
//   });
//   await tags.remove({ id: one.id });

// Multi-client: the factory takes any client, so bind it with the runner
// import { createServiceRunner } from "@/services/core/runtime/runner";
// import type { SupabaseClient } from "@supabase/supabase-js";
//
// const generateTagsDb = (client: SupabaseClient) =>
//   createDbService({ tableName: "tags", supabaseClient: client });
// const runWithTagsDb = createServiceRunner(generateTagsDb);
//
// await runWithTagsDb("admin", (tags) => tags.getAll({}));  // bypass RLS
// await runWithTagsDb("public", (tags) => tags.getAll({})); // cache-safe read
