#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import {
  pkgRoot,
  detectBase,
  nameForms,
  applyPlaceholders,
  copyDir,
  selectMenu,
  confirmMenu,
} from "./utils.mjs";

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

function isForce(args) {
  return args.some((a) => a === "--force" || a === "-y" || a === "--yes");
}

const argv = process.argv.slice(2);
const command = argv[0];

if (command === "examples") {
  await runExamples(argv.slice(1));
} else if (command === "entity" || command === "generate" || command === "add") {
  await runEntity(argv.slice(1));
} else if (command === "--help" || command === "-h" || command === "help") {
  printHelp();
} else if (command && !command.startsWith("-")) {
  // positional: `<dir> <feature-name>` or `<feature-name>`
  await runEntity(argv);
} else {
  await runScaffold(argv);
}

/**
 * Decide what to do with a copy target WITHOUT touching the filesystem: verify
 * the payload exists, check whether `to` already exists, and (unless `force`)
 * prompt with an arrow-key menu to overwrite or skip. Returns a plan object to
 * hand to `applyCopy`.
 */
async function planCopy({ from, to, force, cwd, filter, transform }) {
  if (!existsSync(from)) fail(`Package payload missing: ${from}`);

  const exists = existsSync(to);
  const rel = relative(cwd, to) || to;
  let skip = false;

  if (exists && !force) {
    const action = await selectMenu({
      message: `${rel} already exists. Overwrite?`,
      options: [
        { value: "overwrite", label: "Overwrite", hint: "replace existing files" },
        { value: "skip", label: "Skip", hint: "leave it untouched" },
      ],
    });
    skip = action === "skip";
  }

  return { from, to, cwd, exists, skip, filter, transform, rel };
}

/**
 * Execute a plan produced by `planCopy`. Copies with `prune` so template files
 * are written first and stale leftovers removed after (no delete-then-recreate).
 * Returns "created" | "overwrote" | "skipped".
 */
async function applyCopy(plan) {
  const { from, to, exists, skip, filter, transform, rel } = plan;

  if (skip) {
    console.log(`  skipped ${rel}`);
    return "skipped";
  }

  await copyDir(from, to, { filter, transform, prune: true });
  const status = exists ? "overwrote" : "created";
  console.log(`  ${status} ${rel}`);
  return status;
}

const SHARED_TYPE_FROM_RESOLVER = `import type { ServerClientType } from "@/services/core/runtime/serverResolver";

export type { ServerClientType };`;

const SHARED_TYPE_INLINE = `export type ServerClientType = "server" | "public" | "admin";`;

/**
 * Inline ServerClientType in the copied types/shared.ts so core types work
 * when services/core/runtime/ is omitted (direct client binding).
 */
async function patchSharedTypesForDirectMode(base) {
  const sharedPath = join(base, "services/core/types/shared.ts");
  if (!existsSync(sharedPath)) return;

  const content = await readFile(sharedPath, "utf8");
  if (!content.includes(SHARED_TYPE_FROM_RESOLVER)) return;

  await writeFile(
    sharedPath,
    content.replace(SHARED_TYPE_FROM_RESOLVER, SHARED_TYPE_INLINE),
    "utf8",
  );
}

/**
 * DEFAULT: scaffold services/core into the user's project, then offer to
 * initialize the Supabase client factories (lib/supabase). Prompts use
 * arrow-key menus; pass `--force` / `-y` to skip them in CI.
 */
