UPDATE "space_membership"
SET "role" = 'write'
WHERE "role" = 'member';

ALTER TABLE "space_membership"
  DROP CONSTRAINT IF EXISTS "space_membership_role_check";

ALTER TABLE "space_membership"
  ADD CONSTRAINT "space_membership_role_check"
  CHECK ("role" IN ('owner', 'write', 'read'));
