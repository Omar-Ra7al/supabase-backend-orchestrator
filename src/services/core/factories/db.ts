import { response } from "@/services/core/response";
import type {
  BaseDbInstance,
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
  supabaseClient,
}: DbServiceConfig): BaseDbInstance {
  /**
   * CREATE
   */
  const create = async <T extends object>({ payload }: DbCreateParams<T>) => {
    const targetPayload = { ...payload } as PayloadRecord;

    const { data, error } = await supabaseClient
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
  }: DbUpdateParams<T>) => {
    const targetPayload = { ...payload } as PayloadRecord;

    const { data, error } = await supabaseClient
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
  }: DbRemoveParams) => {
    const { data, error } = await supabaseClient
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
  const getAll = async <T extends object>() => {
    const { data, error } = await supabaseClient.from(tableName).select("*");
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
  const getById = async <T extends object>({ id }: DbGetByIdParams) => {
    const { data, error } = await supabaseClient
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
    const { where, limit, orderBy, shape = "list" } = params;

    let query = supabaseClient.from(tableName).select("*");
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
