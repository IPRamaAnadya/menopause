"use client";

import { useState, useMemo, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Plus, Pencil, Trash2, Search, XCircle, User, Mail, Calendar, Award } from "lucide-react";
import { 
  useMemberships, 
  useMembershipActions,
  useMembershipLevels,
  Membership,
  MembershipStatus,
} from "@/features/membership";

export default function MembershipsPage() {
  const t = useTranslations("Memberships");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const pageLimit = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { memberships, pagination, loading, refresh } = useMemberships({
    page: currentPage,
    limit: pageLimit,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: debouncedSearch,
  });
  
  const { levels } = useMembershipLevels();
  const { 
    createMembership, 
    updateMembership, 
    deleteMembership,
    cancelMembership,
    loading: actionLoading 
  } = useMembershipActions(refresh);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
  const [users, setUsers] = useState<Array<{ id: number; name: string; email: string }>>([]);
  const [formData, setFormData] = useState({
    user_id: "",
    membership_level_id: "",
    start_date: "",
    end_date: "",
    status: "ACTIVE" as MembershipStatus,
  });

  // Fetch users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        const result = await response.json();
        if (result.data) {
          setUsers(result.data.map((u: any) => ({ id: u.id, name: u.name, email: u.email })));
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  // Get users with active memberships
  const usersWithActiveMemberships = useMemo(() => {
    return new Set(
      memberships
        .filter(m => m.status === 'ACTIVE')
        .map(m => m.user_id)
    );
  }, [memberships]);

  // Available users (users without active memberships)
  const availableUsers = useMemo(() => {
    return users.filter(user => !usersWithActiveMemberships.has(user.id));
  }, [users, usersWithActiveMemberships]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMembership) {
        await updateMembership(editingMembership.id, {
          membership_level_id: parseInt(formData.membership_level_id),
          start_date: formData.start_date,
          end_date: formData.end_date,
          status: formData.status,
        });
      } else {
        await createMembership({
          user_id: parseInt(formData.user_id),
          membership_level_id: parseInt(formData.membership_level_id),
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by useMembershipActions
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("actions.deleteConfirm"))) {
      await deleteMembership(id);
    }
  };

  const handleCancel = async (id: number) => {
    if (confirm(t("actions.cancelConfirm"))) {
      await cancelMembership(id);
    }
  };

  const handleEdit = (membership: Membership) => {
    setEditingMembership(membership);
    setFormData({
      user_id: String(membership.user_id),
      membership_level_id: String(membership.membership_level_id),
      start_date: new Date(membership.start_date).toISOString().split('T')[0],
      end_date: new Date(membership.end_date).toISOString().split('T')[0],
      status: membership.status as MembershipStatus,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      user_id: "",
      membership_level_id: "",
      start_date: "",
      end_date: "",
      status: "ACTIVE" as MembershipStatus,
    });
    setEditingMembership(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      EXPIRED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    };
    return colors[status as keyof typeof colors] || colors.ACTIVE;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-45">
            <SelectValue placeholder={t("filter.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filter.all")}</SelectItem>
            <SelectItem value="ACTIVE">{t("filter.active")}</SelectItem>
            <SelectItem value="EXPIRED">{t("filter.expired")}</SelectItem>
            <SelectItem value="CANCELLED">{t("filter.cancelled")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Grid View */}
      <div className="grid gap-4 sm:hidden">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("loading")}
          </div>
        ) : memberships.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("noData")}
          </div>
        ) : (
          memberships.map((membership) => (
            <div key={membership.id} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">{membership.user?.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {membership.user?.email}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(membership)}
                    disabled={actionLoading}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {membership.status === 'ACTIVE' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(membership.id)}
                      disabled={actionLoading}
                      className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(membership.id)}
                    disabled={actionLoading}
                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Award className="h-4 w-4" />
                    {membership.membership_level?.name}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(membership.status)}`}>
                    {t(`status.${membership.status}`)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">{t("table.startDate")}</div>
                    <div className="font-medium">{formatDate(membership.start_date)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{t("table.endDate")}</div>
                    <div className="font-medium">{formatDate(membership.end_date)}</div>
                  </div>
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
              <TableHead>{t("table.user")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("table.email")}</TableHead>
              <TableHead>{t("table.level")}</TableHead>
              <TableHead>{t("table.status")}</TableHead>
              <TableHead className="hidden lg:table-cell">{t("table.startDate")}</TableHead>
              <TableHead className="hidden lg:table-cell">{t("table.endDate")}</TableHead>
              <TableHead className="text-right">{t("table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  {t("loading")}
                </TableCell>
              </TableRow>
            ) : memberships.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  {t("noData")}
                </TableCell>
              </TableRow>
            ) : (
              memberships.map((membership) => (
                <TableRow key={membership.id}>
                  <TableCell className="font-medium">{membership.user?.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{membership.user?.email}</TableCell>
                  <TableCell>{membership.membership_level?.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(membership.status)}`}>
                      {t(`status.${membership.status}`)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{formatDate(membership.start_date)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{formatDate(membership.end_date)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(membership)}
                        disabled={actionLoading}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {membership.status === 'ACTIVE' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(membership.id)}
                          disabled={actionLoading}
                          className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(membership.id)}
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

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
          totalItems={pagination.total}
          itemsPerPage={pageLimit}
        />
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-125">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingMembership ? t("dialog.editTitle") : t("dialog.addTitle")}
              </DialogTitle>
              <DialogDescription>
                {editingMembership ? t("dialog.editDescription") : t("dialog.addDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="user_id">{t("form.user")} *</Label>
                <Select 
                  value={formData.user_id} 
                  onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                  disabled={!!editingMembership}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("form.userPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {editingMembership ? (
                      // Show only the current user when editing
                      <SelectItem value={String(formData.user_id)}>
                        {memberships.find(m => m.id === editingMembership.id)?.user?.name} ({memberships.find(m => m.id === editingMembership.id)?.user?.email})
                      </SelectItem>
                    ) : availableUsers.length > 0 ? (
                      // Show only users without active memberships when adding
                      availableUsers.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-users" disabled>
                        No available users (all have active memberships)
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {!editingMembership && availableUsers.length === 0 && (
                  <p className="text-xs text-amber-600">
                    All users already have active memberships. You can edit existing memberships instead.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="membership_level_id">{t("form.membershipLevel")} *</Label>
                <Select 
                  value={formData.membership_level_id} 
                  onValueChange={(value) => setFormData({ ...formData, membership_level_id: value })}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("form.membershipLevelPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.id} value={String(level.id)}>
                        {level.name} (HK${level.price.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">{t("form.startDate")}</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">{t("form.endDate")}</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full"
                />
              </div>

              {editingMembership && (
                <div className="space-y-2">
                  <Label htmlFor="status">{t("form.status")}</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value as MembershipStatus })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("form.statusPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">{t("status.ACTIVE")}</SelectItem>
                      <SelectItem value="EXPIRED">{t("status.EXPIRED")}</SelectItem>
                      <SelectItem value="CANCELLED">{t("status.CANCELLED")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                {t("actions.cancelButton")}
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? t("actions.saving") : editingMembership ? t("actions.update") : t("actions.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
