"use server";

import { unstable_cache } from "next/cache";
import { ProjectSchemaTypes } from "@/schemas/projectSchema";
import { projectConfig, projectService } from "@/services/entities/projects";

export const createProject = async ({
  payload,
}: {
  payload: ProjectSchemaTypes;
}) => {
  return projectService.create({ payload });
};

export const updateProject = async ({
  id,
  payload,
}: {
  id: number;
  payload: ProjectSchemaTypes;
}) => {
  return projectService.update({ id, payload });
};

export const deleteProject = async ({ id }: { id: number }) => {
  return projectService.remove({ id });
};

export const saveProjectsSort = async ({ ids }: { ids: number[] }) => {
  return projectService.saveSort({ ids });
};

export const getSortedProjects = async () => {
  // return featureService.getAllSorted<YourRecord>({});
  return projectService.getAllSorted({});
};

export const getSortedFeaturesCached = unstable_cache(
  // async () => featureService.getAllSorted<YourRecord>({}),
  async () => projectService.getAllSorted({}),
  ["sorted-your-feature"],
  { tags: [projectConfig.dbServiceConfig.cacheTag ?? ""] },
);
