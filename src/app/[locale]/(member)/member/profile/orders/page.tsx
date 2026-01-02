"use client";

import { useState } from "react";
import React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  ShoppingBag,
  Calendar,
  Users,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/features/orders/hooks/useOrders";

type OrderStatusType = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED";

export default function OrderHistoryPage() {
  const t = useTranslations("Lounge.profile");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "pending">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Get status for API based on active tab
  const getStatusFilter = () => {
    if (activeTab === "completed") return "PAID";
    if (activeTab === "pending") return "PENDING";
    return undefined;
  };

  const { orders: filteredOrders, total, loading, error, refetch } = useOrders({
    status: getStatusFilter(),
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  });

  // Reset to page 1 when switching tabs
  const handleTabChange = (tab: "all" | "completed" | "pending") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(total / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + filteredOrders.length;

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "zh-HK" ? "zh-HK" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale === "zh-HK" ? "zh-HK" : "en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getOrderTypeLabel = (type: string) => {
    const types: Record<string, { en: string; zh: string }> = {
      SUBSCRIPTION: { en: "Subscription", zh: "訂閱" },
      EVENT: { en: "Event Registration", zh: "活動登記" },
      PRODUCT: { en: "Product", zh: "產品" },
      MEMBERSHIP_PURCHASE: { en: "Membership Purchase", zh: "會籍購買" },
      MEMBERSHIP_RENEWAL: { en: "Membership Renewal", zh: "會籍續期" },
      MEMBERSHIP_UPGRADE: { en: "Membership Upgrade", zh: "會籍升級" },
      MEMBERSHIP_DOWNGRADE: { en: "Membership Downgrade", zh: "會籍降級" },
    };
    return locale === "zh-HK" ? types[type]?.zh || type : types[type]?.en || type;
  };

  const getStatusBadge = (status: OrderStatusType) => {
    const statusConfig = {
      PENDING: {
        label: locale === "zh-HK" ? "待處理" : "Pending",
        color: "bg-yellow-100 text-yellow-800",
      },
      PAID: {
        label: locale === "zh-HK" ? "已付款" : "Paid",
        color: "bg-green-100 text-green-800",
      },
      FAILED: {
        label: locale === "zh-HK" ? "失敗" : "Failed",
        color: "bg-red-100 text-red-800",
      },
      REFUNDED: {
        label: locale === "zh-HK" ? "已退款" : "Refunded",
        color: "bg-gray-100 text-gray-800",
      },
      CANCELLED: {
        label: locale === "zh-HK" ? "已取消" : "Cancelled",
        color: "bg-gray-100 text-gray-800",
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getOrderTypeIcon = (type: string) => {
    if (type === "EVENT") return <Calendar className="h-5 w-5" />;
    if (type.includes("MEMBERSHIP")) return <Users className="h-5 w-5" />;
    return <ShoppingBag className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {locale === "zh-HK" ? "載入失敗" : "Failed to Load"}
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              {locale === "zh-HK" ? "重試" : "Retry"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b">
          <Link
            href={`/${locale}/member/profile`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            {tCommon("back")}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">{t("orderHistory")}</h1>
          </div>
          <p className="text-sm text-gray-500">
            {locale === "zh-HK"
              ? "查看您的訂單和付款記錄"
              : "View your order and payment history"}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b">
          <div className="flex gap-8">
            <button
              onClick={() => handleTabChange("all")}
              className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                activeTab === "all"
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {locale === "zh-HK" ? "全部訂單" : "All Orders"}
              {activeTab === "all" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => handleTabChange("completed")}
              className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                activeTab === "completed"
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {locale === "zh-HK" ? "已完成" : "Completed"}
              {activeTab === "completed" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => handleTabChange("pending")}
              className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                activeTab === "pending"
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {locale === "zh-HK" ? "待處理" : "Pending"}
              {activeTab === "pending" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Order List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {activeTab === "all"
                ? locale === "zh-HK"
                  ? "您還沒有任何訂單"
                  : "You don't have any orders yet"
                : activeTab === "completed"
                ? locale === "zh-HK"
                  ? "沒有已完成的訂單"
                  : "No completed orders"
                : locale === "zh-HK"
                ? "沒有待處理的訂單"
                : "No pending orders"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="block border rounded-xl hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                        {getOrderTypeIcon(order.type)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base mb-1">
                          {getOrderTypeLabel(order.type)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {locale === "zh-HK" ? "訂單編號" : "Order"}: {order.order_number}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(order.status as OrderStatusType)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      {formatAmount(order.gross_amount, order.currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > itemsPerPage && (
          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <div className="text-sm text-gray-500">
              {locale === "zh-HK"
                ? `顯示 ${startIndex + 1}-${Math.min(endIndex, total)} / 共 ${total} 筆`
                : `Showing ${startIndex + 1}-${Math.min(endIndex, total)} of ${total}`}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                {locale === "zh-HK" ? "上一頁" : "Previous"}
              </Button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-1 text-gray-400">...</span>
                    ) : (
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page as number)}
                        className="min-w-[2.5rem]"
                      >
                        {page}
                      </Button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                {locale === "zh-HK" ? "下一頁" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
