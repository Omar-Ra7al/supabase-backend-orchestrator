"use client";

import { ZodForm } from "zod-form-engine";

import { ProjectSchemaTypes, projectSchema } from "@/schemas/projectSchema";
import {
  createProjectWithServerClient,
  createProjectWithAdminClient,
  createProjectWithPublicClient,
} from "@/services/entities/projects/server";
import { useProjectService } from "@/services/entities/projects/client";

const ProjectForm = () => {
  const projectService = useProjectService();

  const handleSubmit = async (data: ProjectSchemaTypes) => {
    // const res = await createProjectWithServerClient({ payload: data });
    const res = await createProjectWithAdminClient({ payload: data });
    // const res = await createProjectWithPublicClient({ payload: data });
    // const res = await projectService.createProject({ ...data });

    console.log(res);
  };

  return (
    <ZodForm
      zodSchema={projectSchema}
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-card p-4 rounded-lg"
      submitConfig={{ submitLabel: "Create Project" }}
    />
  );
};

export default ProjectForm;
