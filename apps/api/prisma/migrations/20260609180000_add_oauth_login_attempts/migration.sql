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

CREATE UNIQUE INDEX "oauth_login_attempt_state_key" ON "oauth_login_attempt"("state");
CREATE INDEX "oauth_login_attempt_expires_at_idx" ON "oauth_login_attempt"("expires_at");
