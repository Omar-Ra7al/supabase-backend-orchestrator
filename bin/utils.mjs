import { readdir, mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";

/** Root of this installed package (one level up from bin/). */
export const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Where files should be written in the user's project: `src/` when it
 * exists, otherwise the project root.
 */
export function detectBase(cwd = process.cwd()) {
  return existsSync(join(cwd, "src")) ? join(cwd, "src") : cwd;
}

/** Build kebab / camel / Pascal forms from a raw entity name. */
export function nameForms(raw) {
  const words = raw
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.toLowerCase());

  return {
    kebab: words.join("-"),
    camel: words
      .map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1)))
      .join(""),
    pascal: words.map((w) => w[0].toUpperCase() + w.slice(1)).join(""),
  };
}

/**
 * Swap template placeholders for the given name forms.
 * Ordered so the kebab "your-feature" wins before the bare "feature".
 */
export function applyPlaceholders(content, { kebab, camel, pascal }) {
  return content
    .replace(/your-feature/g, kebab)
    .replace(/Feature/g, pascal)
    .replace(/feature/g, camel);
}

/**
 * Recursively copy `from` -> `to`. Pass `transform` to rewrite text file
 * contents (used for placeholder swapping during entity generation).
 * Pass `filter` (a Set of names) to skip matching top-level entries only.
 */
export async function copyDir(from, to, { transform, filter } = {}) {
  await mkdir(to, { recursive: true });
  const entries = await readdir(from);
  for (const entry of entries) {
    if (filter && filter.has(entry)) continue;
    const src = join(from, entry);
    const dest = join(to, entry);
    const info = await stat(src);
    if (info.isDirectory()) {
      // `filter` applies to top-level entries only, not recursively
      await copyDir(src, dest, { transform });
    } else {
      const raw = await readFile(src, "utf8");
      await writeFile(dest, transform ? transform(raw) : raw, "utf8");
    }
  }
}

/** Ask a single question on the terminal and resolve the trimmed answer. */
export async function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(question);
    return answer.trim();
  } finally {
    rl.close();
  }
}
