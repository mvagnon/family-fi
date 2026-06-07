CREATE TABLE "generated_recurring_line_settings" (
  "family_id" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "source_id" TEXT NOT NULL,
  "is_enabled" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "generated_recurring_line_settings_pkey" PRIMARY KEY ("family_id", "source", "source_id")
);

ALTER TABLE "generated_recurring_line_settings"
  ADD CONSTRAINT "generated_recurring_line_settings_family_id_fkey"
  FOREIGN KEY ("family_id")
  REFERENCES "family"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
