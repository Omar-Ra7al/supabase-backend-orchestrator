"use client";

import { ZodForm } from "zod-form-engine";
import { ProjectSchemaTypes, projectSchema } from "@/schemas/projectSchema";
// import { useProjectService } from "@/services/entities/projects/client";
import {
  // createProjectWithServerClient,
  // createProjectWithAdminClient,
  createProjectWithPublicClient,
} from "@/services/entities/projects/server";

const Form = () => {
  // const projectService = useProjectService();

  const handleSubmit = async (data: ProjectSchemaTypes) => {
    const project = await createProjectWithPublicClient({ payload: data });
    console.log(project);
  };

  return (
    <ZodForm
      zodSchema={projectSchema}
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-card p-4 rounded-lg"
    />
  );
};

export default Form;
