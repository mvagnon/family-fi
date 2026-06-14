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
    "identity_subject" TEXT,
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

CREATE TABLE "oauth_login_attempt" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "code_verifier" TEXT NOT NULL,
    "callback_url" TEXT NOT NULL,
    "error_callback_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_login_attempt_pkey" PRIMARY KEY ("id")
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
    "currency_code" TEXT NOT NULL DEFAULT 'EUR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "space_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "space"
    ADD CONSTRAINT "space_currency_code_check"
    CHECK (
        "currency_code" IN (
            'EUR',
            'USD',
            'JPY',
            'GBP',
            'CHF',
            'CAD',
            'AUD',
            'NZD',
            'CNY',
            'HKD',
            'SGD',
            'KRW',
            'INR',
            'BRL',
            'MXN'
        )
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

ALTER TABLE "space_membership"
    ADD CONSTRAINT "space_membership_role_check"
    CHECK ("role" IN ('owner', 'write', 'read'));

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

CREATE TABLE "generated_recurring_line_settings" (
    "family_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_recurring_line_settings_pkey" PRIMARY KEY ("family_id", "source", "source_id")
);

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

CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "family_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "initial_amount_cents" INTEGER NOT NULL,
    "annual_interest_rate" DOUBLE PRECISION NOT NULL,
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

CREATE UNIQUE INDEX "family_space_id_key" ON "family"("space_id");
CREATE UNIQUE INDEX "user_identity_subject_key" ON "user"("identity_subject");
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");
CREATE INDEX "session_user_id_idx" ON "session"("user_id");
CREATE UNIQUE INDEX "oauth_login_attempt_state_key" ON "oauth_login_attempt"("state");
CREATE INDEX "oauth_login_attempt_expires_at_idx" ON "oauth_login_attempt"("expires_at");
CREATE INDEX "account_user_id_idx" ON "account"("user_id");
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");
CREATE INDEX "space_membership_user_id_idx" ON "space_membership"("user_id");
CREATE UNIQUE INDEX "space_membership_space_id_user_id_key" ON "space_membership"("space_id", "user_id");
CREATE UNIQUE INDEX "space_membership_single_owner_per_user_key"
    ON "space_membership"("user_id")
    WHERE role = 'owner';
CREATE INDEX "user_settings_default_space_id_idx" ON "user_settings"("default_space_id");
CREATE INDEX "recurring_lines_family_id_idx" ON "recurring_lines"("family_id");
CREATE INDEX "participation_lines_family_id_idx" ON "participation_lines"("family_id");
CREATE INDEX "participation_lines_family_id_member_id_idx" ON "participation_lines"("family_id", "member_id");
CREATE INDEX "distribution_lines_family_id_idx" ON "distribution_lines"("family_id");
CREATE INDEX "distribution_member_amounts_member_id_idx" ON "distribution_member_amounts"("member_id");
CREATE INDEX "loans_family_id_idx" ON "loans"("family_id");
CREATE INDEX "loan_repayment_lines_family_id_idx" ON "loan_repayment_lines"("family_id");
CREATE INDEX "loan_repayment_lines_family_id_loan_id_idx" ON "loan_repayment_lines"("family_id", "loan_id");

ALTER TABLE "family" ADD CONSTRAINT "family_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "space"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "space_membership" ADD CONSTRAINT "space_membership_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "space"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "space_membership" ADD CONSTRAINT "space_membership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_default_space_id_fkey" FOREIGN KEY ("default_space_id") REFERENCES "space"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "recurring_lines" ADD CONSTRAINT "recurring_lines_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "generated_recurring_line_settings" ADD CONSTRAINT "generated_recurring_line_settings_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "participation_lines" ADD CONSTRAINT "participation_lines_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "distribution_lines" ADD CONSTRAINT "distribution_lines_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "distribution_member_amounts" ADD CONSTRAINT "distribution_member_amounts_distribution_line_id_fkey" FOREIGN KEY ("distribution_line_id") REFERENCES "distribution_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loans" ADD CONSTRAINT "loans_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loan_repayment_lines" ADD CONSTRAINT "loan_repayment_lines_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loan_repayment_lines" ADD CONSTRAINT "loan_repayment_lines_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
