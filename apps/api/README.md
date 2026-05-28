```bash
bun install
DATABASE_URL="postgresql://user:password@localhost:5432/family_fi" bun run prisma:migrate
DATABASE_URL="postgresql://user:password@localhost:5432/family_fi" bun run dev
```

```bash
open http://localhost:3000
```

The API uses Prisma with PostgreSQL. `DATABASE_URL` is required at runtime.
