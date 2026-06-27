import { projectService } from "./index";
import { ProjectSchemaTypes } from "@/schemas/projectSchema";

export const createProject = async ({
  payload,
}: {
  payload: ProjectSchemaTypes;
}) => {
  const project = await (await projectService({})).create({ payload });
  return project;
};
