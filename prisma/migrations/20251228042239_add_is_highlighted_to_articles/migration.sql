-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "is_highlighted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "articles_is_highlighted_idx" ON "articles"("is_highlighted");
