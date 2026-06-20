import { resolveClient } from "@/lib/supabase";
import { response } from "@/utils/response";
import type {
  BaseStorageInstance,
  PayloadRecord,
  StorageServiceConfig,
} from "@/services/core/types";
import { WithPayloadKey } from "../types/shared";
import { DiscoveredFile } from "../types/storage";

/**
 * STORAGE SERVICE FACTORY>
 */
export function createStorageService({
  bucketName,
  groupFolder = "uploads",
}: StorageServiceConfig): BaseStorageInstance {
  // Extracts relative path from absolute Supabase URL
  const extractPathFromUrl = (url: string): string => {
    const bucketIdentifier = `/${bucketName}/`;
    return url.includes(bucketIdentifier)
      ? url.split(bucketIdentifier)[1]
      : url;
  };

  const getFolderSlug = (
    data: PayloadRecord,
    payloadKey?: WithPayloadKey,
  ): string => {
    const value = payloadKey
      ? data[payloadKey]
      : (data.title ?? data.slug ?? data.name ?? data.id);

    return value ? String(value) : "unorganized";
  };

  /**
   * UPLOAD FILE
   */
  const upload: BaseStorageInstance["upload"] = async ({
    file,
    path,
    clientType = "server",
  }) => {
    const supabase = await resolveClient(clientType);

    const finalPath = getFinalPath(file, path ?? "", groupFolder);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(finalPath, file, {
        contentType: (file as File).type || undefined,
      });

    if (error) {
      return response("", false, error.message, "File upload failed");
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return response(
      publicUrlData.publicUrl,
      true,
      null,
      "File uploaded successfully",
    );
  };

  /**
   * DELETE FILE
   */
  const remove: BaseStorageInstance["remove"] = async ({
    fileUrl,
    clientType = "server",
  }) => {
    const supabase = await resolveClient(clientType);
    const filePath = extractPathFromUrl(fileUrl);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      return response(null, false, error.message, "File deletion failed");
    }

    return response(data, true, null, "File deleted successfully");
  };

  /**
   * REMOVE TREE
   */
  const removeTree: BaseStorageInstance["removeTree"] = async ({
    payload,
    clientType = "server",
  }) => {
    const urls = collectUrls(payload, [], bucketName, groupFolder);

    await Promise.all(
      urls.map((url) =>
        remove({
          fileUrl: url,
          clientType,
        }),
      ),
    );

    return response(null, true, null, "Tree removed successfully");
  };

  /**
   * PROCESS UPLOAD TREE
   */
  const processUploadTree: BaseStorageInstance["processUploadTree"] = async ({
    payload,
    clientType = "server",
    payloadKey,
  }) => {
    const result = { ...payload };

    const files = collectFiles(result, []);

    const folderSlug = getFolderSlug(result, payloadKey);

    for (const fileMatch of files) {
      const uploaded = await upload({
        file: fileMatch.file,
        path: folderSlug,
        clientType,
      });

      if (!uploaded.success) {
        throw new Error(uploaded.error ?? "Upload failed");
      }

      fileMatch.parent[fileMatch.key] = uploaded.data;
    }

    return result;
  };

  /**
   * PROCESS UPDATE TREE
   */
  const processUpdateTree: BaseStorageInstance["processUpdateTree"] = async ({
    databaseSnapshot,
    payload,
    payloadKey,
    clientType = "server",
  }) => {
    const result = { ...payload };

    const oldUrls = collectUrls(databaseSnapshot, [], bucketName, groupFolder);

    const folderSlug = getFolderSlug(
      {
        ...databaseSnapshot,
        ...result,
      },
      payloadKey,
    );

    const files = collectFiles(result, []);

    for (const fileMatch of files) {
      const uploaded = await upload({
        file: fileMatch.file,
        path: folderSlug,
        clientType,
      });

      if (!uploaded.success) {
        throw new Error(uploaded.error ?? "Upload failed");
      }

      fileMatch.parent[fileMatch.key] = uploaded.data;
    }

    const remainingUrls = new Set(
      collectUrls(result, [], bucketName, groupFolder),
    );

    for (const oldUrl of oldUrls) {
      if (!remainingUrls.has(oldUrl)) {
        await remove({
          fileUrl: oldUrl,
          clientType,
        });
      }
    }

    return result;
  };

  return {
    upload,
    remove,
    removeTree,
    processUploadTree,
    processUpdateTree,
    hasBinaryAssets,
  };
}

export function hasBinaryAssets(payload: PayloadRecord): boolean {
  return collectFiles(payload, []).length > 0;
}

/**
 * RECURSIVE HELPER: Deeply scans the incoming payload cargo object
 * to extract raw binary File attachments for processing.
 */
function collectFiles(
  obj: PayloadRecord,
  discoveredFiles: DiscoveredFile[],
): DiscoveredFile[] {
  for (const key of Object.keys(obj)) {
    const value = obj[key];

    if (value instanceof File) {
      discoveredFiles.push({
        parent: obj,
        key,
        file: value,
      });
    } else if (value && typeof value === "object") {
      collectFiles(value as PayloadRecord, discoveredFiles);
    }
  }

  return discoveredFiles;
}

/**
 * RECURSIVE HELPER: Scans data structures to gather infrastructure URLs
 * that explicitly match your bucket and structural group layout.
 */
function collectUrls(
  obj: PayloadRecord,
  urls: string[] = [],
  bucket: string,
  groupFolder: string,
): string[] {
  for (const key of Object.keys(obj)) {
    const value = obj[key];

    if (typeof value === "string") {
      const isHttp =
        value.startsWith("http://") || value.startsWith("https://");

      const isOurAsset =
        value.includes("supabase.co") &&
        value.includes(`/${bucket}/${groupFolder}`);

      if (isHttp && isOurAsset) {
        urls.push(value);
      }
    } else if (value && typeof value === "object") {
      collectUrls(value as PayloadRecord, urls, bucket, groupFolder);
    }
  }

  return urls;
}

/**
 * STRING CLEANUP UTILITY
 */
function cleanString(str: string): string {
  return str
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9.\-_/\s]/g, "")
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getFinalPath(
  file: File | Blob | Buffer,
  path?: string,
  groupFolder?: string,
) {
  const rawFileName = cleanString((file as File).name);
  const cleanPath = cleanString(path ?? "");
  const uniqueId = Date.now();
  const lastDotIndex = rawFileName.lastIndexOf(".");
  const namePart =
    lastDotIndex !== -1 ? rawFileName.substring(0, lastDotIndex) : rawFileName;
  const extPart =
    lastDotIndex !== -1 ? rawFileName.substring(lastDotIndex) : "";
  const finalPath = `${groupFolder}/${cleanPath}/${namePart}-id-${uniqueId}${extPart}`;

  return finalPath;
}
