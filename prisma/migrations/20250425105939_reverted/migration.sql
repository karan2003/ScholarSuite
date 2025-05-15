/*
  Warnings:

  - You are about to drop the column `semesterId` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `semesterId` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the `Semester` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_semesterId_fkey";

-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_semesterId_fkey";

-- AlterTable
ALTER TABLE "Result" DROP COLUMN "semesterId";

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "semesterId";

-- DropTable
DROP TABLE "Semester";
