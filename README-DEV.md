# Local Development

## Prerequisites
- Node.js 20 or newer
- npm

## Run locally
1. Clone the repository.
2. Install dependencies with `npm install`.
3. Start the development server with `npm run dev`.
4. Open `http://localhost:3000`.

## Available checks
- `npm run typecheck` — TypeScript checks
- `npm run lint` — ESLint
- `npm run build` — production build

## Current prototype boundaries
- The dashboard uses typed demo data from `src/data/demo-data.ts`.
- The price calculation helpers are local and do not persist changes.
- Navigation is a visual foundation; most modules are not implemented yet.
- Authentication and Supabase/PostgreSQL are not connected.
- Trend chart points are illustrative and clearly labelled in the UI.
- Do not use demo prices for purchasing decisions.
