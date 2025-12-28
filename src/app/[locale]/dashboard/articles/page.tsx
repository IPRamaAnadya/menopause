"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  BookOpen,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Article } from "@/features/articles/types";
import { useArticles } from "@/features/articles/hooks/useArticles";
import { useArticleActions } from "@/features/articles/hooks/useArticleActions";

export default function ArticlesManagementPage() {
  const t = useTranslations('ArticlesManagement');
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const { articles, total, loading, refresh } = useArticles({ page: currentPage, limit: pageSize });
  const { deleteArticle, loading: actionLoading } = useArticleActions(refresh);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "PUBLIC" | "PRIORITY">("all");

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && article.is_published) ||
        (statusFilter === "draft" && !article.is_published);

      const matchesVisibility =
        visibilityFilter === "all" ||
        article.visibility === visibilityFilter ||
        (visibilityFilter === "PRIORITY" && article.visibility === "MEMBER");

      return matchesSearch && matchesStatus && matchesVisibility;
    });
  }, [articles, searchQuery, statusFilter, visibilityFilter]);

  const handleEdit = (id: number) => {
    router.push(`/dashboard/articles/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('actions.deleteConfirm'))) {
      await deleteArticle(id);
    }
  };

  const handleCreate = () => {
    router.push('/dashboard/articles/create');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t('addButton')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm sm:text-base"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatus')}</SelectItem>
            <SelectItem value="published">{t('publishedOnly')}</SelectItem>
            <SelectItem value="draft">{t('draftOnly')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={visibilityFilter} onValueChange={(value: any) => setVisibilityFilter(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allVisibility')}</SelectItem>
            <SelectItem value="PUBLIC">{t('visibility.public')}</SelectItem>
            <SelectItem value="PRIORITY">{t('visibility.memberOnly')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('noArticles')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('getStarted')}
          </p>
          <Button onClick={handleCreate} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            {t('addButton')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow"
            >
              {article.image_url && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 space-y-3">
                {/* Status & Visibility Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      article.is_published
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {article.is_published ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        {t('status.published')}
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        {t('status.draft')}
                      </>
                    )}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      article.visibility === 'PUBLIC'
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                    }`}
                  >
                    {article.visibility === 'PUBLIC' ? t('visibility.public') : t('visibility.memberOnly')}
                  </span>
                </div>

                {/* Article Info */}
                <div className="min-w-0">
                  <h3 className="font-semibold text-base mb-1 line-clamp-2">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  {article.category && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('categoryLabel')} {article.category.name}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(article.id)}
                    disabled={actionLoading}
                    className="flex-1"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    {t('actions.edit')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(article.id)}
                    disabled={actionLoading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredArticles.length > 0 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {t('pagination.showing')} {((currentPage - 1) * pageSize) + 1} {t('pagination.to')} {Math.min(currentPage * pageSize, total)} {t('pagination.of')} {total} {t('pagination.articles')}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              {t('pagination.previous')}
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and 1 page on each side of current
                  const totalPages = Math.ceil(total / pageSize);
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  );
                })
                .map((page, index, array) => {
                  // Add ellipsis between non-consecutive pages
                  const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsisBefore && <span className="px-2 text-muted-foreground">...</span>}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        disabled={loading}
                        className="min-w-10"
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(total / pageSize), p + 1))}
              disabled={currentPage >= Math.ceil(total / pageSize) || loading}
            >
              {t('pagination.next')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
