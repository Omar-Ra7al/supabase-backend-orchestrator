import { createEntityService } from "@/services/core/entity";
import { EntityServiceConfig } from "@/services/core/types";

/**
 * Copy this folder to `services/entities/your-feature/` and replace placeholders.
 */
export const projectConfig: EntityServiceConfig = {
  dbServiceConfig: {
    tableName: "projects",
    cacheTag: "projects",
    primaryKey: "id",
  },
  storageServiceConfig: {
    bucketName: "test",
    groupFolder: "projects",
  },
  sortingServiceConfig: {
    tableName: "sort",
    sortRowId: "projects",
    primaryKey: "column_id",
  },
};

export const projectService = createEntityService(projectConfig);
