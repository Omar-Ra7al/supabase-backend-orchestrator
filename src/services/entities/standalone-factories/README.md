# Standalone factory examples

Proof that the layer is a toolkit, not an all-or-nothing framework. Each core
factory is a pure builder you can use on its own — no `createEntityService`
orchestrator required.

| File | Factory | Use when |
| ---- | ------- | -------- |
| [`db-only.ts`](./db-only.ts) | `createDbService` | A table just needs plain CRUD |
| [`storage-only.ts`](./storage-only.ts) | `createStorageService` | One-off file upload/remove, no DB row |
| [`sorting-only.ts`](./sorting-only.ts) | `createSortingService` | Persisted manual order on its own |

Reach for a single factory when you need exactly one capability; reach for
`createEntityService` (see `entities/projects/`) when you want the whole
pipeline — uploads + db + sorting + cache — in one call.

## Swap the client (multi-client)

The examples above bind `createServerClient()`, but every factory is a pure
builder that takes any `supabaseClient` — so the same multi-client pattern the
entities use applies here too. Wrap the factory's generator in
`createServiceRunner` and pick the client per call with
`runWithService("server" | "public" | "admin", action)`:

```ts
import { createServiceRunner } from "@/services/core/runtime/runner";
import { createDbService } from "@/services/core/factories/db";
import type { SupabaseClient } from "@supabase/supabase-js";

const generateTagsDb = (client: SupabaseClient) =>
  createDbService({ tableName: "tags", supabaseClient: client });

const runWithTagsDb = createServiceRunner(generateTagsDb);

await runWithTagsDb("admin", (tags) => tags.getAll({}));  // bypass RLS
await runWithTagsDb("public", (tags) => tags.getAll({})); // cache-safe read
```

`createServiceRunner` passes `updateTag` into the generator, but a bare factory
that ignores it still fits the signature. If you only need one alternate
client, you can also just hand the factory a different client directly (e.g.
`createDbService({ tableName: "tags", supabaseClient: createAdminClient() })`).
