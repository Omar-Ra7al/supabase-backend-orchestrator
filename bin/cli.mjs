#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import {
  pkgRoot,
  detectBase,
  nameForms,
  applyPlaceholders,
  copyDir,
  prompt,
} from "./utils.mjs";

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

const argv = process.argv.slice(2);
const command = argv[0];

if (command === "entity" || command === "generate" || command === "add") {
  await runEntity(argv.slice(1));
} else if (command === "--help" || command === "-h" || command === "help") {
  printHelp();
} else {
  await runScaffold(argv);
}

/**
 * DEFAULT: scaffold services/core, services/entities, and lib/supabase into
 * the user's project. Creates what's missing; prompts overwrite-or-cancel
 * when any target already exists.
 */
async function runScaffold(args) {
  const force = args.some((a) => a === "--force" || a === "-y" || a === "--yes");
  const cwd = process.cwd();
  const base = detectBase(cwd);

  // source -> target mappings (target is absolute, in the user's project)
  const jobs = [
    {
      label: "services/core",
      from: join(pkgRoot, "src/services/core"),
      to: join(base, "services/core"),
    },
    {
      label: "services/entities",
      from: join(pkgRoot, "src/services/entities"),
      to: join(base, "services/entities"),
      // skip repo-specific demos; ship the reusable starting points only
      skip: new Set(["projects", "articles"]),
    },
    {
      label: "lib/supabase",
      from: join(pkgRoot, "src/lib/supabase"),
      to: join(base, "lib/supabase"),
    },
  ];

  for (const job of jobs) {
    if (!existsSync(job.from)) {
      fail(`Package payload missing: ${job.from}`);
    }
  }

  const existing = jobs.filter((job) => existsSync(job.to));

  if (existing.length && !force) {
    console.log("\n  These already exist in your project:");
    for (const job of existing) {
      console.log(`    - ${relative(cwd, job.to) || job.label}`);
    }
    const answer = (
      await prompt("\n  Overwrite them? Type 'overwrite' to proceed, anything else cancels: ")
    ).toLowerCase();

    if (answer !== "overwrite" && answer !== "o") {
      console.log("\n  Cancelled. No changes made.\n");
      process.exit(0);
    }
  }

  for (const job of jobs) {
    await copyDir(job.from, job.to, {
      filter: job.skip,
    });
    const status = existing.includes(job) ? "overwrote" : "created";
    console.log(`  ${status} ${relative(cwd, job.to) || job.label}`);
  }

  printScaffoldSummary(base, cwd);
}

/**
 * `entity <name> [multi]` — generate a new entity from the bundled template
 * into the user's project.
 */
async function runEntity(args) {
  const isMulti = (a) => /^(--)?multi(-client)?$/.test(a);
  const isSingle = (a) => /^(--)?single(-client)?$/.test(a);
  const multi = args.some(isMulti);
  const rawName = args.find(
    (a) => !a.startsWith("-") && !isMulti(a) && !isSingle(a),
  );

  if (!rawName) {
    fail(
      "Usage: npx create-supabase-orchestrator entity <name> [multi]\n" +
        "  e.g. npx create-supabase-orchestrator entity blog\n" +
        "       npx create-supabase-orchestrator entity blog multi",
    );
  }

  if (!/^[a-zA-Z][a-zA-Z0-9-_ ]*$/.test(rawName)) {
    fail(`Invalid entity name: "${rawName}". Use letters, numbers, "-" or "_".`);
  }

  const template = multi ? "multi-client" : "single-client";
  const templatePath = join(
    pkgRoot,
    "src/services/entities/templates",
    template,
  );
  if (!existsSync(templatePath)) {
    fail(`Template not found: ${templatePath}`);
  }

  const forms = nameForms(rawName);
  const base = detectBase(process.cwd());
  const targetPath = join(base, "services/entities", forms.kebab);

  if (existsSync(targetPath)) {
    fail(
      `Entity already exists: ${relative(process.cwd(), targetPath)} (refusing to overwrite).`,
    );
  }

  await copyDir(templatePath, targetPath, {
    transform: (raw) => applyPlaceholders(raw, forms),
  });

  const rel = relative(process.cwd(), targetPath);
  console.log(`\n  Created ${rel} from the ${template} template.`);
  console.log("\n  Next steps:");
  console.log(
    "   1. Replace domain placeholders (your_table, your-cache-tag, YourData, YourRecord, ...)",
  );
  console.log("   2. Add your payload/record type definitions in @/schemas/");
  console.log(
    "   3. Import actions from server.ts (and the hook from client.ts) in components.\n",
  );
}

function printScaffoldSummary(base, cwd) {
  const baseRel = relative(cwd, base) || ".";
  console.log("\n  Done. Make sure your project is ready:");
  console.log(
    `   - tsconfig.json paths: { "@/*": ["./${baseRel === "." ? "" : baseRel + "/"}*"] }`,
  );
  console.log(
    "   - install peer deps: npm i @supabase/supabase-js @supabase/ssr next",
  );
  console.log(
    "   - generate an entity: npx create-supabase-orchestrator entity <name> [multi]\n",
  );
}

function printHelp() {
  console.log(`
  create-supabase-orchestrator

  Usage:
    npx create-supabase-orchestrator [--force]
        Scaffold services/core, services/entities, and lib/supabase into
        the current project (src/ is used automatically when present).
        Prompts before overwriting anything that already exists.

    npx create-supabase-orchestrator entity <name> [multi]
        Generate a new entity from the single-client (default) or
        multi-client template.

  Flags:
    --force, -y   Skip the overwrite prompt and overwrite in place.
`);
}
