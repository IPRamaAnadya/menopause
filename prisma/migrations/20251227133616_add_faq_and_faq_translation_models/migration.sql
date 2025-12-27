-- CreateTable
CREATE TABLE "faqs" (
    "id" SERIAL NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_translations" (
    "id" SERIAL NOT NULL,
    "faq_id" INTEGER NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "faqs_is_active_idx" ON "faqs"("is_active");

-- CreateIndex
CREATE INDEX "faqs_order_idx" ON "faqs"("order");

-- CreateIndex
CREATE INDEX "faq_translations_locale_idx" ON "faq_translations"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "faq_translations_faq_id_locale_key" ON "faq_translations"("faq_id", "locale");

-- AddForeignKey
ALTER TABLE "faq_translations" ADD CONSTRAINT "faq_translations_faq_id_fkey" FOREIGN KEY ("faq_id") REFERENCES "faqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
