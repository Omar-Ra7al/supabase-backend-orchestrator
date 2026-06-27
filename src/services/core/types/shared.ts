import type { DbClientType } from "@/lib/supabase";

export type { DbClientType };

export type BaseParams = object;

export type BaseId = number | string;

export type OrderBy = { column: string; ascending?: boolean };

export type PayloadRecord = Record<string, unknown>;

export type SortIds = BaseId[];

export type WithId<P = BaseParams> = P & { id: BaseId };

export type WithPayload<T, P = BaseParams> = P & { payload: T };

export type WithPayloadKey = string | null;
