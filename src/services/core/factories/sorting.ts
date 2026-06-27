import { response } from "@/services/core/response";
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
  const createSort: BaseSortingInstance["createSort"] = async ({ payload }) => {
    const result = await dbService.create({
      payload: { column_id: sortRowId, ...payload },
    });

    return response(
      result.data,
      result.success,
      result.error,
      result.success ? "Sort created successfully" : "Sort creation failed",
    );
  };

  /**
   * GET SORT
   */
  const getSort: BaseSortingInstance["getSort"] = async () => {
    const result = await dbService.get({
      where: { column_id: sortRowId },
      shape: "single",
    });

    return response(
      result.data,
      result.success,
      result.error,
      result.success ? "Sort fetched successfully" : "Sort fetch failed",
    );
  };

  /**
   * SAVE SORT
   */
  const saveSort: BaseSortingInstance["saveSort"] = async ({ ids }) => {
    const result = await dbService.update({
      id: sortRowId,
      payload: { ids },
    });

    return response(
      result.data,
      result.success,
      result.error,
      result.success ? "Sort saved successfully" : "Sort save failed",
    );
  };

  /**
   * REMOVE SORT
   */
  const removeItemFromOrder: BaseSortingInstance["removeItemFromOrder"] =
    async ({ id }) => {
      const sortResponse = await dbService.get({
        where: { column_id: sortRowId },
        shape: "single",
      });
      if (!sortResponse.success) {
        return response(
          null,
          false,
          sortResponse.error,
          "Failed to fetch sorting",
        );
      }

      const sortRow = sortResponse.data as { ids?: unknown[] } | null;
      const updatedOrder = sortRow?.ids?.filter((item) => item !== id);

      const result = await dbService.update({
        id: sortRowId,
        payload: { ids: updatedOrder },
      });

      return response(
        result.data,
        result.success,
        result.error,
        result.success
          ? "Item removed from order successfully"
          : "Failed to remove item from order",
      );
    };

  /**
   * SORT BY ORDER
   */
  const sortByOrder: BaseSortingInstance["sortByOrder"] = async ({
    items,
    order,
  }) => {
    const sortOrder = order ?? [];
    const sorted = [...(items ?? [])].sort(
      (itemA, itemB) =>
        sortOrder.indexOf(itemA.id) - sortOrder.indexOf(itemB.id),
    );

    return response(sorted, true, null, "Items sorted successfully");
  };

  return {
    createSort,
    getSort,
    saveSort,
    removeItemFromOrder,
    sortByOrder,
  } satisfies BaseSortingInstance;
}
