ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "country" TEXT,
  ADD COLUMN IF NOT EXISTS "dob" TEXT,
  ADD COLUMN IF NOT EXISTS "is_verified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "links" TEXT,
  ADD COLUMN IF NOT EXISTS "reset_expires" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "reset_token" TEXT,
  ADD COLUMN IF NOT EXISTS "verify_token" TEXT;

ALTER TABLE "projects"
  ADD COLUMN IF NOT EXISTS "banner_image" TEXT,
  ADD COLUMN IF NOT EXISTS "stars" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "views" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "project_roles" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "questions" TEXT,
  "is_filled" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "project_roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "applications" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "role_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "answers" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "link" TEXT,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "events" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'upcoming',
  "details" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "project_roles_project_id_idx" ON "project_roles"("project_id");
CREATE INDEX IF NOT EXISTS "applications_project_id_idx" ON "applications"("project_id");
CREATE UNIQUE INDEX IF NOT EXISTS "applications_role_id_user_id_key" ON "applications"("role_id", "user_id");
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "project_members_project_id_idx" ON "project_members"("project_id");
CREATE INDEX IF NOT EXISTS "project_members_user_id_idx" ON "project_members"("user_id");
CREATE INDEX IF NOT EXISTS "projects_owner_id_idx" ON "projects"("owner_id");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_roles_project_id_fkey') THEN
    ALTER TABLE "project_roles" ADD CONSTRAINT "project_roles_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'applications_project_id_fkey') THEN
    ALTER TABLE "applications" ADD CONSTRAINT "applications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'applications_role_id_fkey') THEN
    ALTER TABLE "applications" ADD CONSTRAINT "applications_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "project_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'applications_user_id_fkey') THEN
    ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_user_id_fkey') THEN
    ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
