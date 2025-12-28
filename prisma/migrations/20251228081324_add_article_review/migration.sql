-- CreateTable
CREATE TABLE "article_reviews" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "parent_id" INTEGER,
    "content" TEXT NOT NULL,
    "rating" SMALLINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "article_reviews_article_id_idx" ON "article_reviews"("article_id");

-- CreateIndex
CREATE INDEX "article_reviews_user_id_idx" ON "article_reviews"("user_id");

-- CreateIndex
CREATE INDEX "article_reviews_parent_id_idx" ON "article_reviews"("parent_id");

-- AddForeignKey
ALTER TABLE "article_reviews" ADD CONSTRAINT "article_reviews_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_reviews" ADD CONSTRAINT "article_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_reviews" ADD CONSTRAINT "article_reviews_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "article_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
