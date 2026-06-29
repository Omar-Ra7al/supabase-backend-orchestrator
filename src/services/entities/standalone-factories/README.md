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
