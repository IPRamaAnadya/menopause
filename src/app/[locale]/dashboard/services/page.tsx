"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { useServices, useServiceActions, Service, CreateServiceDTO, UpdateServiceDTO } from "@/features/services";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from "react-toastify";
import { ImageUploadField } from '@/components/ui/ImageUploadField';

export default function ServicesManagementPage() {
  const t = useTranslations("ServicesManagement");
  const { services, loading, refresh } = useServices();
  const { createService, updateService, deleteService, loading: actionLoading } = useServiceActions(refresh);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [formData, setFormData] = useState<CreateServiceDTO>({
    is_active: true,
    translations: [
      { locale: "en", title: "", description: "" },
      { locale: "zh-HK", title: "", description: "" },
    ],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Filter and sort services
  const filteredServices = useMemo(() => {
    return services
      .filter(service => {
        const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            service.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" ||
                             (statusFilter === "active" && service.is_active) ||
                             (statusFilter === "inactive" && !service.is_active);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.order - b.order);
  }, [services, searchQuery, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = new FormData();
      if (imageFile) form.append('image', imageFile);
      form.append('is_active', String(formData.is_active));
      form.append('order', editingService ? String(formData.order) : String((services.length > 0 ? Math.max(...services.map(s => s.order)) : -1) + 1));
      form.append('translations', JSON.stringify(formData.translations));
      if (editingService) {
        await updateService(editingService.id, form);
      } else {
        await createService(form);
      }
      setIsDialogOpen(false);
      resetForm();
      setImageFile(null);
      setImagePreview("");
    } catch (error) {
      // Error handled by useServiceActions
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("actions.deleteConfirm"))) {
      await deleteService(id);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setImageFile(null);
    setImagePreview(service.image_url || "");
    
    // Get existing translations or create empty ones
    const enTranslation = service.translations?.find(t => t.locale === "en");
    const zhTranslation = service.translations?.find(t => t.locale === "zh-HK");
    
    setFormData({
      is_active: service.is_active,
      order: service.order, // Include order for updates
      translations: [
        {
          locale: "en",
          title: enTranslation?.title || "",
          description: enTranslation?.description || "",
        },
        {
          locale: "zh-HK",
          title: zhTranslation?.title || "",
          description: zhTranslation?.description || "",
        },
      ],
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      is_active: true,
      translations: [
        { locale: "en", title: "", description: "" },
        { locale: "zh-HK", title: "", description: "" },
      ],
    });
    setEditingService(null);
    setImageFile(null);
    setImagePreview("");
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
      const oldIndex = filteredServices.findIndex((s) => s.id === active.id);
      const newIndex = filteredServices.findIndex((s) => s.id === over.id);

      const reorderedServices = arrayMove(filteredServices, oldIndex, newIndex);

      // Update order values based on new positions
      const servicesWithNewOrder = reorderedServices.map((service, index) => ({
        id: service.id,
        order: index,
      }));

      try {
        // Optimistically update UI
        const response = await fetch('/api/admin/services/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ services: servicesWithNewOrder }),
        });

        if (!response.ok) {
          throw new Error('Failed to update order');
        }

        toast.success('Order updated successfully');
        refresh(); // Refresh to get updated data
      } catch (error) {
        toast.error('Failed to update order');
        console.error('Error updating order:', error);
      }
    }
  };

  // Move service up/down
  const moveService = async (id: number, direction: "up" | "down") => {
    const idx = filteredServices.findIndex(s => s.id === id);
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= filteredServices.length) return;
    const reordered = [...filteredServices];
    [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];
    const servicesWithNewOrder = reordered.map((service, index) => ({ id: service.id, order: index }));
    try {
      await fetch('/api/admin/services/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: servicesWithNewOrder }),
      });
      toast.success('Order updated');
      refresh();
    } catch {
      toast.error('Failed to update order');
    }
  };

  // Sortable Card Component for Mobile
  function SortableCard({ service }: { service: Service }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: service.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

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
              service.is_active
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {service.is_active ? t("status.active") : t("status.inactive")}
          </span>
        </div>

        {/* Service Info */}
        <div className="flex gap-3">
          {service.image_url && (
            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
              <Image
                src={service.image_url}
                alt={service.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-base mb-1">{service.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {service.description}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(service)}
            disabled={actionLoading}
            className="flex-1"
          >
            <Pencil className="h-4 w-4 mr-2" />
            {t("actions.edit")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(service.id)}
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
  function SortableRow({ service }: { service: Service }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: service.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

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
          <div className="flex items-start gap-3">
            {service.image_url && (
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                  src={service.image_url}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{service.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {service.description}
              </p>
            </div>
          </div>
        </td>
        <td className="px-3 py-3 sm:px-4 sm:py-4">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
              service.is_active
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {service.is_active ? t("status.active") : t("status.inactive")}
          </span>
        </td>
        <td className="px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(service)}
              disabled={actionLoading}
              className="h-9 w-9 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(service.id)}
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
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("addButton")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("search")}
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
            <SelectItem value="all">{t("allStatus")}</SelectItem>
            <SelectItem value="active">{t("activeOnly")}</SelectItem>
            <SelectItem value="inactive">{t("inactiveOnly")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Services List/Table */}
      {filteredServices.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("noServices")}</h3>
          <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            {t("addButton")}
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
              items={filteredServices.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {filteredServices.map((service, idx) => (
                  <div key={service.id} className="rounded-lg border bg-card p-4 space-y-3">
                    {/* Service Info */}
                    <div className="flex gap-3">
                      {service.image_url && (
                        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                          <Image src={service.image_url} alt={service.title} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base mb-1">{service.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                      </div>
                    </div>
                    {/* Status & Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${service.is_active ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"}`}>{service.is_active ? t("status.active") : t("status.inactive")}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => moveService(service.id, "up")} disabled={idx === 0}><ArrowUp className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => moveService(service.id, "down")} disabled={idx === filteredServices.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(service)} disabled={actionLoading}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(service.id)} disabled={actionLoading} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
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
                    <th className="px-4 py-3 text-left text-sm font-medium">{t("table.service")}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t("table.status")}</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">{t("table.actions")}</th>
                  </tr>
                </thead>
                <SortableContext
                  items={filteredServices.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="divide-y">
                    {filteredServices.map((service) => (
                      <SortableRow key={service.id} service={service} />
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
              {editingService ? t("dialog.editTitle") : t("dialog.addTitle")}
            </DialogTitle>
            <DialogDescription>
              {editingService ? t("dialog.editDescription") : t("dialog.addDescription")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <ImageUploadField
                  label={t("dialog.image")}
                  name="image"
                  onChange={file => {
                    setImageFile(file);
                    setImagePreview(file ? URL.createObjectURL(file) : "");
                  }}
                  value={imageFile}
                  previewUrl={imagePreview}
                />
              </div>

              {/* Translations Section */}
              <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
                <h4 className="font-medium text-sm">Translations</h4>
                
                {/* English Translation */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">English</Label>
                  </div>
                  <Input
                    placeholder="English title"
                    value={formData.translations?.[0]?.title || ""}
                    onChange={(e) => {
                      const newTranslations = [...(formData.translations || [])];
                      newTranslations[0] = { ...newTranslations[0], locale: "en", title: e.target.value };
                      setFormData({ ...formData, translations: newTranslations });
                    }}
                  />
                  <textarea
                    placeholder="English description"
                    className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    value={formData.translations?.[0]?.description || ""}
                    onChange={(e) => {
                      const newTranslations = [...(formData.translations || [])];
                      newTranslations[0] = { ...newTranslations[0], locale: "en", description: e.target.value };
                      setFormData({ ...formData, translations: newTranslations });
                    }}
                  />
                </div>

                {/* Chinese Translation */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">繁體中文 (Traditional Chinese)</Label>
                  </div>
                  <Input
                    placeholder="中文標題"
                    value={formData.translations?.[1]?.title || ""}
                    onChange={(e) => {
                      const newTranslations = [...(formData.translations || [])];
                      newTranslations[1] = { ...newTranslations[1], locale: "zh-HK", title: e.target.value };
                      setFormData({ ...formData, translations: newTranslations });
                    }}
                  />
                  <textarea
                    placeholder="中文描述"
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
                  <Label htmlFor="is_active" className="cursor-pointer font-medium">
                    {t("dialog.active")}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dialog.activeHint")}
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                {t("dialog.cancel")}
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading
                  ? editingService
                    ? t("dialog.updating")
                    : t("dialog.creating")
                  : editingService
                  ? t("dialog.update")
                  : t("dialog.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
