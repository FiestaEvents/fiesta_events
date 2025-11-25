import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  DollarSign,
  FileText,
  ExternalLink,
  AlignLeft,
  Tag
} from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";
import { useTranslation } from "react-i18next";

const EventInfo = ({ event, formatDate, onNavigateToClient }) => {
  const { t } = useTranslation();

  // Helper component for single-line rows
  const InfoRow = ({ icon: Icon, label, value, onClick, isLink, color = "orange" }) => {
    if (!value && value !== 0) return null;

    const colorClasses = {
      orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
      blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      gray: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    };

    return (
      <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[color] || colorClasses.gray}`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
            {label}
          </div>
          
          {isLink && onClick ? (
            <button
              onClick={onClick}
              className="text-sm font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1 group transition-colors"
            >
              <span className="truncate">{value}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
          ) : (
            <div className="text-sm font-semibold text-gray-900 dark:text-white break-words">
              {value}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <AlignLeft className="w-5 h-5 text-orange-500" />
        {t("eventInfo.title", "Event Details")}
      </h2>

      <div className="flex flex-col gap-1">
        
        {/* --- TIMING --- */}
        <InfoRow
          icon={Calendar}
          label={t("eventInfo.fields.startDate")}
          value={formatDate(event.startDate)}
          color="orange"
        />
        
        {event.endDate && event.endDate !== event.startDate && (
          <InfoRow
            icon={Calendar}
            label={t("eventInfo.fields.endDate")}
            value={formatDate(event.endDate)}
            color="orange"
          />
        )}

        {(event.startTime || event.endTime) && (
          <InfoRow
            icon={Clock}
            label={t("eventInfo.fields.time")}
            value={`${event.startTime || "00:00"} - ${event.endTime || "..."}`}
            color="blue"
          />
        )}

        {/* --- LOCATION & PEOPLE --- */}
        <InfoRow
          icon={MapPin}
          label={t("eventInfo.fields.venueSpace")}
          value={event.venueSpace?.name}
          color="green"
        />

        <InfoRow
          icon={Users}
          label={t("eventInfo.fields.guestCount")}
          value={event.guestCount ? `${event.guestCount} ${t("eventInfo.values.guests")}` : null}
          color="purple"
        />

        <InfoRow
          icon={User}
          label={t("eventInfo.fields.client")}
          value={event.clientId?.name || event.clientId?.email}
          onClick={onNavigateToClient}
          isLink={true}
          color="blue"
        />

        {/* --- FINANCIALS --- */}
        <InfoRow
          icon={DollarSign}
          label={t("eventInfo.fields.totalAmount")}
          value={event.pricing?.totalAmount !== undefined ? formatCurrency(event.pricing.totalAmount) : null}
          color="green"
        />

        {event.pricing?.discount > 0 && (
          <InfoRow
            icon={Tag}
            label={t("eventInfo.fields.discount")}
            value={
              event.pricing.discountType === "percentage"
                ? `${event.pricing.discount}%`
                : formatCurrency(event.pricing.discount)
            }
            color="gray"
          />
        )}
      </div>

      {/* --- LONG FORM CONTENT --- */}
      <div className="mt-6 space-y-4">
        {event.description && (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              {t("eventInfo.fields.description")}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {event.description}
            </p>
          </div>
        )}

        {event.notes && (
          <div className="bg-yellow-50 dark:bg-gray-800/50 p-4 rounded-lg border border-yellow-100 dark:border-gray-700">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              {t("eventInfo.fields.notes")}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed italic">
              {event.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventInfo;