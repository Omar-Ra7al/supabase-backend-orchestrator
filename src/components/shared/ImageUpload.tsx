"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

type ItemType = File | string;

type Props = {
  id?: string;
  value?: ItemType | ItemType[];
  onChange: (value: ItemType | ItemType[] | null) => void;
  maxFiles?: number;
  className?: string;
};

export const ImageUpload = ({
  id,
  value,
  onChange,
  maxFiles = 1,
  className,
}: Props) => {
  const multiple = maxFiles > 1;

  // Normalize incoming value to an array for internal rendering
  const items = Array.isArray(value) ? value : value ? [value] : [];

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);

    if (multiple) {
      // Return Array
      onChange([...items, ...newFiles].slice(0, maxFiles));
    } else {
      // Return Single Item
      onChange(newFiles[0]);
    }
    e.target.value = "";
  };

  const handleRemove = (indexToRemove: number) => {
    const filtered = items.filter((_, i) => i !== indexToRemove);

    if (!multiple) {
      onChange(null); // Clear single value
    } else {
      onChange(filtered.length > 0 ? filtered : null);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed border-border/60 p-4 transition-colors hover:border-primary",
          className,
        )}
      >
        <input
          id={id}
          type="file"
          multiple={multiple}
          accept="image/*"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={handleAddFiles}
        />
        <div className="text-center text-gray-400 py-2">
          <p className="text-sm font-medium">
            {multiple ? `Upload up to ${maxFiles} images` : "Upload image"}
          </p>
        </div>
      </div>

      {/* Image || Images Preview */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {items.map((item, index) => (
            <div className="group relative h-20 w-20" key={index}>
              <Image
                src={
                  typeof item === "string" ? item : URL.createObjectURL(item)
                }
                alt="preview"
                fill
                className="rounded-md object-cover border border-border"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow-sm hover:scale-110 transition-transform"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
