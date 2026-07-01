"use server";

import { generateProjectService } from "./core";
import { createServiceRunner } from "@/services/core/runtime/runner";
import type { ProjectSchemaTypes } from "@/schemas/projectSchema";

const runWithService = createServiceRunner(generateProjectService);

export const createProjectWithServerClient = async ({ payload }: { payload: ProjectSchemaTypes }) =>
  await runWithService("server", (service) => service.create({ payload }));

export const createProjectWithAdminClient = async ({ payload }: { payload: ProjectSchemaTypes }) =>
  await runWithService("admin", (service) => service.create({ payload }));

export const createProjectWithPublicClient = async ({ payload }: { payload: ProjectSchemaTypes }) =>
  await runWithService("public", (service) => service.create({ payload }));
