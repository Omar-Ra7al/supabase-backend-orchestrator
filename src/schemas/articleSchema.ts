import { z } from "zod";

export const articleSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export type ArticleSchemaTypes = z.infer<typeof articleSchema>;
