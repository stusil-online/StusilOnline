-- DropForeignKey
ALTER TABLE IF EXISTS "messages" DROP CONSTRAINT IF EXISTS "messages_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "messages" DROP CONSTRAINT IF EXISTS "messages_sender_id_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "project_messages" DROP CONSTRAINT IF EXISTS "project_messages_project_id_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "project_messages" DROP CONSTRAINT IF EXISTS "project_messages_sender_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "discord_username" TEXT;

-- DropTable
DROP TABLE IF EXISTS "messages";

-- DropTable
DROP TABLE IF EXISTS "project_messages";
