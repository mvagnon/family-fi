ALTER TABLE "user" RENAME COLUMN "iki_user_id" TO "identity_subject";

ALTER INDEX "user_iki_user_id_key" RENAME TO "user_identity_subject_key";

UPDATE "account"
SET "provider_id" = 'logto'
WHERE "provider_id" = 'iki';
