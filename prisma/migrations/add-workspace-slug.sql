-- Add slug column to Workspace, backfill, then enforce NOT NULL + UNIQUE.
-- Idempotent: safe to run twice.

ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Dev bootstrap user gets the friendly 'dev' slug so localhost:3000/apps/dev works.
UPDATE "Workspace" w
   SET "slug" = 'dev'
  FROM "User" u
 WHERE w."userId" = u.id
   AND u.email = 'dev@erpbuilder.app'
   AND w."slug" IS NULL;

-- Everyone else gets a deterministic derived slug from their workspace id.
UPDATE "Workspace"
   SET "slug" = CONCAT('ws-', LOWER(SUBSTRING(id FROM 1 FOR 8)))
 WHERE "slug" IS NULL;

ALTER TABLE "Workspace" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Workspace_slug_key" ON "Workspace"("slug");
