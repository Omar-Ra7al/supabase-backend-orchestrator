# Entity Service Layer (Supabase + Next.js)

A reusable architecture to avoid repeating CRUD logic across Supabase-backed features.

---

## Why this exists

Instead of rewriting the same code for every table (testimonials, projects, SEO…), we use:

- Shared factories in `services/core/`
- One folder per entity in `services/entities/` with `index.ts` + `actions.ts`
- Non-entity logic in `services/infrastructure/`
- Supabase client resolution in `@/lib/supabase`

---

## Folder structure

```txt
services/
├── core/
│   ├── entity.ts              # createEntityService — main factory entry (the Orchestrator)
│   ├── factories/
│   │   ├── db.ts
│   │   ├── storage.ts
│   │   └── sorting.ts
│   ├── types/
│   └── README.MD
│
├── entities/
│   ├── template/              # copy-paste starter (index + actions)
│   ├── testimonials/
│   ├── projects/
│   └── seo/
│
└── etc...
```

**Rule:** Components import from `@/services/entities/{feature}/actions` — never from `index.ts` directly.

---

## Core idea

### `index.ts` — config + factory wiring

- Entity config grouped as `db`, `storage`, and optional `sorting`
- `createEntityService()` instance from `@/services/core/entity`
- Optional query helpers (e.g. route normalization)

### `actions.ts` — business logic

- Stats, sorting orchestration, cached reads
- Cross-service workflows (e.g. delete project + SEO page)
- Manual upload logic only for nested/complex fields (e.g. JSON arrays)
- All exports use `"use server"` and return `response()`

---

## Configuration

```ts
import { createEntityService } from "@/services/core/entity";

export const featureConfig = {
  db: {
    tableName: "your_table",
    cacheTag: "your-cache-tag",
  },
  storage: {
    bucketName: "testing",
    groupFolder: "your_folder",
  },
  sorting: {
    tableName: "sort",
    sortRowId: "your_table",
    primaryKey: "column_id",
  },
} as const;

export const featureService = createEntityService({
  dbServiceConfig: featureConfig.db,
  storageServiceConfig: featureConfig.storage,
  sortingServiceConfig: featureConfig.sorting,
});
```

| Config block   | Required | Description                                                  |
| -------------- | -------- | ------------------------------------------------------------ |
| `db.tableName` | yes      | Supabase table name                                          |
| `db.cacheTag`  | yes      | Tag used for `updateTag` on writes                           |
| `storage`      | no       | Enables automatic file upload/remove on create/update/delete |
| `sorting`      | no       | Enables `getSort`, `saveSort`, `getAllSorted`                |

Omit `storageServiceConfig` or `sortingServiceConfig` when not needed (see `seo/` for storage-only, or remove both for db-only entities).

---

## Response shape

Every action returns:

```ts
{
  (success, data, error, message);
}
```

Use destructuring at call sites:

```ts
const { data, success, error, message } = await createProject({ payload });
const { data: isAdminUser } = await isAdmin({ userId });
```

---

## Param conventions

Use **object params** for any action that takes arguments:

```ts
createFeature({ payload });
updateFeature({ id, payload });
deleteFeature({ id });
saveFeaturesSort({ ids });
getFeatureById({ id });
getSeoPageByRoute({ route });
```

No-arg reads need no wrapper:

```ts
getFeatures();
getSortedProjects();
```

---

## Query shape (`get`)

`get()` accepts an optional `shape` param that controls the return type:

| `shape`            | Returns     | Use when                       |
| ------------------ | ----------- | ------------------------------ |
| `"list"` (default) | `T[]`       | Multiple rows (filters, lists) |
| `"single"`         | `T \| null` | One row by slug, route, etc.   |

```ts
// many rows
await featureService.get({ where: { status: "approved" } });

// one row — no data[0] unwrapping
await featureService.get({ where: { slug: "my-project" }, shape: "single" });
```

Use `getById({ id })` for primary-key lookups. Use `get({ where, shape: "single" })` for unique field lookups.

---

## Typed responses

Entity and db methods are generic — pass your schema type so `data` is typed at the call site. All methods return `ApiResponse<T>` where `data` is `T | null`.

