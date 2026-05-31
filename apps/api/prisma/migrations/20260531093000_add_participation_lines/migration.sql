CREATE TABLE "participation_lines" (
  "id" TEXT NOT NULL,
  "family_id" TEXT NOT NULL,
  "member_id" TEXT NOT NULL,
  "amount_cents" INTEGER NOT NULL,
  "year" INTEGER NOT NULL,
  "month" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "participation_lines_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "participation_lines_family_id_idx" ON "participation_lines"("family_id");
CREATE INDEX "participation_lines_family_id_member_id_idx" ON "participation_lines"("family_id", "member_id");

ALTER TABLE "participation_lines"
  ADD CONSTRAINT "participation_lines_family_id_fkey"
  FOREIGN KEY ("family_id") REFERENCES "family"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
