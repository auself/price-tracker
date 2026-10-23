# Module 7 — Neon database setup

Neon database: `au-price-tracker`

## Included in this module

- Neon serverless PostgreSQL driver and server-only database client.
- Initial PostgreSQL schema for users/roles, company units, categories, items, suppliers, price records, suggestions, and audit events.
- `GET /api/health/database` connectivity check. It returns only a status and never exposes credentials or database errors.
- Setup instructions. The migration is **not** applied automatically.

## Configure the connection

1. In Neon, open the `au-price-tracker` project/database and copy its pooled connection string (recommended for a serverless app).
2. In Vercel → Project → Settings → Environment Variables, add `DATABASE_URL` for Preview first, then Production when ready. Keep it server-side; never prefix it with `NEXT_PUBLIC_`.
3. For local development, put the same variable in `.env.local`; do not commit that file or paste credentials into GitHub.
4. Redeploy the Preview branch after setting the variable.
5. Open `/api/health/database` on the preview URL. `connected` confirms basic database connectivity only; it does not confirm the schema is installed.

## Apply the schema

Review `db/migrations/0001_initial_schema.sql`, then run it against the intended Neon database using the Neon SQL Editor or your preferred migration runner. Confirm all tables and indexes were created before enabling app writes.

## Before production use

- Choose and configure an authentication provider; `app_users` is a profile/role table, not a password-authentication implementation.
- Add server-side authorization checks for `super_admin`, `app_admin`, and `user`.
- Connect repository/service methods to the database and replace demo reads gradually.
- Add and test CRUD validation, audit events, backups, and error handling.
- Verify build, database connectivity, authorization, and CRUD in a preview deployment before merging to `main`.

Never expose the Neon connection string in client components or browser bundles.
