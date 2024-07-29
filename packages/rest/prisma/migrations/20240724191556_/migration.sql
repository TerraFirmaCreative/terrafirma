/*
  Warnings:

  - You are about to drop the column `progress_uri` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "progress_uri",
ADD COLUMN     "progressUri" TEXT;
