import { readdir, mkdir, readFile, writeFile, stat, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import {
  select as clackSelect,
  confirm as clackConfirm,
  isCancel,
  cancel,
} from "@clack/prompts";

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
 * Pass `prune: true` to remove top-level entries in `to` that were not copied
 * from `from` (safe overwrite: files are written first, then stale leftovers
 * removed — avoids the delete-then-recreate race that can drop fresh files on
 * mounted volumes).
 */
export async function copyDir(from, to, { transform, filter, prune } = {}) {
  await mkdir(to, { recursive: true });
  const entries = await readdir(from);
  const copied = new Set();
  for (const entry of entries) {
    if (filter && filter.has(entry)) continue;
    copied.add(entry);
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
  if (prune) {
    for (const existing of await readdir(to)) {
      if (!copied.has(existing)) {
        await rm(join(to, existing), { recursive: true, force: true });
      }
    }
  }
}

/**
 * Recursively delete `target` if it exists. Used before overwriting so stale
 * files (e.g. multi-client `client.ts`) don't survive a switch to a template
 * that no longer includes them.
 */
export async function cleanDir(target) {
  await rm(target, { recursive: true, force: true });
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

/** Bail out cleanly when the user cancels a prompt (Ctrl+C / Esc). */
function guardCancel(value) {
  if (isCancel(value)) {
    cancel("Cancelled. No changes made.");
    process.exit(0);
  }
  return value;
}

/**
 * Arrow-key select menu. `options` is `[{ value, label, hint? }]`.
 * Returns the chosen `value`; exits cleanly on cancel.
 */
export async function selectMenu({ message, options, initialValue }) {
  const choice = await clackSelect({ message, options, initialValue });
  return guardCancel(choice);
}

/** Yes/No confirm menu. Returns a boolean; exits cleanly on cancel. */
export async function confirmMenu({ message, active, inactive, initialValue }) {
  const answer = await clackConfirm({
    message,
    active,
    inactive,
    initialValue,
  });
  return guardCancel(answer);
}
