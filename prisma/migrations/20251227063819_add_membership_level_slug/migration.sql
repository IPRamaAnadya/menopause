/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `membership_levels` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `membership_levels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "membership_levels" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "membership_levels_slug_key" ON "membership_levels"("slug");
