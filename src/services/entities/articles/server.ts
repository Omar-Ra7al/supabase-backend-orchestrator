"use server";

import { getArticleService } from "./core";
import { ArticleSchemaTypes } from "@/schemas/articleSchema";

export const createArticle = async (payload: ArticleSchemaTypes) => {
  const service = await getArticleService();
  return await service.create({ payload });
};
