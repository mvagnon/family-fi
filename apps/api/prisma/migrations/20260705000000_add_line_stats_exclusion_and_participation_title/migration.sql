ALTER TABLE "participation_lines" ADD COLUMN "title" TEXT;
ALTER TABLE "participation_lines" ADD COLUMN "is_excluded_from_stats" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "distribution_lines" ADD COLUMN "is_excluded_from_stats" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "loan_repayment_lines" ADD COLUMN "is_excluded_from_stats" BOOLEAN NOT NULL DEFAULT false;
