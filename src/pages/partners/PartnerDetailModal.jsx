import React, { useState } from "react";
import {
  X,
  Trash2,
  Edit,
  Mail,
  Phone,
  MapPin,
  Building,
  Star,
  Calendar,
  ArrowRight,
  Users,
  Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { partnerService } from "../../api/index";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { useTranslation } from "react-i18next";

const PartnerDetailModal = ({ isOpen, onClose, partner, onEdit, refreshData }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError, promise } = useToast();
  const { t } = useTranslation();

  if (!isOpen || !partner) return null;

  const getStatusColor = (status) => {
    const colors = {
      active: "green",
      inactive: "red",
    };
    return colors[status] || "gray";
  };

  const formatDateLong = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const weekday = d.toLocaleString("en-GB", { weekday: "long" });
    const day = d.getDate();
    const month = d.toLocaleString("en-GB", { month: "long" });
    const year = d.getFullYear();
    return `${weekday}, ${day} ${month} ${year}`;
  };

  const formatCategory = (category) => {
    const categoryLabels = {
      driver: "Driver",
      bakery: "Bakery",
      catering: "Catering",
      decoration: "Decoration",
      photography: "Photography",
      music: "Music",
      security: "Security",
      cleaning: "Cleaning",
      audio_visual: "Audio/Visual",
      floral: "Floral",
      entertainment: "Entertainment",
      hairstyling: "Hair Styling",
      other: "Other",
    };
    return categoryLabels[category] || category;
  };

  const handleDelete = async () => {
    if (!partner._id) return;
    
    try {
      setIsDeleting(true);
      await promise(
        partnerService.delete(partner._id),
        {
          loading: t("partners.deleteModal.deleting", { name: partner.name || "Partner" }),
          success: t("partners.notifications.deleted"),
          error: t("partners.deleteModal.errorDeleting", { name: partner.name || "Partner" })
        }
      );
      onClose();
      refreshData();
    } catch (error) {
      console.error("Failed to delete partner:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/partners/${partner._id}`, { state: { partner } });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background Overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal Content */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="border-0">
            <div className="px-6 pt-5 pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3
                    className="text-2xl font-bold leading-6 text-gray-900 dark:text-white"
                    id="modal-title"
                  >
                    {partner.name || t("common.unknown")}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge color={getStatusColor(partner.status)}>
                      {partner.status || t("common.unknown")}
                    </Badge>
                    <Badge color="blue">
                      {formatCategory(partner.category)}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded bg-white hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors ml-4 flex-shrink-0"
                  title="Close"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="mt-6 space-y-4">
                {/* Contact Information */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                  {partner.email && (
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <Mail className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span className="truncate">{partner.email}</span>
                    </div>
                  )}
                  
                  {partner.phone && (
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span>{partner.phone}</span>
                    </div>
                  )}
                  
                  {partner.company && (
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <Building className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span>{partner.company}</span>
                    </div>
                  )}
                </div>

                {/* Rating and Performance */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    {t("partnerDetail.performance")}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {partner.rating?.toFixed(1) || "0.0"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {t("common.rating")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {partner.totalJobs || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {t("partnerDetail.totalJobs")}
                        </div>
                      </div>
                    </div>
                  </div>
                  {partner.hourlyRate && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Tag className="w-5 h-5 text-orange-500" />
                      <span>{t("partnerDetail.hourlyRate")}: ${partner.hourlyRate}/hr</span>
                    </div>
                  )}
                </div>

                {/* Location Information */}
                {partner.location && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      {t("partnerDetail.location")}
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {partner.location}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                  {partner.createdAt && (
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span>{t("partnerDetail.created")}: {formatDateLong(partner.createdAt)}</span>
                    </div>
                  )}
                  
                  {partner.specialties && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        {t("partnerDetail.specialties")}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        {partner.specialties}
                      </p>
                    </div>
                  )}
                  
                  {partner.notes && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        {t("partnerDetail.notes")}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        {partner.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between gap-3 rounded-b-xl">
              <Button
                variant="danger"
                icon={Trash2}
                onClick={handleDelete}
                disabled={isDeleting}
                size="sm"
              >
                {isDeleting ? t("partnerDetail.actions.deleting") : t("partnerDetail.actions.delete")}
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  icon={Edit}
                  onClick={() => onEdit(partner)}
                  size="sm"
                >
                  {t("partnerDetail.actions.edit")}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleViewFullDetails}
                  className="gap-2 flex items-center justify-center bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600"
                  title={t("partnerDetail.actions.moreDetails")}
                >
                  {t("partnerDetail.actions.moreDetails")}
                  <ArrowRight className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDetailModal;