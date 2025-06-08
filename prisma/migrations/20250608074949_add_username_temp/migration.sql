/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `Alumni` will be added. If there are existing duplicate values, this will fail.
  - Made the column `username` on table `Alumni` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Alumni" ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Alumni_username_key" ON "Alumni"("username");
