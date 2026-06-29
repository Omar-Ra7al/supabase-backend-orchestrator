#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  nameForms,
  applyPlaceholders,
  copyDir,
} from "../bin/utils.mjs";

// Local dev helper: generates into THIS repo's own src/services/entities.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const templatesDir = join(repoRoot, "src/services/entities/templates");
const entitiesDir = join(repoRoot, "src/services/entities");

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

const args = process.argv.slice(2);
const isMulti = (a) => /^(--)?multi(-client)?$/.test(a);
const isSingle = (a) => /^(--)?single(-client)?$/.test(a);
// Tolerate `--multi` being eaten by npm; accept it as a positional too.
const multi = args.some(isMulti);
const rawName = args.find(
  (a) => !a.startsWith("-") && !isMulti(a) && !isSingle(a),
);

if (!rawName) {
  fail(
    "Usage: npm run entity:generate <name> [multi]\n  e.g. npm run entity:generate blog\n       npm run entity:generate blog multi",
  );
}

if (!/^[a-zA-Z][a-zA-Z0-9-_ ]*$/.test(rawName)) {
  fail(`Invalid entity name: "${rawName}". Use letters, numbers, "-" or "_".`);
}

const template = multi ? "multi-client" : "single-client";
const templatePath = join(templatesDir, template);

if (!existsSync(templatePath)) {
  fail(`Template not found: ${templatePath}`);
}

const forms = nameForms(rawName);
const targetPath = join(entitiesDir, forms.kebab);

if (existsSync(targetPath)) {
  fail(
    `Entity already exists: src/services/entities/${forms.kebab} (refusing to overwrite).`,
  );
}

await copyDir(templatePath, targetPath, {
  transform: (raw) => applyPlaceholders(raw, forms),
});

console.log(
  `\n  Created src/services/entities/${forms.kebab} from ${template} template.`,
);
console.log("\n  Next steps:");
console.log(
  "   1. Replace domain placeholders (your_table, your-cache-tag, YourData, YourRecord, ...)",
);
console.log("   2. Add your payload/record type definitions in @/schemas/");
console.log(
  "   3. Import actions from server.ts (and the hook from client.ts) in components.\n",
);
