-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
