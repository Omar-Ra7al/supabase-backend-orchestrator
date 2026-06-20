import type { ApiResponse } from "@/utils/response";

import type {
  BaseParams,
  OrderBy,
  PayloadRecord,
  WithId,
  WithPayload,
} from "./shared";

export type DbServiceConfig = {
  tableName: string;
  primaryKey?: string;
};

export type DbCreateParams<T> = WithPayload<T>;

export type DbUpdateParams<T> = WithId<WithPayload<T>>;

export type DbRemoveParams = WithId;

export type DbGetByIdParams = WithId;

export type GetShape = "list" | "single";

type DbGetBase<T> = BaseParams & {
  where?: Partial<T>;
  limit?: number;
  orderBy?: OrderBy;
};

export type DbGetParams<T> =
  | (DbGetBase<T> & { shape?: "list" })
  | (DbGetBase<T> & { shape: "single" });

export interface BaseDbInstance {
  create: <T extends object>(
    params: DbCreateParams<T>,
  ) => Promise<ApiResponse<T>>;
  update: <T extends object>(
    params: DbUpdateParams<T>,
  ) => Promise<ApiResponse<T>>;
  remove: <T extends object = PayloadRecord>(
    params: DbRemoveParams,
  ) => Promise<ApiResponse<T>>;
  get<T extends object>(
    params: DbGetParams<T> & { shape: "single" },
  ): Promise<ApiResponse<T | null>>;
  get<T extends object>(params?: DbGetParams<T>): Promise<ApiResponse<T[]>>;
  getAll: <T extends object>(params: BaseParams) => Promise<ApiResponse<T[]>>;
  getById: <T extends object>(
    params: DbGetByIdParams,
  ) => Promise<ApiResponse<T>>;
}
