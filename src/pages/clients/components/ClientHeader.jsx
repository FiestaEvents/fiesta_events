import React from "react";
import { Building2, Edit, Trash2, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

// ✅ Generic Components
import Button from "../../../components/common/Button";
import { StatusBadge } from "../../../components/common/Badge";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const ClientHeader = ({ client, onBack, onEdit, onDelete }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8 dark:bg-gray-800 dark:border-gray-700">
      {/* Action Buttons */}
      <div className="flex justify-between items-center gap-2 mb-6">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t("clientDetail.buttons.backToClients")}
            </span>
            <span className="sm:hidden">{t("common.back")}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            title={t("clientDetail.actions.edit")}
            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <Edit className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            title={t("clientDetail.actions.delete")}
            className="text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Client Identity */}
      <div className="text-center mb-2">
        {/* Avatar */}
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-md">
          {getInitials(client.name) || "?"}
        </div>

        {/* Name */}
        <h1 className="text-xl font-bold text-gray-900 mt-4 dark:text-white break-words">
          {client.name || t("clients.table.defaultValues.unnamed")}
        </h1>

        {/* Company */}
        {client.company && (
          <p className="text-gray-500 flex items-center justify-center gap-2 mt-1 mb-4 text-sm dark:text-gray-400">
            <Building2 className="w-3.5 h-3.5" />
            {client.company}
          </p>
        )}

        {/* Status Badge */}
        <div className="mt-4 flex justify-center">
          <StatusBadge
            status={client.status}
            size="md"
            dot={true}
            className="px-4 py-1"
          />
        </div>
      </div>
    </div>
  );
};

export default ClientHeader;
