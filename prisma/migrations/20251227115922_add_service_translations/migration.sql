-- CreateTable
CREATE TABLE "service_translations" (
    "id" SERIAL NOT NULL,
    "service_id" INTEGER NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_translations_locale_idx" ON "service_translations"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "service_translations_service_id_locale_key" ON "service_translations"("service_id", "locale");

-- AddForeignKey
ALTER TABLE "service_translations" ADD CONSTRAINT "service_translations_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
