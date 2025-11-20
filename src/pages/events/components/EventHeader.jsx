// components/events/components/EventHeader.jsx
import React from "react";
import { ArrowLeft, Edit, Trash2, Calendar } from "lucide-react";
import Badge from "../../../components/common/Badge";
import { useTranslation } from "react-i18next";

const EventHeader = ({ event, onBack, onEdit, onDelete, getStatusColor, getStatusLabel }) => {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 dark:text-gray-400 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">
          {t("eventHeader.backButton")}
        </span>
      </button>

      {/* Event Icon & Title */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {event.title}
          </h1>
          <Badge className={getStatusColor(event.status)}>
            {getStatusLabel(event.status)}
          </Badge>
        </div>
      </div>

      {/* Event Type */}
      {event.type && (
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium capitalize">
            {event.type}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
        >
          <Edit className="w-4 h-4" />
          <span className="font-medium">
            {t("eventHeader.actions.edit")}
          </span>
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition"
          title={t("eventHeader.actions.delete")}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default EventHeader;