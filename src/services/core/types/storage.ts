import type { ApiResponse } from "@/utils/response";

import type {
  BaseParams,
  PayloadRecord,
  WithPayload,
  WithPayloadKey,
} from "./shared";

export type StorageServiceConfig = {
  bucketName: string;
  groupFolder?: string;
};

export type StorageUploadParams = BaseParams & {
  file: File | Buffer | Blob;
  path?: string;
};

export type DiscoveredFile = {
  parent: PayloadRecord;
  key: string;
  file: File;
};

export type StorageRemoveParams = BaseParams & { fileUrl: string };

export type StorageRemoveTreeParams = WithPayload<PayloadRecord>;

export type StorageProcessUploadParams = BaseParams & {
  payload: PayloadRecord;
  payloadKey?: WithPayloadKey;
};

export type StorageProcessUpdateParams = BaseParams & {
  databaseSnapshot: PayloadRecord;
  payload: PayloadRecord;
  payloadKey?: WithPayloadKey;
};

export interface BaseStorageInstance {
  upload: (params: StorageUploadParams) => Promise<ApiResponse<string>>;
  remove: (params: StorageRemoveParams) => Promise<ApiResponse<unknown>>;
  removeTree: (
    params: StorageRemoveTreeParams,
  ) => Promise<ApiResponse<unknown>>;
  processUploadTree: (
    params: StorageProcessUploadParams,
  ) => Promise<PayloadRecord>;
  processUpdateTree: (
    params: StorageProcessUpdateParams,
  ) => Promise<PayloadRecord>;
  hasBinaryAssets: (payload: PayloadRecord) => boolean;
}
