CREATE TABLE "loans" (
  "id" TEXT NOT NULL,
  "family_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "initial_amount_cents" INTEGER NOT NULL,
  "annual_interest_rate" DOUBLE PRECISION NOT NULL,
  "is_hidden" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "loan_repayment_lines" (
  "id" TEXT NOT NULL,
  "family_id" TEXT NOT NULL,
  "loan_id" TEXT NOT NULL,
  "paid_cents" INTEGER NOT NULL,
  "fees_cents" INTEGER NOT NULL,
  "year" INTEGER NOT NULL,
  "month" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "loan_repayment_lines_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "loans_family_id_idx" ON "loans"("family_id");
CREATE INDEX "loan_repayment_lines_family_id_idx" ON "loan_repayment_lines"("family_id");
CREATE INDEX "loan_repayment_lines_family_id_loan_id_idx" ON "loan_repayment_lines"("family_id", "loan_id");

ALTER TABLE "loans"
  ADD CONSTRAINT "loans_family_id_fkey"
  FOREIGN KEY ("family_id")
  REFERENCES "family"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "loan_repayment_lines"
  ADD CONSTRAINT "loan_repayment_lines_family_id_fkey"
  FOREIGN KEY ("family_id")
  REFERENCES "family"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "loan_repayment_lines"
  ADD CONSTRAINT "loan_repayment_lines_loan_id_fkey"
  FOREIGN KEY ("loan_id")
  REFERENCES "loans"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
