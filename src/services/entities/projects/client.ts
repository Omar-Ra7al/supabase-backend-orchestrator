"use client";

import { useMemo } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { generateProjectService } from "./core";
import { ProjectSchemaTypes } from "@/schemas/projectSchema";

export const useProjectService = () => {
  // Safely initialize once per component
  const browserClient = useMemo(() => createBrowserClient(), []);

  // Bind to the service
  const service = useMemo(
    () => generateProjectService(browserClient),
    [browserClient],
  );

  const createProject = (payload: ProjectSchemaTypes) =>
    service.create({ payload });

  return { service, createProject };
};
