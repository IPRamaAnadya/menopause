"use client";

import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Globe,
  Clock,
  User,
  Ticket,
  CheckCircle,
  Download,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { useTicketDetail } from "@/features/event/hooks/useTickets";

type TicketStatus = "PENDING" | "PAID" | "CANCELLED" | "ATTENDED";

export default function TicketDetailPage() {
  const params = useParams();
  const t = useTranslations("Lounge.profile");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const ticketId = params.id as string;

  const { ticket, loading, error } = useTicketDetail(ticketId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "zh-HK" ? "zh-HK" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getStatusBadge = (status: TicketStatus) => {
    const statusConfig = {
      PENDING: {
        label: locale === "zh-HK" ? "待確認" : "Pending Confirmation",
        className: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      },
      PAID: {
        label: locale === "zh-HK" ? "已確認" : "Confirmed",
        className: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      CANCELLED: {
        label: locale === "zh-HK" ? "已取消" : "Cancelled",
        className: "bg-red-100 text-red-800",
        icon: Clock,
      },
      ATTENDED: {
        label: locale === "zh-HK" ? "已參加" : "Attended",
        className: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
      },
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;
    
    return (
      <div className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${config.className}`}>
        <StatusIcon className="h-4 w-4" />
        {config.label}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error or not found state
  if (error || !ticket || !ticket.event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {locale === "zh-HK" ? "找不到門票" : "Ticket Not Found"}
          </h2>
          <p className="text-gray-500 mb-6">
            {error || (locale === "zh-HK" ? "此門票不存在或已被刪除" : "This ticket does not exist or has been removed")}
          </p>
          <Link href={`/${locale}/member/profile/tickets`}>
            <Button>{tCommon("back")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const attendeeInfo = ticket.user || ticket.guest;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/${locale}/member/profile/tickets`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            {locale === "zh-HK" ? "返回門票列表" : "Back to Tickets"}
          </Link>
        </div>

        {/* Ticket Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Event Image */}
          {ticket.event.image_url && (
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={ticket.event.image_url}
                alt={ticket.event.title || 'Event'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {ticket.event.title}
                </h1>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-8">
            {!ticket.event.image_url && (
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                {ticket.event?.title}
              </h1>
            )}

            {/* Status Badge */}
            <div className="mb-6">
              {getStatusBadge(ticket.status as TicketStatus)}
            </div>

            {/* Event Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b">
              {/* Date & Time */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {locale === "zh-HK" ? "日期" : "Date"}
                    </p>
                    <p className="font-medium text-gray-900">
                      {formatDate(ticket.event?.start_date || '')}
                    </p>
                  </div>
                </div>

                {ticket.event?.start_time && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        {locale === "zh-HK" ? "時間" : "Time"}
                      </p>
                      <p className="font-medium text-gray-900">
                        {formatTime(ticket.event.start_time)}
                        {ticket.event.end_time && ` - ${formatTime(ticket.event.end_time)}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    {ticket.event?.is_online ? (
                      <Globe className="h-5 w-5 text-primary" />
                    ) : (
                      <MapPin className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {locale === "zh-HK" ? "地點" : "Location"}
                    </p>
                    {ticket.event?.is_online ? (
                      <div>
                        <p className="font-medium text-gray-900 mb-2">
                          {locale === "zh-HK" ? "線上活動" : "Online Event"}
                        </p>
                        {ticket.event.meeting_url && ticket.status === "PAID" && (
                          <a
                            href={ticket.event.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {locale === "zh-HK" ? "加入會議" : "Join Meeting"} →
                          </a>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-gray-900">
                          {ticket.event?.place_name || 'TBA'}
                        </p>
                        {ticket.event?.place_detail && (
                          <p className="text-sm text-gray-600 mt-1">
                            {ticket.event.place_detail}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {ticket.event?.short_description && (
              <div className="mb-8 pb-8 border-b">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {locale === "zh-HK" ? "活動詳情" : "Event Details"}
                </h2>
                <div className="prose prose-sm max-w-none text-gray-600">
                  <p>{ticket.event.short_description}</p>
                </div>
              </div>
            )}

            {/* Attendee Information */}
            {attendeeInfo && (
              <div className="mb-8 pb-8 border-b">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {locale === "zh-HK" ? "參加者資料" : "Attendee Information"}
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">
                      {"name" in attendeeInfo ? attendeeInfo.name : attendeeInfo.full_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">{attendeeInfo.email}</span>
                  </div>
                  {"phone" in attendeeInfo && attendeeInfo.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">{attendeeInfo.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ticket Information & QR Code */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Ticket Info */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {locale === "zh-HK" ? "門票資訊" : "Ticket Information"}
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {locale === "zh-HK" ? "門票編號" : "Ticket ID"}
                    </span>
                    <span className="font-mono text-sm text-gray-900">
                      #{ticket.public_id.substring(0, 13).toUpperCase()}
                    </span>
                  </div>
                  {ticket.membership_level_id && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {locale === "zh-HK" ? "會員價格" : "Member Price"}
                      </span>
                      <span className="font-medium text-gray-900">{locale === "zh-HK" ? "會員" : "Member"}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {locale === "zh-HK" ? "報名日期" : "Registered Date"}
                    </span>
                    <span className="text-gray-900">
                      {new Date(ticket.registered_at).toLocaleDateString(
                        locale === "zh-HK" ? "zh-HK" : "en-US"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-medium text-gray-900">
                      {locale === "zh-HK" ? "金額" : "Amount"}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {ticket.price === 0
                        ? locale === "zh-HK"
                          ? "免費"
                          : "Free"
                        : `HK$ ${ticket.price.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              {ticket.status === "PAID" && (
                <div className="flex flex-col items-center">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {locale === "zh-HK" ? "入場二維碼" : "Entry QR Code"}
                  </h2>
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                    <QRCodeSVG value={ticket.public_id} size={160} level="H" />
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    {locale === "zh-HK"
                      ? "請在活動當日出示此二維碼"
                      : "Please present this QR code on the event day"}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            {/* {ticket.status === "PAID" && (
              <div className="mt-8 pt-8 border-t">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="flex-1 gap-2">
                    <Download className="h-4 w-4" />
                    {locale === "zh-HK" ? "下載門票" : "Download Ticket"}
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Mail className="h-4 w-4" />
                    {locale === "zh-HK" ? "電郵門票" : "Email Ticket"}
                  </Button>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
