import { createServerClient } from "@/lib/supabase/server";
import { createDbService } from "@/services/core/factories/db";
import { createSortingService } from "@/services/core/factories/sorting";

/**
 * SORTING FACTORY, ALONE
 *
 * Persisted manual order, decoupled from any specific entity pipeline.
 *
 * The sorting factory composes one other pure builder: it needs a db
 * service for its tracking row (the shared `sort` table), but nothing
 * else from the orchestrator. `sortRowId` is the key of the order row
 * this instance manages (e.g. one row per sortable collection).
 */
export const getMenuSorting = async () => {
  const supabaseClient = await createServerClient();

  const sortDb = createDbService({ tableName: "sort", supabaseClient });

  return createSortingService({
    dbService: sortDb,
    sortRowId: "menu",
  });
};

// Usage:
//
//   const sorting = await getMenuSorting();
//
//   await sorting.saveSort({ ids: [3, 1, 2] }); // persist the order
//   const { data: order } = await sorting.getSort(); // read it back
//
//   // re-order a fetched list yourself:
//   const sorted = await sorting.sortByOrder({ items, order: order.ids });