async function runScaffold(args) {
  const force = isForce(args);
  const cwd = process.cwd();
  const base = detectBase(cwd);

  // Existence check first: resolve the always-present target before any question.
  const corePlan = await planCopy({
    from: join(pkgRoot, "src/services/core"),
    to: join(base, "services/core"),
    force,
    cwd,
  });

  const initClients = force
    ? true
    : await confirmMenu({
        message: "Init the Supabase clients for you (lib/supabase)?",
        active: "Yes, create them",
        inactive: "No, I have my own",
        initialValue: true,
      });

  // lib/supabase is only a target when initClients — resolve its existence
  // prompt right after that question, still before the remaining config question.
  let libPlan = null;
  if (initClients) {
    libPlan = await planCopy({
      from: join(pkgRoot, "src/lib/supabase"),
      to: join(base, "lib/supabase"),
      force,
      cwd,
    });
  }

  let clientMode = "bundled";
  if (!initClients) {
    clientMode = force
      ? "wire-resolver"
      : await selectMenu({
          message: "How will you connect your Supabase clients?",
          options: [
            {
              value: "wire-resolver",
              label: "Wire them into serverResolver.ts",
              hint: "recommended for multi-client + runWithService",
            },
            {
              value: "direct",
              label: "Pass clients directly in entity files",
              hint: "skip runtime; bind clients in core.ts / server.ts / client.ts",
            },
          ],
          initialValue: "wire-resolver",
        });
  }

  corePlan.filter = clientMode === "direct" ? new Set(["runtime"]) : undefined;
  await applyCopy(corePlan);

  if (clientMode === "direct") {
    await patchSharedTypesForDirectMode(base);
  }

  if (libPlan) {
    await applyCopy(libPlan);
  }

  printScaffoldSummary(base, cwd, { initClients, clientMode });
}

/**
 * `examples` — copy the runnable demos and starting points into
 * services/entities: projects, articles, standalone-factories, templates.
 */
async function runExamples(args) {
  const force = isForce(args);
  const cwd = process.cwd();
  const base = detectBase(cwd);

  const names = ["projects", "articles", "standalone-factories", "templates"];

  // Resolve every overwrite prompt up front, then copy — no prompts mid-copy.
  const plans = [];
  for (const name of names) {
    plans.push(
      await planCopy({
        from: join(pkgRoot, "src/services/entities", name),
        to: join(base, "services/entities", name),
        force,
        cwd,
      }),
    );
  }

  for (const plan of plans) {
    await applyCopy(plan);
  }

  console.log("\n  Examples copied into services/entities:");
  console.log("   - projects/              live multi-client example");
  console.log("   - articles/              live single-client example");
  console.log("   - standalone-factories/  use one factory alone (db / storage / sorting)");
  console.log("   - templates/             single-client/ and multi-client/ starters\n");
}

/**
 * Generate a new feature from the bundled template. Accepts an optional target
 * directory as the first positional (defaults to the preferred
 * `services/entities`); single vs multi client is chosen via a select menu.
 *
 *   <dir> <feature-name>
 *   <feature-name>
 *   entity <feature-name> [multi]   (backward-compatible alias)
 */
