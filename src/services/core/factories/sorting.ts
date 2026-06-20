import { response } from "@/utils/response";
import type {
  BaseSortingInstance,
  SortingServiceConfig,
} from "@/services/core/types";

export function createSortingService({
  dbService,
  sortRowId,
}: SortingServiceConfig): BaseSortingInstance {
  /**
   * CREATE
   */
  const createSort: BaseSortingInstance["createSort"] = async ({
    payload,
    clientType = "server",
  }) => {
    return dbService.create({
      payload: { column_id: sortRowId, ...payload },
      clientType,
    });
  };

  /**
   * GET SORT
   */
  const getSort: BaseSortingInstance["getSort"] = async ({
    clientType = "public",
  }) => {
    return dbService.get({
      where: { column_id: sortRowId },
      clientType,
      shape: "single",
    });
  };

  /**
   * SAVE SORT
   */
  const saveSort: BaseSortingInstance["saveSort"] = async ({
    ids,
    clientType = "server",
  }) => {
    return dbService.update({
      id: sortRowId,
      payload: { ids },
      clientType,
    });
  };

  /**
   * REMOVE SORT
   */
  const removeItemFromOrder: BaseSortingInstance["removeItemFromOrder"] =
    async ({ id, clientType = "server" }) => {
      const { data, error } = await dbService.get({
        where: { column_id: sortRowId },
        clientType,
        shape: "single",
      });
      if (error) return response(null, false, error, "Failed to fetch sorting");

      const sortRow = data as { ids?: unknown[] } | null;
      const updatedOrder = sortRow?.ids?.filter((item) => item !== id);

      return dbService.update({
        id: sortRowId,
        payload: { ids: updatedOrder },
        clientType,
      });
    };

  /**
   * SORT BY ORDER
   */
  const sortByOrder: BaseSortingInstance["sortByOrder"] = async ({
    items,
    order,
  }) => {
    const sortOrder = order ?? [];
    return [...(items ?? [])].sort(
      (itemA, itemB) =>
        sortOrder.indexOf(itemA.id) - sortOrder.indexOf(itemB.id),
    );
  };

  return {
    createSort,
    getSort,
    saveSort,
    removeItemFromOrder,
    sortByOrder,
  };
}
