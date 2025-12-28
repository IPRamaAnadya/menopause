-- CreateEnum
CREATE TYPE "ArticleVisibility" AS ENUM ('PUBLIC', 'MEMBER', 'PRIORITY');

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER,
    "slug" VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_translations" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" SERIAL NOT NULL,
    "public_id" UUID NOT NULL,
    "category_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "image_url" TEXT,
    "visibility" "ArticleVisibility" NOT NULL DEFAULT 'PUBLIC',
    "required_priority" SMALLINT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_translations" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "excerpt" TEXT,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_is_active_idx" ON "categories"("is_active");

-- CreateIndex
CREATE INDEX "categories_order_idx" ON "categories"("order");

-- CreateIndex
CREATE INDEX "category_translations_locale_idx" ON "category_translations"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "category_translations_category_id_locale_key" ON "category_translations"("category_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "articles_public_id_key" ON "articles"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_category_id_idx" ON "articles"("category_id");

-- CreateIndex
CREATE INDEX "articles_author_id_idx" ON "articles"("author_id");

-- CreateIndex
CREATE INDEX "articles_slug_idx" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_visibility_idx" ON "articles"("visibility");

-- CreateIndex
CREATE INDEX "articles_is_published_idx" ON "articles"("is_published");

-- CreateIndex
CREATE INDEX "articles_published_at_idx" ON "articles"("published_at");

-- CreateIndex
CREATE INDEX "article_translations_locale_idx" ON "article_translations"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "article_translations_article_id_locale_key" ON "article_translations"("article_id", "locale");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_translations" ADD CONSTRAINT "article_translations_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