async function runEntity(args) {
  const force = isForce(args);
  const isMulti = (a) => /^(--)?multi(-client)?$/.test(a);
  const isSingle = (a) => /^(--)?single(-client)?$/.test(a);

  const explicitMulti = args.some(isMulti);
  const explicitSingle = args.some(isSingle);

  const positionals = args.filter(
    (a) => !a.startsWith("-") && !isMulti(a) && !isSingle(a),
  );

  let targetDir = "services/entities";
  let rawName;

  if (positionals.length >= 2) {
    [targetDir, rawName] = positionals;
  } else {
    [rawName] = positionals;
  }

  if (!rawName) {
    fail(
      "Usage: npx create-supabase-orchestrator [<dir>] <feature-name>\n" +
        "  e.g. npx create-supabase-orchestrator blog\n" +
        "       npx create-supabase-orchestrator services/features blog\n" +
        "  (target dir defaults to services/entities)",
    );
  }

  if (!/^[a-zA-Z][a-zA-Z0-9-_ ]*$/.test(rawName)) {
    fail(`Invalid feature name: "${rawName}". Use letters, numbers, "-" or "_".`);
  }

  const forms = nameForms(rawName);
  const base = detectBase(process.cwd());
  const targetPath = join(base, targetDir, forms.kebab);
  const rel = relative(process.cwd(), targetPath);

  const exists = existsSync(targetPath);
  if (exists && !force) {
    const action = await selectMenu({
      message: `${rel} already exists. Overwrite?`,
      options: [
        { value: "overwrite", label: "Overwrite", hint: "replace existing files" },
        { value: "cancel", label: "Cancel", hint: "keep it, no changes" },
      ],
      initialValue: "cancel",
    });
    if (action !== "overwrite") {
      console.log("\n  Cancelled. No changes made.\n");
      process.exit(0);
    }
  }

  let multi = explicitMulti;
  if (!explicitMulti && !explicitSingle) {
    const pattern = await selectMenu({
      message: "Which client pattern?",
      options: [
        {
          value: "single",
          label: "Single-client",
          hint: "server-only, core.ts + server.ts",
        },
        {
          value: "multi",
          label: "Multi-client",
          hint: "browser + admin + public, adds client.ts",
        },
      ],
      initialValue: "single",
    });
    multi = pattern === "multi";
  }

  const template = multi ? "multi-client" : "single-client";
  const templatePath = join(pkgRoot, "src/services/entities/templates", template);
  if (!existsSync(templatePath)) {
    fail(`Template not found: ${templatePath}`);
  }

  await copyDir(templatePath, targetPath, {
    transform: (raw) => applyPlaceholders(raw, forms),
    prune: true,
  });

  console.log(
    `\n  ${exists ? "Overwrote" : "Created"} ${rel} from the ${template} template.`,
  );
  console.log("\n  Next steps:");
  console.log(
    "   1. Replace domain placeholders (your_table, your-cache-tag, YourData, YourRecord, ...)",
  );
  console.log("   2. Add your payload/record type definitions in @/schemas/");
  console.log(
    "   3. Import actions from server.ts (and the hook from client.ts) in components.\n",
  );
}

function printScaffoldSummary(base, cwd, { initClients, clientMode }) {
  const baseRel = relative(cwd, base) || ".";
  const corePrefix =
    baseRel === "." ? "services/core" : `${baseRel}/services/core`;

  console.log("\n  Done. Make sure your project is ready:");
  console.log(
    `   - tsconfig.json paths: { "@/*": ["./${baseRel === "." ? "" : baseRel + "/"}*"] }`,
  );
  console.log(
    "   - install peer deps: npm i @supabase/supabase-js @supabase/ssr next",
  );

  if (clientMode === "wire-resolver") {
    console.log(
      `   - update ${corePrefix}/runtime/serverResolver.ts: point @/lib/supabase/* imports at your client factories`,
    );
    console.log(
      "   - when generating entities, update core.ts / client.ts imports to your client paths",
    );
    console.log(
      "   - multi-client entities keep createServiceRunner + runWithService(clientType, action)",
    );
  } else if (clientMode === "direct") {
    console.log(
      "   - services/core/runtime/ was skipped — bind clients in each entity's core.ts / server.ts / client.ts",
    );
    console.log(
      "   - do not use createServiceRunner; call generateFeatureService(yourClient(), updateTag) per action",
    );
    console.log(
      "   - cached reads: pass your cookie-free public client directly inside unstable_cache",
    );
  }

  console.log(
    "   - grab the examples: npx create-supabase-orchestrator examples",
  );
  console.log(
    "   - generate a feature: npx create-supabase-orchestrator [<dir>] <feature-name>\n",
  );
}

function printHelp() {
  console.log(`
  create-supabase-orchestrator

  Usage:
    npx create-supabase-orchestrator [--force]
        Scaffold services/core into the current project (src/ is used
        automatically when present), then choose whether to init the
        Supabase clients (lib/supabase) or bring your own.

    npx create-supabase-orchestrator examples
        Copy the runnable demos and starters into services/entities:
        projects, articles, standalone-factories, templates.

    npx create-supabase-orchestrator [<dir>] <feature-name>
        Generate a new feature. The target dir defaults to
        services/entities; single vs multi client is chosen via a menu.

  Flags:
    --force, -y   Skip interactive menus (overwrite in place, init clients).
`);
}