| Method                     | Generic                                | `data` type |
| -------------------------- | -------------------------------------- | ----------- |
| `create`                   | inferred from `payload`                | `T`         |
| `update`                   | inferred from `payload`                | `T`         |
| `remove`                   | optional (defaults to `PayloadRecord`) | `T`         |
| `getById`                  | required at call site                  | `T`         |
| `getAll`                   | required at call site                  | `T[]`       |
| `get({ shape: "list" })`   | required at call site                  | `T[]`       |
| `get({ shape: "single" })` | required at call site                  | `T \| null` |
| `getAllSorted`             | required at call site                  | `T[]`       |

```ts
import type {
  TestimonialRecord,
  TestimonialSchemaTypes,
} from "@/schemas/testimonialSchema";
import type { SeoPageRecord } from "@/schemas/seoSchema";

// Schema types — form payloads (create/update)
// Record types — DB rows (reads), e.g. YourRecord = YourSchemaType & { id: number }

// writes — T inferred from payload
await testimonialService.create({ payload: formData });
await testimonialService.update({ id, payload: formData });

// reads — pass Record type explicitly
const { data: row } = await testimonialService.getById<TestimonialRecord>({
  id,
});
const { data: rows } = await testimonialService.getAll<TestimonialRecord>();
const { data: page } = await seoService.get<SeoPageRecord>({
  where: { route: "/contact" },
  shape: "single",
});
const { data: approved } =
  await testimonialService.getAllSorted<TestimonialRecord>({
    where: { status: "approved" },
  });
```

Inner factory responses use `success` (not `!error`) before cache invalidation and before returning to actions.

---

## Client types

Reads default to **public** client. Writes default to **server** client.

```ts
type DbClientType = "server" | "public" | "admin" | "browser";
```

Resolved via `resolveClient()` from `@/lib/supabase`.

---

## Sorting

When `sortingServiceConfig` is set:

```ts
await featureService.saveSort({ ids: [1, 2, 3] });
await featureService.getSort();
// sort entry is removed automatically on remove()
```

Fetch sorted rows via `getAllSorted({})`:

```ts
await featureService.getAllSorted({});
await featureService.getAllSorted({ where: { status: "approved" } });

export const getSortedItems = unstable_cache(
  async () => featureService.getAllSorted({}),
  ["sorted-items"],
  { tags: [featureConfig.db.cacheTag] },
);
```

---

## Caching

Only **`entity.ts`** calls `updateTag` — not `factories/db.ts`. Cache tags live on `dbServiceConfig.cacheTag` and are invalidated after successful writes (`create`, `update`, `remove`, `saveSort`).

Wrap custom reads with `unstable_cache` and the same tag:

```ts
export const getSortedApprovedItems = unstable_cache(
  async () => featureService.getAllSorted({ where: { status: "approved" } }),
  ["sorted-approved-items"],
  { tags: [featureConfig.db.cacheTag] },
);
```

---

## Storage / image uploads

When `storageServiceConfig` is set, `createEntityService` handles uploads automatically:

| Operation  | Behavior                                                                 |
| ---------- | ------------------------------------------------------------------------ |
| **create** | Uploads `File` values → stores public URL in DB                          |
| **update** | New `File` → removes old file, uploads new one. `string` URL → unchanged |
| **remove** | Deletes DB row first, then removes files from storage on success         |

In forms, pass a `File` for a new image and a `string` URL when unchanged.

For nested uploads (e.g. `sub_items[].image` in projects), keep manual cleanup logic in `actions.ts`.

---

## Adding a new entity

1. Copy `services/entities/template/` → `services/entities/your-feature/`
2. Replace placeholders in `index.ts` and `actions.ts`
3. Add schema types in `@/schemas/`
4. Import actions from components — never import entity services directly

See `entities/testimonials/` as the canonical reference.

---

## When to skip the entity pattern

Use `infrastructure/` (no entity factory) when:

- External API clients (Umami)
- Auth checks (`infrastructure/admin`)
- Orchestration over other libs (`infrastructure/analytics`)
- Request/cookie utilities (`infrastructure/analytics/manual`)

---

## Rules

1. Don't duplicate CRUD — use `createEntityService` from `@/services/core/entity`
2. Don't force complex logic into the factory — keep it in `actions.ts`
3. Components call `actions.ts`, not entity services directly
4. Keep param shapes consistent (object params)
