-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "project_messages" DROP CONSTRAINT "project_messages_project_id_fkey";

-- DropForeignKey
ALTER TABLE "project_messages" DROP CONSTRAINT "project_messages_sender_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "discord_username" TEXT;

-- DropTable
DROP TABLE "messages";

-- DropTable
DROP TABLE "project_messages";
