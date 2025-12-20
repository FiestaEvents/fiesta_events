import React from "react";
import { Edit, Trash2, ArrowLeft, Star, Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";

// ✅ Generic Components
import Button from "../../../components/common/Button";
import Badge, { StatusBadge } from "../../../components/common/Badge";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const PartnerHeader = ({ partner, onBack, onEdit, onDelete }) => {
  const { t } = useTranslation();

  // Helper to map categories to theme variants
  const getCategoryVariant = (category) => {
    const map = {
      driver: "info",
      bakery: "warning",
      catering: "success",
      decoration: "purple",
      photography: "purple",
      music: "info",
      security: "danger",
      cleaning: "secondary",
      audio_visual: "primary",
      floral: "success",
      entertainment: "warning",
      hairstyling: "purple",
      other: "secondary",
    };
    return map[category?.toLowerCase()] || "secondary";
  };

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
              {t("partnerDetail.backToPartners", "Back")}
            </span>
            <span className="sm:hidden">{t("common.back", "Back")}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            title={t("partnerDetail.actions.edit", "Edit")}
            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <Edit className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            title={t("partnerDetail.actions.delete", "Delete")}
            className="text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Partner Identity */}
      <div className="text-center mb-2">
        {/* Avatar */}
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-md">
          {getInitials(partner.name) || "?"}
        </div>

        {/* Name */}
        <h1 className="text-xl font-bold text-gray-900 mt-4 dark:text-white break-words">
          {partner.name || t("common.unknown")}
        </h1>

        {/* Company */}
        {partner.company && (
          <p className="text-gray-500 flex items-center justify-center gap-2 mt-1 mb-4 text-sm dark:text-gray-400">
            <Briefcase className="w-3.5 h-3.5" />
            {partner.company}
          </p>
        )}

        {/* Badges Container */}
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          {/* Status */}
          <StatusBadge status={partner.status} size="md" dot={true} />

          {/* Category */}
          {partner.category && (
            <Badge
              variant={getCategoryVariant(partner.category)}
              size="md"
              className="capitalize"
            >
              {partner.category.replace("_", " ")}
            </Badge>
          )}

          {/* Rating */}
          {partner.rating > 0 && (
            <Badge
              variant="warning"
              size="md"
              icon={<Star className="w-3 h-3 fill-current" />}
            >
              {partner.rating.toFixed(1)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerHeader;
