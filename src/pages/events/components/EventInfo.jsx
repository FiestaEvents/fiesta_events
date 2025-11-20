// components/events/components/EventInfo.jsx
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
} from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";
import { useTranslation } from "react-i18next";

const EventInfo = ({ event, formatDate, formatDateTime, onNavigateToClient }) => {
  const { t } = useTranslation();

  const InfoRow = ({ icon: Icon, label, value, onClick, isLink }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <Icon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          {label}
        </div>
        {isLink && onClick ? (
          <button
            onClick={onClick}
            className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1 group"
          >
            <span>{value || "-"}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
          </button>
        ) : (
          <div className="text-sm font-medium text-gray-900 dark:text-white break-words">
            {value || "-"}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t("eventInfo.title")}
      </h2>
      <div className="space-y-0">
        {/* Date & Time */}
        <InfoRow
          icon={Calendar}
          label={t("eventInfo.fields.startDate")}
          value={formatDate(event.startDate)}
        />
        
        {event.endDate && event.endDate !== event.startDate && (
          <InfoRow
            icon={Calendar}
            label={t("eventInfo.fields.endDate")}
            value={formatDate(event.endDate)}
          />
        )}

        {(event.startTime || event.endTime) && (
          <InfoRow
            icon={Clock}
            label={t("eventInfo.fields.time")}
            value={`${event.startTime || "00:00"} - ${event.endTime || "23:59"}`}
          />
        )}

        {/* Venue Space */}
        {event.venueSpace?.name && (
          <InfoRow
            icon={MapPin}
            label={t("eventInfo.fields.venueSpace")}
            value={event.venueSpace.name}
          />
        )}

        {/* Guest Count */}
        {event.guestCount && (
          <InfoRow
            icon={Users}
            label={t("eventInfo.fields.guestCount")}
            value={`${event.guestCount} ${t("eventInfo.values.guests")}`}
          />
        )}

        {/* Client */}
        {event.clientId && (
          <InfoRow
            icon={User}
            label={t("eventInfo.fields.client")}
            value={event.clientId.name || event.clientId.email || t("eventInfo.values.unknown")}
            onClick={onNavigateToClient}
            isLink={true}
          />
        )}

        {/* Pricing */}
        {event.pricing?.totalAmount !== undefined && (
          <InfoRow
            icon={DollarSign}
            label={t("eventInfo.fields.totalAmount")}
            value={formatCurrency(event.pricing.totalAmount)}
          />
        )}

        {event.pricing?.basePrice !== undefined && (
          <InfoRow
            icon={DollarSign}
            label={t("eventInfo.fields.basePrice")}
            value={formatCurrency(event.pricing.basePrice)}
          />
        )}

        {event.pricing?.discount > 0 && (
          <InfoRow
            icon={DollarSign}
            label={t("eventInfo.fields.discount")}
            value={
              event.pricing.discountType === "percentage"
                ? `${event.pricing.discount}%`
                : formatCurrency(event.pricing.discount)
            }
          />
        )}

        {/* Description */}
        {event.description && (
          <InfoRow
            icon={FileText}
            label={t("eventInfo.fields.description")}
            value={event.description}
          />
        )}

        {/* Notes */}
        {event.notes && (
          <InfoRow
            icon={FileText}
            label={t("eventInfo.fields.notes")}
            value={event.notes}
          />
        )}
      </div>
    </div>
  );
};

export default EventInfo;