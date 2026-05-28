# Repository Guidelines

## Project Structure & Module Organization

This is a Bun/Turborepo monorepo. Both projects use hexagonal architecture: `domain` holds business rules and ports, `application` holds use cases, and `infrastructure`/`presentation` hold adapters. `apps/web` is the React Router app; routes live in `app/routes`, and feature code lives under `app/features/<feature>`. `apps/api` is the Hono API with Prisma and follows the same split under `src/features/<feature>`. Prisma files live in `apps/api/prisma`. Shared packages live in `packages/ui`, `packages/eslint-config`, and `packages/typescript-config`. Tests are colocated.

## Build, Test, and Development Commands

- `bun install`: install workspace dependencies.
- `bun run dev`: run Turbo dev tasks; web serves on `:5173`, API on `:3000`.
- `bun run build`: build all apps and packages, including Prisma client generation.
- `bun run check-types`: run TypeScript checks through Turbo.
- `bun run lint`: run workspace lint tasks.
- `bun run format`: format `ts`, `tsx`, and Markdown files with Prettier.
- `cd apps/web && bun run test`: run web tests.
- `cd apps/api && bun run test`: run the API `node:test` suite.
- `docker compose up --build`: run PostgreSQL, migrations, API, and web together.

## Coding Style & Naming Conventions

Use TypeScript, ESM imports, 2-space indentation, semicolons, and double quotes. Use kebab-case for file names, PascalCase for React components, and `useX` for hooks. Keep behavior inside the existing feature layers. On the web, route network access through repositories and TanStack Query hooks. Prefer existing MUI, Tailwind, and shared package patterns before creating UI.

## Testing Guidelines

Tests use `node:test` with `node:assert/strict`; web tests run through Bun. Name tests `*.test.ts` and place them in the owning layer’s `tests` directory. Cover domain/application logic, DTO mapping, route validation, and persistence behavior when changed. Run relevant tests plus `bun run check-types` before finishing.

## Commit & Pull Request Guidelines

Git history uses Conventional Commits such as `feat: ...`, `feat(family): ...`, and `chore: ...`. Keep subjects short and imperative. Pull requests should include a summary, linked issue when applicable, checks run, and screenshots for UI changes.

## Security & Configuration Tips

Do not commit `.env` files, credentials, or database URLs. `DATABASE_URL` is required for API runtime and Prisma commands. Validate inputs at API boundaries, keep authorization server-side, and use Prisma migrations for schema changes.

## Agent-Specific Instructions

Keep changes scoped. Check local modifications before editing, reuse existing feature patterns, and self-review the diff before handoff. Do not start dev servers, containers, or browser automation unless explicitly required.
