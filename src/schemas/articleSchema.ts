import { z } from "zod";
import { imageSchema } from "./defualtSchemas";
import { field } from "zod-form-engine";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/ImageUpload";

export const articleSchema = z.object({
  title: field(z.string("Title is required").min(1, "Title is required"), {
    label: "Title",
    component: Input,
    props: { placeholder: "Title..." },
  }),

  image: field(imageSchema({ maxFiles: 1, maxSizeMB: 3 }), {
    label: "Image",
    component: ImageUpload,
  }),
});

export type ArticleSchemaTypes = z.infer<typeof articleSchema>;

export type ArticleRecord = ArticleSchemaTypes & { id: number };
