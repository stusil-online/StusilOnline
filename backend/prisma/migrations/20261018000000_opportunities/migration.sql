CREATE TYPE "OpportunityCategory" AS ENUM ('scholarship', 'internship', 'competition', 'fellowship', 'grant', 'program', 'other');
CREATE TYPE "StudentLevel" AS ENUM ('high_school', 'undergraduate', 'graduate', 'any');

CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "category" "OpportunityCategory" NOT NULL,
    "link" TEXT NOT NULL,
    "eligibility_notes" TEXT,
    "student_level" "StudentLevel" NOT NULL,
    "is_remote" BOOLEAN NOT NULL DEFAULT false,
    "is_global" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "opportunities_link_http_check" CHECK ("link" ~ '^https?://[^[:space:]]+$')
);

CREATE INDEX "opportunities_deadline_idx" ON "opportunities"("deadline");
CREATE INDEX "opportunities_category_deadline_idx" ON "opportunities"("category", "deadline");
CREATE INDEX "opportunities_student_level_deadline_idx" ON "opportunities"("student_level", "deadline");