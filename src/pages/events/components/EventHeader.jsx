import React from "react";
import { ArrowLeft, Edit, Trash2, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

// ✅ Generic Components
import Button from "../../../components/common/Button";
import Badge, { StatusBadge } from "../../../components/common/Badge";

const EventHeader = ({ event, onBack, onEdit, onDelete }) => {
  const { t } = useTranslation();

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

  return (
    <div className="p-6">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
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
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2 break-words leading-tight">
            {event.title}
          </h1>
          <StatusBadge status={event.status} size="sm" />
        </div>
      </div>

      {/* Event Type */}
      {event.type && (
        <div className="mb-6">
          <Badge 
            variant={getTypeVariant(event.type)} 
            className="capitalize"
            size="md"
          >
            {event.type}
          </Badge>
        </div>
      )}

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
          variant="outline" // Using outline for destructive actions in secondary position
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