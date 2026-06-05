import React, { useState } from "react";
import {
  Trash2,
  Edit,
  Package,
  DollarSign,
  Truck,
  AlertTriangle,
  Calendar,
  ArrowRight,
  MapPin,
  Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

//  Generic Components
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";

//  Services & Hooks
import { useToast } from "../../hooks/useToast";
import { supplyService } from "../../api/index";

const SupplyDetailModal = ({
  isOpen,
  onClose,
  supply,
  onEdit,
  refreshData,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { promise } = useToast();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!supply) return null;

  // --- Helpers ---
  const getStockStatusBadge = (item) => {
    if (item.currentStock === 0) return <Badge variant="danger">Out of Stock</Badge>;
    if (item.currentStock <= item.minimumStock) return <Badge variant="warning">Low Stock</Badge>;
    return <Badge variant="success">In Stock</Badge>;
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await promise(supplyService.delete(supply._id), {
        loading: t("supplies.delete.loading"),
        success: t("supplies.delete.success"),
        error: t("supplies.delete.error"),
      });
      setShowDeleteConfirm(false);
      onClose();
      if (refreshData) refreshData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const InfoRow = ({ icon: Icon, label, value, subValue, color = "blue" }) => {
    if (!value && value !== 0) return null;
    
    const colors = {
      blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
      purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    };

    return (
      <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <div className={`p-2 rounded-lg ${colors[color] || colors.blue}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
            {value}
          </p>
          {subValue && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{subValue}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Main Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} title={supply.name} size="md">
        <div className="space-y-6">
          
          {/* Header / Icon */}
          <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg mt-2 mb-3">
              <Package size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {supply.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              {getStockStatusBadge(supply)}
              <Badge variant="secondary">{supply.categoryId?.name || "Uncategorized"}</Badge>
            </div>
          </div>

          {/* Info Section */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {t("supplies.details.inventoryInfo")}
            </h4>
            
            <InfoRow
              icon={Package}
              label={t("supplies.table.stock")}
              value={`${supply.currentStock} ${supply.unit}`}
              subValue={`Min: ${supply.minimumStock} | Max: ${supply.maximumStock}`}
              color="blue"
            />
            
            <InfoRow
              icon={DollarSign}
              label={t("supplies.table.value")}
              value={`${(supply.currentStock * supply.costPerUnit).toFixed(3)} TND`}
              subValue={`Cost: ${supply.costPerUnit.toFixed(3)} TND / unit`}
              color="green"
            />

            {supply.supplier?.name && (
               <InfoRow
                icon={Truck}
                label={t("supplies.form.supplier")}
                value={supply.supplier.name}
                subValue={supply.supplier.phone}
                color="orange"
               />
            )}

            {supply.storage?.location && (
               <InfoRow
                icon={MapPin}
                label={t("supplies.form.storageLocation")}
                value={supply.storage.location}
                color="purple"
               />
            )}
          </div>

          {/* Notes & Extra Info */}
          {(supply.notes || supply.storage?.requiresRefrigeration) && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
              {supply.storage?.requiresRefrigeration && (
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  <Info size={14} />
                  {t("supplies.form.requiresRefrigeration")}
                </div>
              )}
              {supply.notes && (
                <div>
                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      {t("supplies.form.notes")}
                   </h4>
                   <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                      "{supply.notes}"
                   </p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between gap-3 pt-2">
            <Button
              variant="outline"
              className="text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
              icon={Trash2}
              onClick={() => setShowDeleteConfirm(true)}
            >
              {t("common.delete")}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                icon={Edit}
                onClick={() => onEdit(supply)}
              >
                {t("common.edit")}
              </Button>
              <Button
                variant="primary"
                icon={ArrowRight}
                onClick={() => {
                  onClose();
                  navigate(`/supplies/${supply._id}`);
                }}
              >
                {t("common.viewDetails")}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t("supplies.delete.title")}
        size="sm"
      >
        <div className="p-4 text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t("supplies.delete.confirmMessage", { name: supply.name })}
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              loading={isDeleting}
              onClick={handleDelete}
            >
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SupplyDetailModal;