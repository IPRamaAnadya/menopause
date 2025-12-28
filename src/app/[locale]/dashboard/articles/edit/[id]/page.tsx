"use client";

import { useState, useEffect, use } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { CreateArticleDTO, ArticleVisibility, Article } from "@/features/articles/types";
import { useArticleActions } from "@/features/articles/hooks/useArticleActions";
import { useCategories } from "@/features/articles/hooks/useCategories";
import { useMembershipLevels } from "@/features/membership/hooks";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { QuillEditor } from "@/components/ui/QuillEditor";
import { toLocalInputValue } from "@/lib/datetime";

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const t = useTranslations('ArticlesManagement');
  const router = useRouter();
  const { categories } = useCategories();
  const { membershipLevels } = useMembershipLevels();
  const { updateArticle, loading } = useArticleActions();

  const [article, setArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<CreateArticleDTO>({
    category_id: 0,
    slug: "",
    image: undefined,
    tags: [],
    visibility: "PUBLIC",
    required_priority: undefined,
    is_published: false,
    is_highlighted: false,
    published_at: undefined,
    translations: [
      { locale: "en", title: "", excerpt: "", description: "" },
      { locale: "zh-HK", title: "", excerpt: "", description: "" },
    ],
  });

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/admin/articles/${resolvedParams.id}`);
        if (!response.ok) throw new Error('Failed to fetch article');
        const result = await response.json();
        
        // Handle new API response structure
        if (!result.success || !result.data) {
          throw new Error(result.error?.message || 'Failed to fetch article');
        }
        
        const data = result.data;
        setArticle(data);

        const enTranslation = data.translations?.find((t: any) => t.locale === "en");
        const zhTranslation = data.translations?.find((t: any) => t.locale === "zh-HK");

        setFormData({
          category_id: data.category_id,
          slug: data.slug,
          image: data.image_url,
          tags: data.tags || [],
          visibility: data.visibility,
          required_priority: data.required_priority,
          is_published: data.is_published,
          is_highlighted: data.is_highlighted,
          published_at: data.published_at ? toLocalInputValue(data.published_at) : undefined,
          translations: [
            {
              locale: "en",
              title: enTranslation?.title || "",
              excerpt: enTranslation?.excerpt || "",
              description: enTranslation?.description || "",
            },
            {
              locale: "zh-HK",
              title: zhTranslation?.title || "",
              excerpt: zhTranslation?.excerpt || "",
              description: zhTranslation?.description || "",
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching article:', error);
      }
    };

    fetchArticle();
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateArticle(parseInt(resolvedParams.id), formData);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleImageChange = (file: File | null) => {
    setFormData({ ...formData, image: file || undefined });
  };

  // Auto-generate slug from English title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleEnglishTitleChange = (title: string) => {
    const newTranslations = [...formData.translations];
    newTranslations[0] = { ...newTranslations[0], title };
    const slug = generateSlug(title);
    setFormData({ ...formData, translations: newTranslations, slug });
  };

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/articles')}
          className="rounded-full border-2 border-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t('form.editTitle')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('form.editDescription')}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-card p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">{t('form.basicInfo')}</h2>
            <div className="space-y-4">
              {/* Category and Visibility in One Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">{t('form.category')}</Label>
                  <Select
                    value={formData.category_id.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder={t('form.categoryPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter(c => c.is_active)
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility">{t('form.visibility')}</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value: ArticleVisibility) => {
                      // Always set to PRIORITY for member-only, PUBLIC for public
                      const newVisibility = value === 'PUBLIC' ? 'PUBLIC' : 'PRIORITY';
                      setFormData({ 
                        ...formData, 
                        visibility: newVisibility,
                        // Reset priority if switching to PUBLIC
                        required_priority: newVisibility === 'PUBLIC' ? undefined : formData.required_priority
                      });
                    }}
                  >
                    <SelectTrigger id="visibility" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">{t('visibility.public')}</SelectItem>
                      <SelectItem value="PRIORITY">{t('visibility.member')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {formData.visibility === 'PUBLIC' 
                      ? t('form.publicHint')
                      : t('form.memberHint')
                    }
                  </p>
                </div>
              </div>

              {/* Required Membership Level (for Member visibility) */}
              {formData.visibility === 'PRIORITY' && (
                <div className="space-y-2">
                  <Label htmlFor="membershipLevel">{t('form.requiredMembershipLevel')}</Label>
                  <Select
                    value={formData.required_priority?.toString() || ''}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        required_priority: value ? parseInt(value) : undefined,
                      })
                    }
                    required
                  >
                    <SelectTrigger id="membershipLevel" className="w-full">
                      <SelectValue placeholder={t('form.selectMembershipLevel')} />
                    </SelectTrigger>
                    <SelectContent>
                      {membershipLevels.map((level) => (
                        <SelectItem key={level.id} value={level.priority.toString()}>
                          {level.name} {level.priority === 1 ? t('form.allMembers') : `(${t('form.priorityLevel')} ${level.priority}+)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {formData.required_priority === 1 
                      ? t('form.allMembersHint')
                      : t('form.specificMembersHint')
                    }
                  </p>
                </div>
              )}

              {/* Tags/Keywords */}
              <div className="space-y-2">
                <Label htmlFor="tags">{t('form.tags')}</Label>
                <Input
                  id="tags"
                  value={(formData.tags || []).join(', ')}
                  onChange={(e) => {
                    const tagsString = e.target.value;
                    const tagsArray = tagsString
                      .split(',')
                      .map(tag => tag.trim())
                      .filter(tag => tag.length > 0);
                    setFormData({ ...formData, tags: tagsArray });
                  }}
                  placeholder={t('form.tagsPlaceholder')}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {t('form.tagsHint')}
                </p>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>{t('form.image')}</Label>
            <ImageUploadField
              onChange={handleImageChange}
              existingImageUrl={typeof formData.image === 'string' ? formData.image : undefined}
            />
          </div>

          {/* Publishing */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t('form.publishing')}</h2>
            
            {/* Publish Status */}
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) =>
                  setFormData({ ...formData, is_published: e.target.checked })
                }
                className="mt-1 h-4 w-4 rounded border-gray-300"
              />
              <div className="flex-1">
                <Label htmlFor="is_published" className="font-medium">
                  {t('form.publishStatus')}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('form.publishHint')}
                </p>
              </div>
            </div>

            {/* Highlight Article */}
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <input
                type="checkbox"
                id="is_highlighted"
                checked={formData.is_highlighted}
                onChange={(e) =>
                  setFormData({ ...formData, is_highlighted: e.target.checked })
                }
                className="mt-1 h-4 w-4 rounded border-gray-300"
              />
              <div className="flex-1">
                <Label htmlFor="is_highlighted" className="font-medium">
                  {t('form.highlightArticle')}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('form.highlightHint')}
                </p>
              </div>
            </div>

            {formData.is_published && (
              <div className="space-y-2">
                <Label htmlFor="published_at">{t('form.publishDate')}</Label>
                <Input
                  id="published_at"
                  type="datetime-local"
                  value={formData.published_at || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, published_at: e.target.value })
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* Translations */}
        <div className="rounded-lg border bg-card p-6 space-y-6">
          <h2 className="text-lg font-semibold">{t('form.translations')}</h2>

          {/* English Translation */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">🇬🇧 {t('form.english')}</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="en-title">{t('form.title')}</Label>
              <Input
                id="en-title"
                placeholder={t('form.titlePlaceholder')}
                value={formData.translations[0].title}
                onChange={(e) => handleEnglishTitleChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="en-excerpt">{t('form.excerpt')}</Label>
              <textarea
                id="en-excerpt"
                placeholder={t('form.excerptPlaceholder')}
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                value={formData.translations[0].excerpt || ''}
                onChange={(e) => {
                  const newTranslations = [...formData.translations];
                  newTranslations[0] = { ...newTranslations[0], excerpt: e.target.value };
                  setFormData({ ...formData, translations: newTranslations });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="en-description">{t('form.description')}</Label>
              <QuillEditor
                value={formData.translations[0].description}
                onChange={(value) => {
                  const newTranslations = [...formData.translations];
                  newTranslations[0] = { ...newTranslations[0], description: value };
                  setFormData({ ...formData, translations: newTranslations });
                }}
                placeholder={t('form.descriptionPlaceholder')}
              />
            </div>
          </div>

          {/* Chinese Translation */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">🇭🇰 {t('form.chinese')}</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zh-title">{t('form.titleZh')}</Label>
              <Input
                id="zh-title"
                placeholder={t('form.titlePlaceholderZh')}
                value={formData.translations[1].title}
                onChange={(e) => {
                  const newTranslations = [...formData.translations];
                  newTranslations[1] = { ...newTranslations[1], title: e.target.value };
                  setFormData({ ...formData, translations: newTranslations });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zh-excerpt">{t('form.excerptZh')}</Label>
              <textarea
                id="zh-excerpt"
                placeholder={t('form.excerptPlaceholderZh')}
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                value={formData.translations[1].excerpt || ''}
                onChange={(e) => {
                  const newTranslations = [...formData.translations];
                  newTranslations[1] = { ...newTranslations[1], excerpt: e.target.value };
                  setFormData({ ...formData, translations: newTranslations });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zh-description">{t('form.descriptionZh')}</Label>
              <QuillEditor
                value={formData.translations[1].description}
                onChange={(value) => {
                  const newTranslations = [...formData.translations];
                  newTranslations[1] = { ...newTranslations[1], description: value };
                  setFormData({ ...formData, translations: newTranslations });
                }}
                placeholder={t('form.descriptionPlaceholderZh')}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 sticky bottom-0 bg-background p-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/articles')}
          >
            {t('form.cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t('form.updating') : t('form.update')}
          </Button>
        </div>
      </form>
    </div>
  );
}
