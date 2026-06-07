CREATE TABLE "distribution_lines" (
  "id" TEXT NOT NULL,
  "family_id" TEXT NOT NULL,
  "amount_cents" INTEGER NOT NULL,
  "year" INTEGER NOT NULL,
  "month" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "distribution_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "distribution_member_amounts" (
  "distribution_line_id" TEXT NOT NULL,
  "member_id" TEXT NOT NULL,
  "amount_cents" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "distribution_member_amounts_pkey" PRIMARY KEY ("distribution_line_id", "member_id")
);

CREATE INDEX "distribution_lines_family_id_idx" ON "distribution_lines"("family_id");
CREATE INDEX "distribution_member_amounts_member_id_idx" ON "distribution_member_amounts"("member_id");

ALTER TABLE "distribution_lines"
  ADD CONSTRAINT "distribution_lines_family_id_fkey"
  FOREIGN KEY ("family_id")
  REFERENCES "family"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "distribution_member_amounts"
  ADD CONSTRAINT "distribution_member_amounts_distribution_line_id_fkey"
  FOREIGN KEY ("distribution_line_id")
  REFERENCES "distribution_lines"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
