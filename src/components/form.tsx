"use client";

import { ZodForm } from "@omar-ra7al/zod-form";
import { ProjectSchemaTypes, projectSchema } from "@/schemas/projectSchema";
import { createProject } from "@/services/entities/projects/actions";

const Form = () => {
  const handleSubmit = async (data: ProjectSchemaTypes) => {
    console.log(data);
    const {
      data: projectData,
      success,
      error,
    } = await createProject({ payload: data });

    if (success) {
      console.log(projectData);
    } else {
      console.log(error);
    }
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
