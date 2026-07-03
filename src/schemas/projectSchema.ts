import { z } from "zod";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { imageSchema } from "./defualtSchemas";
import { Textarea } from "@/components/ui/textarea";
import { field } from "zod-form-engine";

const maxFiles = 1;

export const projectSchema = z.object({
  slug: field(z.string("Slug is required").min(1, "Slug is required"), {
    label: "Slug",
    component: Input,
    props: { placeholder: "Slug..." },
  }),

  title: field(z.string("Title is required").min(1, "Title is required"), {
    label: "Title",
    component: Input,
    props: { placeholder: "Title..." },
  }),

  description: field(z.string("Description is required").min(1, "Description is required"), {
    label: "Description",
    component: Textarea,
    props: { placeholder: "Description..." },
  }),

  image: field(imageSchema({ maxFiles, maxSizeMB: 3 }), {
    label: "Image",
    component: ImageUpload,
    props: {
      maxFiles,
    },
  }),
});

export type ProjectSchemaTypes = z.infer<typeof projectSchema>;

export type ProjectRecord = ProjectSchemaTypes & { id: number };
