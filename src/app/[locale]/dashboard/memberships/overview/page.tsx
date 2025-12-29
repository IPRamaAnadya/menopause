"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface MembershipLevel {
  id: number;
  name: string;
  price: number;
  duration_days: number;
}

interface LastMembership {
  id: number;
  status: string;
  start_date: string;
  end_date: string;
  membership_level: MembershipLevel;
  created_at: string;
}

interface MemberWithMembership {
  id: number;
  name: string;
  email: string;
  created_at: string;
  last_membership: LastMembership | null;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function MembershipsOverviewPage() {
  const t = useTranslations("Admin");
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MemberWithMembership[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchMembers();
  }, [pagination.page, search]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/memberships/overview?${params}`);
      const result = await response.json();

      if (result.success) {
        setMembers(result.data.data);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'EXPIRED':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      case 'STOPPED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("memberships.overview")}</h1>
        <p className="text-muted-foreground">{t("memberships.overviewDescription")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("memberships.membersList")}
          </CardTitle>
          <CardDescription>{t("memberships.membersDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("memberships.searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch}>
              {t("memberships.search")}
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("memberships.noMembers")}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("memberships.member")}</TableHead>
                      <TableHead>{t("memberships.membershipLevel")}</TableHead>
                      <TableHead>{t("memberships.status")}</TableHead>
                      <TableHead>{t("memberships.startDate")}</TableHead>
                      <TableHead>{t("memberships.endDate")}</TableHead>
                      <TableHead className="text-right">{t("memberships.price")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.last_membership ? (
                            <span className="font-medium">
                              {member.last_membership.membership_level.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{t("memberships.noMembership")}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {member.last_membership ? (
                            <Badge variant={getStatusVariant(member.last_membership.status)}>
                              {member.last_membership.status}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {member.last_membership ? (
                            <span className="text-sm">
                              {new Date(member.last_membership.start_date).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {member.last_membership ? (
                            <span className="text-sm">
                              {new Date(member.last_membership.end_date).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {member.last_membership ? (
                            <span className="font-semibold">
                              HK${member.last_membership.membership_level.price.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  {t("memberships.showing", {
                    from: (pagination.page - 1) * pagination.limit + 1,
                    to: Math.min(pagination.page * pagination.limit, pagination.total),
                    total: pagination.total,
                  })}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t("memberships.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    {t("memberships.next")}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
