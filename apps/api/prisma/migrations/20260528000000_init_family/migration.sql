CREATE TABLE "family" (
  "id" TEXT NOT NULL,
  "user_ids" TEXT[] NOT NULL,
  "members" JSONB NOT NULL,
  "categories" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "family_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recurring_lines" (
  "id" TEXT NOT NULL,
  "family_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category_id" TEXT NOT NULL,
  "movement" TEXT NOT NULL,
  "amount_cents" INTEGER NOT NULL,
  "is_estimate" BOOLEAN NOT NULL,
  "min_amount_cents" INTEGER,
  "max_amount_cents" INTEGER,
  "recurrence_months" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "recurring_lines_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recurring_lines_family_id_idx" ON "recurring_lines"("family_id");

ALTER TABLE "recurring_lines"
  ADD CONSTRAINT "recurring_lines_family_id_fkey"
  FOREIGN KEY ("family_id") REFERENCES "family"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
