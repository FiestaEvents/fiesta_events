import React from "react";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Users,
  Briefcase,
  Gift,
  Video,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";

//  Generic Components
import Button from "../../../components/common/Button";
import Badge, { StatusBadge } from "../../../components/common/Badge";
import { formatCurrency } from "../../../utils/formatCurrency";

const EventHeader = ({ event, onBack, onEdit, onDelete }) => {
  const { t } = useTranslation();

  // Helper to map event types to icons
  const getTypeIcon = (type) => {
    const iconMap = {
      wedding: Sparkles,
      corporate: Briefcase,
      birthday: Gift,
      conference: Video,
      party: PartyPopper,
      social: Users,
      other: Calendar,
    };
    return iconMap[type?.toLowerCase()] || Calendar;
  };

  // Helper to map event types to generic badge variants
  const getTypeVariant = (type) => {
    const map = {
      wedding: "purple",
      corporate: "info",
      birthday: "warning",
      conference: "success",
      party: "warning",
      social: "warning",
      other: "secondary",
    };
    return map[type?.toLowerCase()] || "secondary";
  };

  const TypeIcon = getTypeIcon(event.type);

  return (
    <div className="p-6">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="pl-0 text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("eventHeader.backButton", "Back to Events")}
        </Button>
      </div>

      {/* Event Icon & Title */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
          <Calendar className="w-10 h-10 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 break-words leading-tight">
            {event.title}
          </h1>
          <StatusBadge status={event.status} size="sm" />
        </div>
      </div>

      {/* Event Type & Quick Stats */}
      <div className="mb-6 space-y-3">
        {event.type && (
          <div className="flex items-center gap-4">
            <Badge
              variant={getTypeVariant(event.type)}
              className="capitalize flex items-center gap-4"
              size="sm"
            >
              {event.type}
            </Badge>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          {event.guestCount && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Guests
                </span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {event.guestCount}
              </p>
            </div>
          )}

          {(event.pricing?.totalPriceAfterTax ||
            event.pricing?.totalAmount) && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg p-3 border border-green-200 dark:border-green-800/30">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                  Total
                </span>
              </div>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(
                  event.pricing.totalPriceAfterTax || event.pricing.totalAmount
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={onEdit}
          variant="primary"
          icon={Edit}
          className="flex-1 justify-center"
        >
          {t("eventHeader.actions.edit", "Edit Event")}
        </Button>

        <Button
          onClick={onDelete}
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
          title={t("eventHeader.actions.delete", "Delete Event")}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default EventHeader;
