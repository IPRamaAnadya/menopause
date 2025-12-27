"use client";

import { useMemo, useState } from "react";
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
  HelpCircle,
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

import { FAQ, CreateFAQDTO } from "@/features/faq/types";
import { useFaqs } from "@/features/faq/hooks/useFaqs";
import { useFaqActions } from "@/features/faq/hooks/useFaqActions";

export default function AdminFAQManagementPage() {
  const { faqs, loading, refresh } = useFaqs();
  const { createFaq, updateFaq, deleteFaq, loading: actionLoading } =
    useFaqActions(refresh);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">("all");

  const [formData, setFormData] = useState<CreateFAQDTO>({
    is_active: true,
    translations: [
      { locale: "en", question: "", answer: "" },
      { locale: "zh-HK", question: "", answer: "" },
    ],
  });

  const filteredFaqs = useMemo(() => {
    return faqs
      .filter((f) => {
        const matchesSearch =
          f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.answer.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && f.is_active) ||
          (statusFilter === "inactive" && !f.is_active);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.order - b.order);
  }, [faqs, searchQuery, statusFilter]);

  const resetForm = () => {
    setFormData({
      is_active: true,
      translations: [
        { locale: "en", question: "", answer: "" },
        { locale: "zh-HK", question: "", answer: "" },
      ],
    });
    setEditingFAQ(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFAQ) {
        await updateFaq(editingFAQ.id, formData);
      } else {
        await createFaq(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch {
      // Error handled by useFaqActions
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    
    const enTranslation = faq.translations?.find(t => t.locale === "en");
    const zhTranslation = faq.translations?.find(t => t.locale === "zh-HK");
    
    setFormData({
      is_active: faq.is_active,
      order: faq.order,
      translations: [
        {
          locale: "en",
          question: enTranslation?.question || "",
          answer: enTranslation?.answer || "",
        },
        {
          locale: "zh-HK",
          question: zhTranslation?.question || "",
          answer: zhTranslation?.answer || "",
        },
      ],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      await deleteFaq(id);
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
      const oldIndex = filteredFaqs.findIndex((f) => f.id === active.id);
      const newIndex = filteredFaqs.findIndex((f) => f.id === over.id);

      const reorderedFaqs = arrayMove(filteredFaqs, oldIndex, newIndex);

      const faqsWithNewOrder = reorderedFaqs.map((faq, index) => ({
        id: faq.id,
        order: index,
      }));

      try {
        const response = await fetch("/api/admin/faq/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ faqs: faqsWithNewOrder }),
        });

        if (!response.ok) {
          throw new Error("Failed to update order");
        }

        toast.success("Order updated successfully");
        refresh();
      } catch (error) {
        toast.error("Failed to update order");
        console.error("Error updating order:", error);
      }
    }
  };

  // Sortable Card Component for Mobile
  function SortableCard({ faq }: { faq: FAQ }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: faq.id });

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
              faq.is_active
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {faq.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        {/* FAQ Info */}
        <div className="min-w-0">
          <h3 className="font-medium text-base mb-2">{faq.question}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {faq.answer}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(faq)}
            disabled={actionLoading}
            className="flex-1"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(faq.id)}
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
  function SortableRow({ faq }: { faq: FAQ }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: faq.id });

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
          <div className="min-w-0">
            <p className="font-medium mb-1">{faq.question}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {faq.answer}
            </p>
          </div>
        </td>
        <td className="px-3 py-3 sm:px-4 sm:py-4">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
              faq.is_active
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {faq.is_active ? "Active" : "Inactive"}
          </span>
        </td>
        <td className="px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(faq)}
              disabled={actionLoading}
              className="h-9 w-9 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(faq.id)}
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
          <p className="text-muted-foreground">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">FAQ Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage frequently asked questions
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
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
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* FAQs List/Table */}
      {filteredFaqs.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No FAQs found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first FAQ
          </p>
          <Button onClick={() => setIsDialogOpen(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add FAQ
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
              items={filteredFaqs.map(f => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {filteredFaqs.map((faq) => (
                  <SortableCard key={faq.id} faq={faq} />
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
                    <th className="px-4 py-3 text-left text-sm font-medium">Question</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <SortableContext
                  items={filteredFaqs.map(f => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="divide-y">
                    {filteredFaqs.map((faq) => (
                      <SortableRow key={faq.id} faq={faq} />
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
              {editingFAQ ? "Edit FAQ" : "Add New FAQ"}
            </DialogTitle>
            <DialogDescription>
              {editingFAQ 
                ? "Update the FAQ details below"
                : "Fill in the details to create a new FAQ"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Translations Section */}
              <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
                <h4 className="font-medium text-sm">Translations</h4>
                
                {/* English Translation */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">🇬🇧 English</span>
                  </div>
                  <div>
                    <Label htmlFor="en-question">Question</Label>
                    <Input
                      id="en-question"
                      placeholder="English question"
                      value={formData.translations?.[0]?.question || ""}
                      onChange={(e) => {
                        const newTranslations = [...(formData.translations || [])];
                        newTranslations[0] = { ...newTranslations[0], locale: "en", question: e.target.value };
                        setFormData({ ...formData, translations: newTranslations });
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="en-answer">Answer</Label>
                    <textarea
                      id="en-answer"
                      placeholder="English answer"
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      value={formData.translations?.[0]?.answer || ""}
                      onChange={(e) => {
                        const newTranslations = [...(formData.translations || [])];
                        newTranslations[0] = { ...newTranslations[0], locale: "en", answer: e.target.value };
                        setFormData({ ...formData, translations: newTranslations });
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Chinese Translation */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">🇭🇰 繁體中文</span>
                  </div>
                  <div>
                    <Label htmlFor="zh-question">問題</Label>
                    <Input
                      id="zh-question"
                      placeholder="中文問題"
                      value={formData.translations?.[1]?.question || ""}
                      onChange={(e) => {
                        const newTranslations = [...(formData.translations || [])];
                        newTranslations[1] = { ...newTranslations[1], locale: "zh-HK", question: e.target.value };
                        setFormData({ ...formData, translations: newTranslations });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zh-answer">答案</Label>
                    <textarea
                      id="zh-answer"
                      placeholder="中文答案"
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      value={formData.translations?.[1]?.answer || ""}
                      onChange={(e) => {
                        const newTranslations = [...(formData.translations || [])];
                        newTranslations[1] = { ...newTranslations[1], locale: "zh-HK", answer: e.target.value };
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
                    Active Status
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Active FAQs will be visible to users on the website
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading
                  ? editingFAQ
                    ? "Updating..."
                    : "Creating..."
                  : editingFAQ
                  ? "Update FAQ"
                  : "Create FAQ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
