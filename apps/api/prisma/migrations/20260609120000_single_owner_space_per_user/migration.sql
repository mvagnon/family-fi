WITH ranked_owner_memberships AS (
  SELECT
    sm.id,
    sm.space_id,
    sm.user_id,
    row_number() OVER (
      PARTITION BY sm.user_id
      ORDER BY
        CASE WHEN us.default_space_id = sm.space_id THEN 0 ELSE 1 END,
        sm.created_at ASC,
        sm.space_id ASC
    ) AS owner_rank
  FROM "space_membership" sm
  LEFT JOIN "user_settings" us ON us.user_id = sm.user_id
  WHERE sm.role = 'owner'
),
duplicate_owner_memberships AS (
  SELECT id, space_id, user_id
  FROM ranked_owner_memberships
  WHERE owner_rank > 1
),
owner_only_duplicate_spaces AS (
  SELECT duplicate.space_id
  FROM duplicate_owner_memberships duplicate
  WHERE NOT EXISTS (
    SELECT 1
    FROM "space_membership" other_membership
    WHERE other_membership.space_id = duplicate.space_id
      AND other_membership.id <> duplicate.id
  )
)
DELETE FROM "space" space
USING owner_only_duplicate_spaces duplicate_space
WHERE space.id = duplicate_space.space_id;

WITH ranked_owner_memberships AS (
  SELECT
    sm.id,
    sm.space_id,
    sm.user_id,
    row_number() OVER (
      PARTITION BY sm.user_id
      ORDER BY
        CASE WHEN us.default_space_id = sm.space_id THEN 0 ELSE 1 END,
        sm.created_at ASC,
        sm.space_id ASC
    ) AS owner_rank
  FROM "space_membership" sm
  LEFT JOIN "user_settings" us ON us.user_id = sm.user_id
  WHERE sm.role = 'owner'
)
UPDATE "space_membership" membership
SET role = 'write'
FROM ranked_owner_memberships ranked
WHERE membership.id = ranked.id
  AND ranked.owner_rank > 1;

CREATE UNIQUE INDEX "space_membership_single_owner_per_user_key"
  ON "space_membership"("user_id")
  WHERE role = 'owner';
