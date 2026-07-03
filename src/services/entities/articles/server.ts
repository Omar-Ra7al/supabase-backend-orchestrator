"use server";

import { getArticleService } from "./core";
import type { ArticleRecord, ArticleSchemaTypes } from "@/schemas/articleSchema";

/**
 * Single-client server actions for the `articles` entity. Every call resolves
 * the authenticated server client per request via `getArticleService()`.
 *
 * Import these actions from components — never import the entity service directly.
 */

// CREATE
export const createArticle = async ({ payload }: { payload: ArticleSchemaTypes }) => {
  const service = await getArticleService();
  return service.create({ payload });
};

// GET ALL
export const getArticles = async () => {
  const service = await getArticleService();
  return service.getAll<ArticleRecord>({});
};

// GET BY ID
export const getArticleById = async ({ id }: { id: number }) => {
  const service = await getArticleService();
  return service.getById<ArticleRecord>({ id });
};

// GET WITH QUERY (single match)
export const getArticle = async ({ where }: { where: Partial<ArticleRecord> }) => {
  const service = await getArticleService();
  return service.get<ArticleRecord>({ where, shape: "single" });
};

// UPDATE
export const updateArticle = async ({
  id,
  payload,
}: {
  id: number;
  payload: ArticleSchemaTypes;
}) => {
  const service = await getArticleService();
  return service.update({ id, payload });
};

// REMOVE
export const deleteArticle = async ({ id }: { id: number }) => {
  const service = await getArticleService();
  return service.remove({ id });
};
