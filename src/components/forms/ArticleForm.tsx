"use client";

import { ZodForm } from "zod-form-engine";

import { ArticleSchemaTypes, articleSchema } from "@/schemas/articleSchema";
import { createArticle } from "@/services/entities/articles/server";

const ArticleForm = () => {
  const handleSubmit = async (data: ArticleSchemaTypes) => {
    const res = await createArticle({ payload: data });

    console.log(res);
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      <ZodForm
        zodSchema={articleSchema}
        onSubmit={handleSubmit}
        className="w-full bg-card p-4 rounded-lg"
        submitConfig={{ submitLabel: "Create Article" }}
      />
    </div>
  );
};

export default ArticleForm;
