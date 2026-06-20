import { createEntityService } from "@/services/core/entity";
import { EntityServiceConfig } from "@/services/core/types";

/**
 * Copy this folder to `services/entities/your-feature/` and replace placeholders.
 */
export const featureConfig: EntityServiceConfig = {
  dbServiceConfig: {
    tableName: "your_table",
    cacheTag: "your-cache-tag",
  },
  storageServiceConfig: {
    bucketName: "testing",
    groupFolder: "your_folder",
    payloadKey: "title",
  },
  sortingServiceConfig: {
    tableName: "sort",
    sortRowId: "your_table",
    primaryKey: "column_id",
  },
};

export const featureService = createEntityService(featureConfig);
