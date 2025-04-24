/*
  Warnings:

  - You are about to drop the column `subjectCode` on the `Assignment` table. All the data in the column will be lost.
  - You are about to drop the column `subjectCode` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `requiredCredits` on the `Grade` table. All the data in the column will be lost.
  - You are about to drop the column `subjectCode` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `credits` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `subjectCode` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `earnedCredits` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `credits` on the `Subject` table. All the data in the column will be lost.
  - Added the required column `subjectId` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credit` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "subjectCode";

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "subjectCode";

-- AlterTable
ALTER TABLE "Grade" DROP COLUMN "requiredCredits";

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "subjectCode";

-- AlterTable
ALTER TABLE "Result" DROP COLUMN "credits",
DROP COLUMN "subjectCode",
ADD COLUMN     "subjectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "earnedCredits",
ADD COLUMN     "creditDeficiency" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "credits",
ADD COLUMN     "credit" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
