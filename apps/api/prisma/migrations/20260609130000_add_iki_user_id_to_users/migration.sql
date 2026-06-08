ALTER TABLE "user" ADD COLUMN "iki_user_id" TEXT;

UPDATE "user" app_user
SET "iki_user_id" = iki_account.account_id
FROM (
  SELECT DISTINCT ON (account.user_id)
    account.user_id,
    account.account_id
  FROM "account" account
  WHERE account.provider_id = 'iki'
  ORDER BY account.user_id, account.created_at ASC, account.id ASC
) iki_account
WHERE app_user.id = iki_account.user_id;

CREATE UNIQUE INDEX "user_iki_user_id_key" ON "user"("iki_user_id");
