"use server";

import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import { createPublicServerClient } from "@/lib/supabase/publicServer";

import { generateProjectService } from "./core";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProjectSchemaTypes } from "@/schemas/projectSchema";

const getProjectServerService = async (customClient?: SupabaseClient) => {
  const client = customClient ?? (await createServerClient());
  const service = generateProjectService(
    client,
    revalidateTag as (tag: string) => void,
  );
  return service;
};

export const createProject = async ({
  payload,
}: {
  payload: ProjectSchemaTypes;
}) => {
  const projectService = await getProjectServerService();
  return await projectService.create({ payload });
};

export const createProjectAsAdmin = async ({
  payload,
}: {
  payload: ProjectSchemaTypes;
}) => {
  const projectService = await getProjectServerService(createAdminClient());
  return await projectService.create({ payload });
};

export const createProjectAsPublic = async ({
  payload,
}: {
  payload: ProjectSchemaTypes;
}) => {
  const projectService = await getProjectServerService(
    createPublicServerClient(),
  );
  return await projectService.create({ payload });
};
