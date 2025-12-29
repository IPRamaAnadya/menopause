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
import { PriceInput } from "@/components/ui/price-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, DollarSign, Calendar } from "lucide-react";
import { useMembershipLevels, useMembershipLevelActions, MembershipLevel } from "@/features/membership";

export default function MembershipLevelsPage() {
  const t = useTranslations("MembershipLevels");
  const { levels, loading, refresh } = useMembershipLevels();
  const { createLevel, updateLevel, deleteLevel, loading: actionLoading } = useMembershipLevelActions(refresh);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<MembershipLevel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    priority: 0,
    price: 0,
    duration_days: 365,
  });

  // Filter levels
  const filteredLevels = useMemo(() => {
    return levels.filter(level => 
      level.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      level.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [levels, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('slug', formData.slug);
      form.append('priority', String(formData.priority));
      form.append('price', String(formData.price));
      form.append('duration_days', String(formData.duration_days));

      if (editingLevel) {
        await updateLevel(editingLevel.id, form);
      } else {
        await createLevel(form);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by useMembershipLevelActions
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("actions.deleteConfirm"))) {
      await deleteLevel(id);
    }
  };

  const handleEdit = (level: MembershipLevel) => {
    setEditingLevel(level);
    setFormData({
      name: level.name,
      slug: level.slug,
      priority: level.priority,
      price: level.price,
      duration_days: level.duration_days,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      priority: 0,
      price: 0,
      duration_days: 365,
    });
    setEditingLevel(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("actions.add")}
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Mobile Grid View */}
      <div className="grid gap-4 sm:hidden">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("loading")}
          </div>
        ) : filteredLevels.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("noData")}
          </div>
        ) : (
          filteredLevels.map((level) => (
            <div key={level.id} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{level.name}</h3>
                  <code className="text-xs rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                    {level.slug}
                  </code>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(level)}
                    disabled={actionLoading}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(level.id)}
                    disabled={actionLoading}
                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                <div>
                  <div className="text-xs text-muted-foreground">{t("table.priority")}</div>
                  <div className="font-medium">{level.priority}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t("table.price")}</div>
                  <div className="font-medium">HK${level.price.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t("table.duration")}</div>
                  <div className="font-medium">{level.duration_days} {t("table.days")}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.priority")}</TableHead>
              <TableHead>{t("table.name")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("table.slug")}</TableHead>
              <TableHead className="text-right">{t("table.price")}</TableHead>
              <TableHead className="hidden lg:table-cell text-right">{t("table.duration")}</TableHead>
              <TableHead className="text-right">{t("table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {t("loading")}
                </TableCell>
              </TableRow>
            ) : filteredLevels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {t("noData")}
                </TableCell>
              </TableRow>
            ) : (
              filteredLevels.map((level) => (
                <TableRow key={level.id}>
                  <TableCell className="font-medium">{level.priority}</TableCell>
                  <TableCell className="font-medium">{level.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                      {level.slug}
                    </code>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-muted-foreground">HK$</span>
                      {level.price.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {level.duration_days} {t("table.days")}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(level)}
                        disabled={actionLoading}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(level.id)}
                        disabled={actionLoading}
                        className="text-destructive hover:text-destructive h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-125">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingLevel ? t("dialog.editTitle") : t("dialog.addTitle")}
              </DialogTitle>
              <DialogDescription>
                {editingLevel ? t("dialog.editDescription") : t("dialog.addDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t("form.name")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (!editingLevel) {
                      setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) });
                    }
                  }}
                  placeholder={t("form.namePlaceholder")}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">{t("form.slug")} *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder={t("form.slugPlaceholder")}
                  required
                />
                <p className="text-xs text-muted-foreground">{t("form.slugHint")}</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">{t("form.priority")} *</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  placeholder="1"
                  required
                  min="0"
                />
                <p className="text-xs text-muted-foreground">{t("form.priorityHint")}</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">{t("form.price")} *</Label>
                <PriceInput
                  id="price"
                  value={formData.price}
                  onChange={(value) => setFormData({ ...formData, price: value })}
                  currency="HK$"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration_days">{t("form.duration")} *</Label>
                <Input
                  id="duration_days"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                  placeholder="365"
                  required
                  min="1"
                />
                <p className="text-xs text-muted-foreground">{t("form.durationHint")}</p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                {t("actions.cancel")}
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? t("actions.saving") : editingLevel ? t("actions.update") : t("actions.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
