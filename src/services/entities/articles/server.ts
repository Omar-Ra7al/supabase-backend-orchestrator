"use server";

import { getArticleService } from "./core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createArticle = async (payload: any) => {
  const service = await getArticleService();
  return await service.create({ payload });
};
