import type { ApiResponse } from "@/services/core/response";

import type { BaseDbInstance } from "./db";
import type { BaseParams, SortIds, WithId, WithPayload } from "./shared";

export type SortingServiceConfig = {
  dbService: BaseDbInstance;
  sortRowId: string;
};

export type SortingCreateParams<T> = WithPayload<T>;

export type SortingSaveParams = BaseParams & { ids: SortIds };

export type SortingRemoveParams = WithId;

export type SortByOrderParams<T> = BaseParams & {
  items: T[] | null | undefined;
  order: number[] | null | undefined;
};

export interface BaseSortingInstance {
  createSort: <T extends object>(
    params: SortingCreateParams<T>,
  ) => Promise<ApiResponse<unknown>>;
  getSort: (params: BaseParams) => Promise<ApiResponse<unknown>>;
  saveSort: (params: SortingSaveParams) => Promise<ApiResponse<unknown>>;
  removeItemFromOrder: (
    params: SortingRemoveParams,
  ) => Promise<ApiResponse<unknown>>;
  sortByOrder: <T extends { id: number }>(
    params: SortByOrderParams<T>,
  ) => Promise<T[]>;
}
