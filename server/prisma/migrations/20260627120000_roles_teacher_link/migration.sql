-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('admin', 'teacher', 'assistant');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'assistant';
COMMIT;

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'assistant';

-- CreateIndex
CREATE UNIQUE INDEX "teachers_user_id_key" ON "teachers"("user_id");

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
