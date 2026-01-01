-- AlterTable
ALTER TABLE "events" ADD COLUMN     "is_highlighted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "events_is_highlighted_idx" ON "events"("is_highlighted");
