import React, { useState } from "react";
import {
  Trash2,
  Edit,
  Mail,
  Phone,
  MapPin,
  Building,
  Star,
  Briefcase,
  ArrowRight,
  AlertTriangle,
  DollarSign,
  Tag,
  AlignLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Badge, { StatusBadge } from "../../components/common/Badge";
import Modal from "../../components/common/Modal";

// Services & Hooks
import { useToast } from "../../context/ToastContext";
import { partnerService } from "../../api/index";
import formatCurrency from "../../utils/formatCurrency";

const PartnerDetailModal = ({
  isOpen,
  onClose,
  partner,
  onEdit,
  refreshData,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { promise } = useToast();
  const { t } = useTranslation();

  if (!partner) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await promise(partnerService.delete(partner._id), {
        loading: t("partnerDetailModal.delete.loading", "Deleting..."),
        success: t(
          "partnerDetailModal.delete.success",
          "Partner deleted successfully"
        ),
        error: t("partnerDetailModal.delete.error", "Failed to delete partner"),
      });
      setShowDeleteConfirm(false);
      onClose();
      if (refreshData) refreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/partners/${partner._id}`);
  };

  // --- Sub-components ---

  const StatBox = ({ icon: Icon, value, label, color = "blue" }) => {
    const colors = {
      yellow:
        "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
      blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      green:
        "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    };
    return (
      <div
        className={`flex flex-col items-center justify-center p-3 rounded-xl ${colors[color]} border border-transparent transition-transform hover:scale-105`}
      >
        <div className="flex items-center gap-1.5 font-bold text-lg">
          <Icon size={18} /> {value}
        </div>
        <span className="text-[10px] uppercase tracking-wider opacity-80 font-semibold">
          {label}
        </span>
      </div>
    );
  };

  const InfoRow = ({ icon: Icon, label, value }) => {
    if (!value) return null;
    return (
      <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors px-2 -mx-2 rounded-lg">
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
            {label}
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {value}
          </p>
        </div>
      </div>
    );
  };

  // Helpers
  const rateDisplay =
    partner.priceType === "hourly" ? partner.hourlyRate : partner.fixedRate;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t("partnerDetailModal.title")}
        size="md"
        footer={
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full sm:w-auto"
            >
              {t("partnerDetailModal.actions.delete")}
            </Button>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                icon={Edit}
                onClick={() => onEdit(partner)}
                className="flex-1 sm:flex-none"
              >
                {t("partnerDetailModal.actions.edit")}
              </Button>
              <Button
                variant="primary"
                icon={ArrowRight}
                onClick={handleViewFullDetails}
                className="flex-1 sm:flex-none gap-2"
              >
                {t("partnerDetailModal.actions.view")}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Header: Avatar & Name */}
          <div className="flex flex-col items-center text-center pb-2">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
              {partner.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {partner.name}
            </h2>

            <div className="flex gap-2 mt-3">
              <StatusBadge status={partner.status} />
              {partner.category && (
                <Badge
                  variant="info"
                  className="capitalize"
                  icon={<Tag size={10} />}
                >
                  {partner.category}
                </Badge>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <StatBox
              icon={Star}
              value={partner.rating?.toFixed(1) || "0.0"}
              label={t("partnerDetailModal.stats.rating")}
              color="yellow"
            />
            <StatBox
              icon={Briefcase}
              value={partner.totalJobs || 0}
              label={t("partnerDetailModal.stats.jobs")}
              color="blue"
            />
            <StatBox
              icon={DollarSign}
              value={
                rateDisplay
                  ? formatCurrency(rateDisplay).replace("TND", "")
                  : "-"
              }
              label={
                partner.priceType === "hourly"
                  ? t("partnerDetailModal.stats.hourly")
                  : t("partnerDetailModal.stats.fixed")
              }
              color="green"
            />
          </div>

          {/* Info List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-2">
            <div className="px-2 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              {t("partnerDetailModal.sections.contact")}
            </div>
            <InfoRow
              icon={Mail}
              label={t("partnerDetailModal.labels.email")}
              value={partner.email}
            />
            <InfoRow
              icon={Phone}
              label={t("partnerDetailModal.labels.phone")}
              value={partner.phone}
            />
            <InfoRow
              icon={Building}
              label={t("partnerDetailModal.labels.company")}
              value={partner.company}
            />
            <InfoRow
              icon={MapPin}
              label={t("partnerDetailModal.labels.location")}
              value={partner.location}
            />
          </div>

          {/* Specialties / Notes */}
          {partner.specialties && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
              <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2">
                {t("partnerDetailModal.labels.specialties")}
              </h4>
              <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                {partner.specialties}
              </p>
            </div>
          )}

          {/* Notes */}
          {partner.notes && (
            <div className="flex gap-3 items-start text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300">
              <AlignLeft className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <p className="italic">"{partner.notes}"</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t("partnerDetailModal.delete.title")}
        size="sm"
      >
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-sm">
            {t("partnerDetailModal.delete.message", { name: partner.name })}
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              {t("partnerDetailModal.delete.cancel")}
            </Button>
            <Button
              variant="danger"
              loading={isDeleting}
              onClick={handleDelete}
            >
              {t("partnerDetailModal.delete.confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PartnerDetailModal;
