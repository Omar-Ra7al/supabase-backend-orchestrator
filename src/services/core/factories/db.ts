import { response } from "@/utils/response";
import { resolveClient } from "@/lib/supabase";
import type {
  BaseDbInstance,
  BaseParams,
  DbCreateParams,
  DbGetByIdParams,
  DbGetParams,
  DbRemoveParams,
  DbServiceConfig,
  DbUpdateParams,
  PayloadRecord,
} from "@/services/core/types";

export function createDbService({
  tableName,
  primaryKey = "id",
}: DbServiceConfig): BaseDbInstance {
  /**
   * CREATE
   */
  const create = async <T extends object>({
    payload,
    clientType = "server",
  }: DbCreateParams<T>) => {
    const db = await resolveClient(clientType);
    const targetPayload = { ...payload } as PayloadRecord;

    const { data, error } = await db
      .from(tableName)
      .insert(targetPayload)
      .select()
      .single();

    return response(
      data as T,
      !error,
      error?.message ?? null,
      error ? "Create failed" : "Created successfully",
    );
  };

  /**
   * UPDATE
   */
  const update = async <T extends object>({
    id,
    payload,
    clientType = "server",
  }: DbUpdateParams<T>) => {
    const db = await resolveClient(clientType);
    const targetPayload = { ...payload } as PayloadRecord;

    const { data, error } = await db
      .from(tableName)
      .update(targetPayload)
      .eq(primaryKey, id)
      .select()
      .single();

    return response(
      data as T,
      !error,
      error?.message ?? null,
      error ? "Update failed" : "Updated successfully",
    );
  };

  /**
   * REMOVE
   */
  const remove = async <T extends object = PayloadRecord>({
    id,
    clientType = "server",
  }: DbRemoveParams) => {
    const db = await resolveClient(clientType);

    const { data, error } = await db
      .from(tableName)
      .delete()
      .eq(primaryKey, id)
      .select()
      .single();

    return response(
      data as T,
      !error,
      error?.message ?? null,
      error ? "Remove failed" : "Removed successfully",
    );
  };

  /**
   * GET ALL
   */
  const getAll = async <T extends object>({
    clientType = "public",
  }: BaseParams) => {
    const db = await resolveClient(clientType);
    const { data, error } = await db.from(tableName).select("*");
    const success = !error;

    return response(
      (data ?? []) as T[],
      success,
      error?.message ?? null,
      success ? "Fetched successfully" : "Fetch failed",
    );
  };

  /**
   * GET BY ID
   */
  const getById = async <T extends object>({
    id,
    clientType = "public",
  }: DbGetByIdParams) => {
    const db = await resolveClient(clientType);
    const { data, error } = await db
      .from(tableName)
      .select("*")
      .eq(primaryKey, id)
      .single();
    return response(
      data as T,
      !error,
      error?.message ?? null,
      "Fetched successfully",
    );
  };

  /**
   * GET WITH QUERY
   */
  const get = async <T extends object>(params: DbGetParams<T>) => {
    const {
      where,
      limit,
      orderBy,
      clientType = "public",
      shape = "list",
    } = params;

    const db = await resolveClient(clientType);
    let query = db.from(tableName).select("*");
    if (where) {
      for (const [key, value] of Object.entries(where))
        query = query.eq(key, value);
    }
    if (orderBy)
      query = query.order(orderBy.column, {
        ascending: orderBy.ascending ?? true,
      });
    if (limit) query = query.limit(limit);

    if (shape === "single") {
      const { data, error } = await query.maybeSingle();
      return response(
        data,
        !error,
        error?.message ?? null,
        "Fetched successfully",
      );
    }

    const { data, error } = await query;
    return response(
      data ?? [],
      !error,
      error?.message ?? null,
      "Fetched successfully",
    );
  };

  return {
    create,
    getAll,
    getById,
    get,
    update,
    remove,
  } satisfies BaseDbInstance;
}
