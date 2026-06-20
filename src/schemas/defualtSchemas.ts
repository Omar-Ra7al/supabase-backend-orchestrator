import z from "zod";

export const imageSchema = ({ maxFiles = 5, maxSizeMB = 5 }) => {
  return z
    .transform((val) => {
      if (!val) return [];
      if (val instanceof FileList) return Array.from(val);
      if (Array.isArray(val)) return val;
      return [val]; // Wrap single string/file in array for validation
    })
    .refine((files) => files.length > 0, "At least one image is required")
    .refine(
      (files) => files.length <= maxFiles,
      `Maximum ${maxFiles} images allowed`,
    )
    .refine(
      (files) =>
        files.every((file) => {
          if (typeof file === "string") return true; // URLs are already optimized
          return file.size <= maxSizeMB * 1024 * 1024;
        }),
      `Each file must be less than ${maxSizeMB}MB`,
    )
    .transform((files) => {
      // Logic: If maxFiles is 1, return the item directly (string or File)
      // Otherwise, return the array
      if (maxFiles === 1) {
        return files[0];
      }
      return files;
    });
};
