import React, { useState } from "react";
import {
  Trash2,
  Edit,
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  AlertTriangle,
  AlignLeft,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { StatusBadge } from "../../components/common/Badge";
import { useToast } from "../../hooks/useToast";
import { eventService } from "../../api/index";

const EventDetailModal = ({ isOpen, onClose, event, onEdit, refreshData }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { promise } = useToast();

  if (!event) return null;

  // Date formatting helpers
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getDay = (dateString) => new Date(dateString).getDate();

  const getMonth = (dateString) =>
    new Date(dateString)
      .toLocaleDateString("en-GB", { month: "short" })
      .toUpperCase();

  // Format time from HH:mm string
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "0.00 TND";
    return `${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} TND`;
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await promise(eventService.delete(event._id), {
        loading: t("eventDetailModal.actions.delete.deleting"),
        success: t("eventDetailModal.actions.delete.success"),
        error: t("eventDetailModal.actions.delete.error"),
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

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100">
      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase">{label}</p>
        <p className="font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={event.title} size="md">
        <div className="space-y-6">
          {/* Hero Date Section */}
          <div className="flex gap-4 items-start bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl border border-orange-200 dark:border-gray-600">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-orange-200 dark:border-gray-600 text-center overflow-hidden min-w-[60px]">
              <div className="bg-orange-500 text-white text-xs font-bold py-1 uppercase">
                {getMonth(event.startDate)}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white py-2">
                {getDay(event.startDate)}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                {event.title}
              </h3>
              <div className="mt-2">
                <StatusBadge status={event.status} />
              </div>
            </div>
          </div>

          {/* Description (Optional) */}
          {event.description && (
            <div className="flex gap-3 items-start text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300">
              <AlignLeft className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <p className="italic leading-relaxed">"{event.description}"</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-2">
            <InfoItem
              icon={Calendar}
              label={t("common.date")}
              value={formatDate(event.startDate)}
            />

            <InfoItem
              icon={Clock}
              label={t("common.time")}
              value={`${formatTime(event.startTime)} - ${formatTime(event.endTime)}`}
            />

            <InfoItem
              icon={Users}
              label={t("eventDetailModal.client")}
              value={event.clientId?.name || "N/A"}
            />

            <InfoItem
              icon={MapPin}
              label={t("eventDetailModal.guests")}
              value={`${event.guestCount || 0} ${t("common.guests")}`}
            />

            {/* Financial Information */}
            {event.pricing?.totalPriceAfterTax > 0 && (
              <InfoItem
                icon={DollarSign}
                label={t("eventDetailModal.totalAmount")}
                value={formatCurrency(event.pricing.totalPriceAfterTax)}
              />
            )}
          </div>

          {/* Payment Status Summary (if available) */}
          {event.paymentSummary && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase">
                  {t("eventDetailModal.paymentStatus")}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    event.paymentSummary.status === "paid"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : event.paymentSummary.status === "partial"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                  }`}
                >
                  {event.paymentSummary.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("eventDetailModal.totalAmount")}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(event.paymentSummary.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("eventDetailModal.paidAmount")}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(event.paymentSummary.paidAmount)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button
              variant="outline"
              className="text-red-600 hover:bg-red-50"
              icon={Trash2}
              onClick={() => setShowDeleteConfirm(true)}
            >
              {t("eventDetailModal.actions.delete.button")}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                icon={Edit}
                onClick={() => {
                  onClose();
                  navigate(`/events/${event._id}/edit`);
                }}
              >
                {t("eventDetailModal.actions.edit")}
              </Button>

              <Button
                variant="primary"
                icon={ArrowRight}
                onClick={() => {
                  onClose();
                  navigate(`/events/${event._id}/detail`);
                }}
              >
                {t("eventDetailModal.actions.viewFullDetails")}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t("common.confirmDelete")}
        size="sm"
      >
        <div className="p-4 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t("eventDetailModal.actions.delete.confirm", {
              eventTitle: event.title,
            })}
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              {t("eventDetailModal.close")}
            </Button>
            <Button
              variant="danger"
              loading={isDeleting}
              onClick={handleDelete}
            >
              {t("eventDetailModal.actions.delete.button")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EventDetailModal;
