# Module 7 — Neon database setup

Neon database: `au-price-tracker`

## Current scope

- Adds the Neon serverless PostgreSQL driver and a server-only database client.
- Adds the initial PostgreSQL schema for users/roles, company units, categories, items, suppliers, price records, suggestions, and audit events.
- Does not apply the migration to Neon automatically.
- Does not yet enable authentication or switch the app's demo-data pages to persistent CRUD.

## Configure the connection

1. In Neon, open the `au-price-tracker` project/database and copy its pooled connection string (recommended for a serverless app).
2. In Vercel → Project → Settings → Environment Variables, add `DATABASE_URL` for the required environments. Keep it server-only; do not prefix it with `NEXT_PUBLIC_`.
3. For local development, put the same variable in `.env.local`; do not commit that file or paste credentials into GitHub.
4. Do not set `DATABASE_ENABLED=true` until the schema is applied and tested.

## Apply the schema

Review `db/migrations/0001_initial_schema.sql`, then run it against the intended Neon database using the Neon SQL Editor or your preferred migration runner. Confirm all tables and indexes were created before enabling any app writes.

## Before production use

- Choose and configure an authentication provider; the `app_users` table is an application profile/role table, not a password-authentication implementation.
- Add server-side authorization checks for `super_admin`, `app_admin`, and `user`.
- Connect repository/service methods to the database and replace demo reads gradually.
- Add and test CRUD validation, audit events, backups, and error handling.
- Verify build, database connectivity, authorization, and CRUD in a preview deployment before merging to `main`.

Never expose the Neon connection string in client components or browser bundles.
