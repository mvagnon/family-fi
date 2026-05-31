CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE "family" (
  "id" TEXT NOT NULL,
  "space_id" TEXT NOT NULL,
  "members" JSONB NOT NULL,
  "categories" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "family_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "email_verified" BOOLEAN NOT NULL DEFAULT false,
  "image" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "session" (
  "id" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "token" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "user_id" TEXT NOT NULL,

  CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "account" (
  "id" TEXT NOT NULL,
  "account_id" TEXT NOT NULL,
  "provider_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "access_token" TEXT,
  "refresh_token" TEXT,
  "id_token" TEXT,
  "access_token_expires_at" TIMESTAMP(3),
  "refresh_token_expires_at" TIMESTAMP(3),
  "scope" TEXT,
  "password" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification" (
  "id" TEXT NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "space" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "space_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "space_membership" (
  "id" TEXT NOT NULL,
  "space_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "space_membership_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_settings" (
  "user_id" TEXT NOT NULL,
  "default_space_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_settings_pkey" PRIMARY KEY ("user_id")
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

CREATE UNIQUE INDEX "family_space_id_key" ON "family"("space_id");
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");
CREATE INDEX "session_user_id_idx" ON "session"("user_id");
CREATE INDEX "account_user_id_idx" ON "account"("user_id");
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");
CREATE INDEX "space_membership_user_id_idx" ON "space_membership"("user_id");
CREATE UNIQUE INDEX "space_membership_space_id_user_id_key" ON "space_membership"("space_id", "user_id");
CREATE INDEX "user_settings_default_space_id_idx" ON "user_settings"("default_space_id");
CREATE INDEX "recurring_lines_family_id_idx" ON "recurring_lines"("family_id");

ALTER TABLE "family"
  ADD CONSTRAINT "family_space_id_fkey"
  FOREIGN KEY ("space_id") REFERENCES "space"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "session"
  ADD CONSTRAINT "session_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "account"
  ADD CONSTRAINT "account_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "space_membership"
  ADD CONSTRAINT "space_membership_space_id_fkey"
  FOREIGN KEY ("space_id") REFERENCES "space"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "space_membership"
  ADD CONSTRAINT "space_membership_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_settings"
  ADD CONSTRAINT "user_settings_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_settings"
  ADD CONSTRAINT "user_settings_default_space_id_fkey"
  FOREIGN KEY ("default_space_id") REFERENCES "space"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "recurring_lines"
  ADD CONSTRAINT "recurring_lines_family_id_fkey"
  FOREIGN KEY ("family_id") REFERENCES "family"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
