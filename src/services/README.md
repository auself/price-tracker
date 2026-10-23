# Service and Repository Layer

Keep UI components independent from the database.

- Services expose typed use cases to pages and components.
- Repositories define where data is read and written.
- The first implementation uses `src/data/demo-data.ts`.
- A later milestone can replace the demo repository with Supabase/PostgreSQL implementations without changing page-level UI contracts.
- Do not put secrets, service-role keys, or privileged database access in client components.
- Treat frontend permission checks as presentation only; enforce real access rules on the server and in database policies.
