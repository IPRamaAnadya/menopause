"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  FolderTree,
  GripVertical,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Category, CreateCategoryDTO } from "@/features/articles/types";
import { useCategories } from "@/features/articles/hooks/useCategories";
import { useCategoryActions } from "@/features/articles/hooks/useCategoryActions";

export default function CategoryManagementPage() {
  const t = useTranslations('CategoryManagement');
  const { categories, loading, refresh } = useCategories();
  const { createCategory, updateCategory, deleteCategory, loading: actionLoading } =
    useCategoryActions(refresh);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">("all");

  const [formData, setFormData] = useState<CreateCategoryDTO>({
    slug: "",
    parent_id: undefined,
    is_active: true,
    translations: [
      { locale: "en", name: "", description: "" },
      { locale: "zh-HK", name: "", description: "" },
    ],
  });

  const filteredCategories = useMemo(() => {
    return categories
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && c.is_active) ||
          (statusFilter === "inactive" && !c.is_active);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.order - b.order);
  }, [categories, searchQuery, statusFilter]);

  const resetForm = () => {
    setFormData({
      slug: "",
      parent_id: undefined,
      is_active: true,
      translations: [
        { locale: "en", name: "", description: "" },
        { locale: "zh-HK", name: "", description: "" },
      ],
    });
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch {
      // Error handled by useCategoryActions
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    
    const enTranslation = category.translations?.find(t => t.locale === "en");
    const zhTranslation = category.translations?.find(t => t.locale === "zh-HK");
    
    setFormData({
      slug: category.slug,
      parent_id: category.parent_id,
      is_active: category.is_active,
      order: category.order,
      translations: [
        {
          locale: "en",
          name: enTranslation?.name || "",
          description: enTranslation?.description || "",
        },
        {
          locale: "zh-HK",
          name: zhTranslation?.name || "",
          description: zhTranslation?.description || "",
        },
      ],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('actions.deleteConfirm'))) {
      await deleteCategory(id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  // Drag and drop setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredCategories.findIndex((c) => c.id === active.id);
      const newIndex = filteredCategories.findIndex((c) => c.id === over.id);

      const reorderedCategories = arrayMove(filteredCategories, oldIndex, newIndex);

      const categoriesWithNewOrder = reorderedCategories.map((category, index) => ({
        id: category.id,
        order: index,
      }));

      try {
        const response = await fetch("/api/admin/categories/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categories: categoriesWithNewOrder }),
        });

        if (!response.ok) {
          throw new Error("Failed to update order");
        }

        toast.success(t('orderUpdated'));
        refresh();
      } catch (error) {
        toast.error(t('orderFailed'));
        console.error("Error updating order:", error);
      }
    }
  };

  // Sortable Card Component for Mobile
  function SortableCard({ category }: { category: Category }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: category.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const parentCategory = categories.find(c => c.id === category.parent_id);

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-lg border bg-card p-4 space-y-3 touch-none"
      >
        {/* Drag Handle & Status */}
        <div className="flex items-center justify-between">
          <div className="cursor-move" {...attributes} {...listeners}>
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              category.is_active
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {category.is_active ? t('status.active') : t('status.inactive')}
          </span>
        </div>

        {/* Category Info */}
        <div className="min-w-0">
          <h3 className="font-medium text-base mb-1">{category.name}</h3>
          <p className="text-xs text-muted-foreground mb-2">{t('slugLabel')} {category.slug}</p>
          {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {category.description}
            </p>
          )}
          {parentCategory && (
            <p className="text-xs text-muted-foreground mt-2">
              {t('parentLabel')} {parentCategory.name}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(category)}
            disabled={actionLoading}
            className="flex-1"
          >
            <Pencil className="h-4 w-4 mr-2" />
            {t('actions.edit')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(category.id)}
            disabled={actionLoading}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Sortable Row Component for Desktop
  function SortableRow({ category }: { category: Category }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: category.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const parentCategory = categories.find(c => c.id === category.parent_id);

    return (
      <tr
        ref={setNodeRef}
        style={style}
        className="hover:bg-muted/50 transition-colors"
      >
        <td className="px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center gap-2 cursor-move" {...attributes} {...listeners}>
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
        </td>
        <td className="px-3 py-3 sm:px-4 sm:py-4">
          <div className="min-w-0">
            <p className="font-medium mb-1">{category.name}</p>
            <p className="text-sm text-muted-foreground">{t('slugLabel')} {category.slug}</p>
            {parentCategory && (
              <p className="text-xs text-muted-foreground mt-1">
                {t('parentLabel')} {parentCategory.name}
              </p>
            )}
          </div>
        </td>
        <td className="px-3 py-3 sm:px-4 sm:py-4">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
              category.is_active
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {category.is_active ? t('status.active') : t('status.inactive')}
          </span>
        </td>
        <td className="px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(category)}
              disabled={actionLoading}
              className="h-9 w-9 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(category.id)}
              disabled={actionLoading}
              className="text-destructive hover:text-destructive h-9 w-9 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>
    );
  }

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
        <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
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
            <SelectItem value="active">{t('activeOnly')}</SelectItem>
            <SelectItem value="inactive">{t('inactiveOnly')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories List/Table */}
      {filteredCategories.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <FolderTree className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('noCategories')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('getStarted')}
          </p>
          <Button onClick={() => setIsDialogOpen(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            {t('addButton')}
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {/* Mobile Card View */}
          <div className="md:hidden">
            <SortableContext
              items={filteredCategories.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {filteredCategories.map((category) => (
                  <SortableCard key={category.id} category={category} />
                ))}
              </div>
            </SortableContext>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium w-12"></th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('table.category')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('table.status')}</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">{t('table.actions')}</th>
                  </tr>
                </thead>
                <SortableContext
                  items={filteredCategories.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="divide-y">
                    {filteredCategories.map((category) => (
                      <SortableRow key={category.id} category={category} />
                    ))}
                  </tbody>
                </SortableContext>
              </table>
            </div>
          </div>
        </DndContext>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? t('dialog.editTitle') : t('dialog.addTitle')}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? t('dialog.editDescription')
                : t('dialog.addDescription')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">{t('dialog.slug')}</Label>
                <Input
                  id="slug"
                  placeholder={t('dialog.slugPlaceholder')}
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {t('dialog.slugHint')}
                </p>
              </div>

              {/* Parent Category */}
              <div className="space-y-2">
                <Label htmlFor="parent">{t('dialog.parent')}</Label>
                <Select 
                  value={formData.parent_id?.toString() || "none"} 
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    parent_id: value === "none" ? undefined : parseInt(value) 
                  })}
                >
                  <SelectTrigger id="parent">
                    <SelectValue placeholder={t('dialog.parentPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('dialog.noParent')}</SelectItem>
                    {categories
                      .filter(c => editingCategory ? c.id !== editingCategory.id : true)
                      .map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              {/* Translations Section */}
              <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
                <h4 className="font-medium text-sm">{t('dialog.translations')}</h4>
                
                {/* English Translation */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">🇬🇧 {t('dialog.english')}</span>
                  </div>
                  <div>
                    <Label htmlFor="en-name">{t('dialog.name')}</Label>
                    <Input
                      id="en-name"
                      placeholder={t('dialog.namePlaceholder')}
                      value={formData.translations?.[0]?.name || ""}
                      onChange={(e) => {
                        const newTranslations = [...(formData.translations || [])];
                        newTranslations[0] = { ...newTranslations[0], locale: "en", name: e.target.value };
                        setFormData({ ...formData, translations: newTranslations });
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="en-description">{t('dialog.description')}</Label>
                    <textarea
                      id="en-description"
                      placeholder={t('dialog.descriptionPlaceholder')}
                      className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      value={formData.translations?.[0]?.description || ""}
                      onChange={(e) => {
                        const newTranslations = [...(formData.translations || [])];
                        newTranslations[0] = { ...newTranslations[0], locale: "en", description: e.target.value };
                        setFormData({ ...formData, translations: newTranslations });
                      }}
                    />
                  </div>
                </div>

                {/* Chinese Translation */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">🇭🇰 {t('dialog.chinese')}</span>
                  </div>
                  <div>
                    <Label htmlFor="zh-name">{t('dialog.nameZh')}</Label>
                    <Input
                      id="zh-name"
                      placeholder={t('dialog.namePlaceholderZh')}
                      value={formData.translations?.[1]?.name || ""}
                      onChange={(e) => {
                        const newTranslations = [...(formData.translations || [])];
                        newTranslations[1] = { ...newTranslations[1], locale: "zh-HK", name: e.target.value };
                        setFormData({ ...formData, translations: newTranslations });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zh-description">{t('dialog.descriptionZh')}</Label>
                    <textarea
                      id="zh-description"
                      placeholder={t('dialog.descriptionPlaceholderZh')}
                      className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      value={formData.translations?.[1]?.description || ""}
                      onChange={(e) => {
                        const newTranslations = [...(formData.translations || [])];
                        newTranslations[1] = { ...newTranslations[1], locale: "zh-HK", description: e.target.value };
                        setFormData({ ...formData, translations: newTranslations });
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />
                <div className="flex-1">
                  <Label htmlFor="is_active" className="font-medium">
                    {t('dialog.activeStatus')}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('dialog.activeHint')}
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                {t('dialog.cancel')}
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading
                  ? editingCategory
                    ? t('dialog.updating')
                    : t('dialog.creating')
                  : editingCategory
                  ? t('dialog.update')
                  : t('dialog.create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
