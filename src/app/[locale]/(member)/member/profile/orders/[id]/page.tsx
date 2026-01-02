"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  ShoppingBag,
  Calendar,
  CreditCard,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileText,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrderDetail } from "@/features/orders/hooks/useOrders";

type OrderStatusType = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED";

export default function OrderDetailPage() {
  const params = useParams();
  const t = useTranslations("Lounge.profile");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const orderId = params.id as string;

  const { order, loading, error } = useOrderDetail(orderId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "zh-HK" ? "zh-HK" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
        icon: AlertCircle,
      },
      PAID: {
        label: locale === "zh-HK" ? "已付款" : "Paid",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      FAILED: {
        label: locale === "zh-HK" ? "失敗" : "Failed",
        color: "bg-red-100 text-red-800",
        icon: AlertCircle,
      },
      REFUNDED: {
        label: locale === "zh-HK" ? "已退款" : "Refunded",
        color: "bg-gray-100 text-gray-800",
        icon: CheckCircle,
      },
      CANCELLED: {
        label: locale === "zh-HK" ? "已取消" : "Cancelled",
        color: "bg-gray-100 text-gray-800",
        icon: AlertCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}
      >
        <Icon className="h-4 w-4" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {locale === "zh-HK" ? "訂單不存在" : "Order Not Found"}
            </h3>
            <p className="text-gray-600 mb-4">
              {error || (locale === "zh-HK" ? "找不到此訂單" : "This order could not be found")}
            </p>
            <Link href={`/${locale}/member/profile/orders`}>
              <Button variant="outline">
                {locale === "zh-HK" ? "返回訂單列表" : "Back to Orders"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/member/profile/orders`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
            {locale === "zh-HK" ? "返回訂單列表" : "Back to Orders"}
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {locale === "zh-HK" ? "訂單詳情" : "Order Details"}
              </h1>
              <p className="text-gray-600">
                {locale === "zh-HK" ? "訂單編號" : "Order"}: {order.order_number}
              </p>
            </div>
            {getStatusBadge(order.status as OrderStatusType)}
          </div>
        </div>

        {/* Order Type Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {getOrderTypeLabel(order.type)}
              </h2>
              <p className="text-sm text-gray-600">
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {locale === "zh-HK" ? "訂單摘要" : "Order Summary"}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">
                {locale === "zh-HK" ? "基本金額" : "Base Amount"}
              </span>
              <span className="font-medium text-gray-900">
                {formatAmount(order.breakdown.base, order.currency)}
              </span>
            </div>
            {order.breakdown.admin_fee && order.breakdown.admin_fee > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">
                  {locale === "zh-HK" ? "行政費" : "Admin Fee"}
                </span>
                <span className="font-medium text-gray-900">
                  {formatAmount(order.breakdown.admin_fee, order.currency)}
                </span>
              </div>
            )}
            {order.breakdown.tax && order.breakdown.tax > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">
                  {locale === "zh-HK" ? "稅項" : "Tax"}
                </span>
                <span className="font-medium text-gray-900">
                  {formatAmount(order.breakdown.tax, order.currency)}
                </span>
              </div>
            )}
            {order.breakdown.discount && order.breakdown.discount > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">
                  {locale === "zh-HK" ? "折扣" : "Discount"}
                </span>
                <span className="font-medium text-green-600">
                  -{formatAmount(order.breakdown.discount, order.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="text-lg font-semibold text-gray-900">
                {locale === "zh-HK" ? "總計" : "Total"}
              </span>
              <span className="text-lg font-bold text-gray-900">
                {formatAmount(order.gross_amount, order.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {order.payments && order.payments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === "zh-HK" ? "付款資訊" : "Payment Information"}
            </h2>
            {order.payments.map((payment, index) => (
              <div key={payment.id} className="space-y-3">
                {index > 0 && <div className="border-t border-gray-200 my-4" />}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {payment.provider === "ADMIN"
                          ? locale === "zh-HK"
                            ? "管理員付款"
                            : "Admin Payment"
                          : payment.provider}
                      </p>
                      {payment.payment_method && (
                        <p className="text-sm text-gray-600 capitalize">
                          {payment.payment_method}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      payment.status === "SUCCEEDED"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {payment.status === "SUCCEEDED"
                      ? locale === "zh-HK"
                        ? "成功"
                        : "Succeeded"
                      : payment.status === "PENDING"
                      ? locale === "zh-HK"
                        ? "待處理"
                        : "Pending"
                      : locale === "zh-HK"
                      ? "失敗"
                      : "Failed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Dates */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {locale === "zh-HK" ? "訂單時間" : "Order Timeline"}
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">
                  {locale === "zh-HK" ? "創建日期" : "Created"}
                </p>
                <p className="font-medium text-gray-900">
                  {formatDate(order.created_at)}
                </p>
              </div>
            </div>
            {order.paid_at && (
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">
                    {locale === "zh-HK" ? "付款日期" : "Paid"}
                  </p>
                  <p className="font-medium text-gray-900">
                    {formatDate(order.paid_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
