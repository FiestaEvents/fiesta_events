import React from "react";
import { Building2, Edit, Trash2, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const ClientHeader = ({
  client,
  onBack,
  onEdit,
  onDelete,
  getStatusColor,
  getStatusLabel,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8 dark:bg-gray-800 dark:border-gray-700">
      {/* Action Buttons */}
      <div className="flex justify-between gap-2 mb-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center border border-gray-300 p-1 rounded-lg pr-2 gap-2 text-sm text-gray-600 hover:text-gray-900 transition dark:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("clientDetail.buttons.backToClients")}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:bg-blue-50 rounded-lg transition dark:text-gray-400 dark:hover:bg-blue-900 dark:hover:text-white"
            title={t("clientDetail.actions.edit")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition dark:text-red-400 dark:hover:bg-red-900"
            title={t("clientDetail.actions.delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Client Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
          {getInitials(client.name) || "?"}
        </div>
        <h1 className="text-xl font-bold text-gray-900 mt-4 dark:text-white">
          {client.name || t("clients.table.defaultValues.unnamed")}
        </h1>

        {client.company && (
          <p className="text-gray-600 flex items-center justify-center gap-2 mt-1 dark:text-gray-400">
            <Building2 className="w-4 h-4" />
            {client.company}
          </p>
        )}

        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium border mt-3 ${getStatusColor(client.status)}`}
        >
          {getStatusLabel(client.status)}
        </span>
      </div>
    </div>
  );
};

export default ClientHeader;