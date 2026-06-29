"use client";

import { ZodForm } from "zod-form-engine";
import { ProjectSchemaTypes, projectSchema } from "@/schemas/projectSchema";
import { useProjectService } from "@/services/entities/projects/client";

const Form = () => {
  const projectService = useProjectService();

  const handleSubmit = async (data: ProjectSchemaTypes) => {
    const project = await projectService.createProject(data);
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
