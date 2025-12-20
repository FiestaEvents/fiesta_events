import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  History,
  Truck,
  MapPin,
  RefreshCw,
  Archive,
} from "lucide-react";

// API & Hooks
import { supplyService } from "../../api/index";
import { useToast } from "../../hooks/useToast";

// Components
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import OrbitLoader from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";

// Import Supply Form
import SupplyForm from "./SupplyForm"; // Ensure path is correct

const SupplyDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, apiError } = useToast();

  // State
  const [supply, setSupply] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // <--- New State

  // Stock Action State
  const [stockAction, setStockAction] = useState({
    type: "purchase",
    quantity: "",
    reference: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch Supply
  const fetchSupply = async () => {
    try {
      // Don't set full page loading on refetch to avoid flicker
      if (!supply) setLoading(true); 
      const response = await supplyService.getById(id);
      setSupply(response.supply || response);
    } catch (error) {
      apiError(error, t("supplies.errors.loadFailed"));
      navigate("/supplies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupply();
  }, [id]);

  // Handle Edit Success (Called by SupplyForm)
  const handleEditSuccess = () => {
    setShowEditModal(false);
    showSuccess(t("supplies.notifications.updated"));
    fetchSupply(); // Refresh data immediately
  };

  // Stock Status Helper
  const getStockStatus = () => {
    if (!supply) return null;
    if (supply.currentStock === 0)
      return {
        label: t("supplies.status.outOfStock"),
        variant: "danger",
        icon: AlertTriangle,
      };
    if (supply.currentStock <= supply.minimumStock)
      return {
        label: t("supplies.status.lowStock"),
        variant: "warning",
        icon: AlertTriangle,
      };
    if (supply.currentStock >= supply.maximumStock)
      return {
        label: t("supplies.status.overstocked"),
        variant: "info",
        icon: TrendingUp,
      };
    return {
      label: t("supplies.status.inStock"),
      variant: "success",
      icon: Package,
    };
  };

  // Update Stock Logic
  const handleStockUpdate = async () => {
    if (!stockAction.quantity || stockAction.quantity <= 0) {
      apiError(new Error("Invalid Quantity"), t("supplies.modal.invalidQty"));
      return;
    }

    try {
      setSubmitting(true);
      await supplyService.updateStock(id, {
        quantity: parseInt(stockAction.quantity),
        type: stockAction.type,
        reference: stockAction.reference,
        notes: stockAction.notes,
      });

      showSuccess(t("supplies.notifications.stockUpdated"));
      setShowStockModal(false);
      setStockAction({
        type: "purchase",
        quantity: "",
        reference: "",
        notes: "",
      });
      fetchSupply();
    } catch (error) {
      apiError(error, t("supplies.notifications.updateError"));
    } finally {
      setSubmitting(false);
    }
  };

  const getNewStockLevel = () => {
    if (!supply || !stockAction.quantity) return supply?.currentStock || 0;
    const qty = parseInt(stockAction.quantity);
    if (stockAction.type === "purchase" || stockAction.type === "return")
      return supply.currentStock + qty;
    if (stockAction.type === "usage" || stockAction.type === "waste")
      return supply.currentStock - qty;
    if (stockAction.type === "adjustment") return qty;
    return supply.currentStock;
  };

  // Delete & Archive Actions
  const handleDelete = async () => {
    try {
      await supplyService.delete(id);
      showSuccess(t("supplies.notifications.deleted"));
      navigate("/supplies");
    } catch (error) {
      apiError(error, t("supplies.notifications.deleteError"));
    }
  };

  const handleArchiveToggle = async () => {
    try {
      if (supply.isArchived) await supplyService.restore(id);
      else await supplyService.archive(id);

      showSuccess(
        supply.isArchived
          ? t("supplies.notifications.restored")
          : t("supplies.notifications.archived")
      );
      fetchSupply();
    } catch (error) {
      apiError(error, t("common.error"));
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <OrbitLoader />
      </div>
    );
  if (!supply) return null;

  const stockInfo = getStockStatus();
  const totalValue = supply.currentStock * supply.costPerUnit;

  return (
    <div className="min-h-screen bg-white rounded-xl dark:bg-gray-900 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/supplies")}
              className="p-2 h-auto bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:ring-4 focus:ring-orange-300"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                {supply.name}
                <Badge
                  variant={stockInfo.variant}
                  icon={<stockInfo.icon size={12} />}
                >
                  {stockInfo.label}
                </Badge>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {supply.categoryId?.name || t("supplies.status.uncategorized")}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* ✅ OPEN MODAL INSTEAD OF NAVIGATE */}
            <Button
              variant="outline"
              icon={Edit}
              onClick={() => setShowEditModal(true)}
            >
              {t("common.edit")}
            </Button>
            <Button
              variant="outline"
              icon={supply.isArchived ? RefreshCw : Archive}
              onClick={handleArchiveToggle}
            >
              {supply.isArchived ? t("common.restore") : t("common.archive")}
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => setShowDeleteConfirm(true)}
            >
              {t("common.delete")}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                <Package size={24} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {supply.currentStock}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    {supply.unit}
                  </span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Min: {supply.minimumStock} / Max: {supply.maximumStock}
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => setShowStockModal(true)}
            >
              {t("supplies.detail.updateStock")}
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                <DollarSign size={20} />
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("supplies.detail.totalValue")}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalValue.toFixed(3)} TND
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {supply.costPerUnit.toFixed(3)} TND / {supply.unit}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`p-2 rounded-lg ${supply.pricingType === "chargeable" ? "bg-orange-50 text-orange-600" : "bg-gray-100 text-gray-600"} dark:bg-gray-700`}
              >
                {supply.pricingType === "chargeable" ? (
                  <TrendingUp size={20} />
                ) : (
                  <TrendingDown size={20} />
                )}
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("supplies.form.pricingType")}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">
              {supply.pricingType}
            </p>
            {supply.pricingType === "chargeable" && (
              <p className="text-xs text-green-600 mt-1">
                Margin:{" "}
                {(
                  ((supply.chargePerUnit - supply.costPerUnit) * 100) /
                  supply.costPerUnit
                ).toFixed(1)}
                %
              </p>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Supplier Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Truck size={18} /> {t("supplies.form.supplier")}
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Name</p>
                  <p className="text-sm font-medium dark:text-white">
                    {supply.supplier?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Contact</p>
                  <p className="text-sm font-medium dark:text-white">
                    {supply.supplier?.contact || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Phone</p>
                  <p className="text-sm font-medium dark:text-white">
                    {supply.supplier?.phone || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Lead Time</p>
                  <p className="text-sm font-medium dark:text-white">
                    {supply.supplier?.leadTimeDays || 0} Days
                  </p>
                </div>
              </div>
            </div>

            {/* Storage Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin size={18} /> {t("supplies.form.storage")}
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Location</p>
                  <p className="text-sm font-medium dark:text-white">
                    {supply.storage?.location || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Shelf Life</p>
                  <p className="text-sm font-medium dark:text-white">
                    {supply.storage?.shelfLife || 0} Days
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Refrigeration
                  </p>
                  <Badge
                    variant={
                      supply.storage?.requiresRefrigeration
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {supply.storage?.requiresRefrigeration ? "Required" : "No"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stock History */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <History size={18} /> History
            </h3>

            <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 pr-1 custom-scrollbar">
              {supply.stockHistory && supply.stockHistory.length > 0 ? (
                supply.stockHistory
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((entry, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <Badge
                          size="xs"
                          variant={
                            ["purchase", "return"].includes(entry.type)
                              ? "success"
                              : "danger"
                          }
                        >
                          {entry.type}
                        </Badge>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium dark:text-gray-300">
                          {entry.notes || "No notes"}
                        </span>
                        <span
                          className={`text-sm font-bold ${["purchase", "return"].includes(entry.type) ? "text-green-600" : "text-red-600"}`}
                        >
                          {["purchase", "return"].includes(entry.type)
                            ? "+"
                            : "-"}
                          {entry.quantity}
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-10 text-gray-400">
                  No history available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- MODALS ----------------- */}

      {/* 1. EDIT MODAL */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t("supplies.form.editTitle")}
        size="lg" // Larger modal for the multi-step form
      >
        <div className="p-0"> {/* Remove padding so the form fits nicely */}
           <SupplyForm 
              supply={supply} // Pass current data
              onSuccess={handleEditSuccess}
              onCancel={() => setShowEditModal(false)}
           />
        </div>
      </Modal>

      {/* 2. STOCK UPDATE MODAL */}
      <Modal
        open={showStockModal}
        onClose={() => setShowStockModal(false)}
        title={t("supplies.modal.title")}
        size="sm"
      >
        <div className="space-y-4 p-4">
          <Select
            label={t("supplies.modal.actionType")}
            value={stockAction.type}
            onChange={(e) =>
              setStockAction({ ...stockAction, type: e.target.value })
            }
            options={[
              { value: "purchase", label: "Purchase" },
              { value: "usage", label: "Usage" },
              { value: "adjustment", label: "Adjustment" },
              { value: "return", label: "Return" },
              { value: "waste", label: "Waste" },
            ]}
          />
          <Input
            label={t("supplies.modal.quantity")}
            type="number"
            min="1"
            value={stockAction.quantity}
            onChange={(e) =>
              setStockAction({ ...stockAction, quantity: e.target.value })
            }
          />
          <Input
            label={t("supplies.modal.reference")}
            placeholder="Reference #"
            value={stockAction.reference}
            onChange={(e) =>
              setStockAction({ ...stockAction, reference: e.target.value })
            }
          />
          <Textarea
            label={t("supplies.modal.notes")}
            placeholder="Notes..."
            rows={2}
            value={stockAction.notes}
            onChange={(e) =>
              setStockAction({ ...stockAction, notes: e.target.value })
            }
          />

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800 text-center">
            <span className="text-sm text-blue-800 dark:text-blue-300">
              New Stock: <strong>{getNewStockLevel()}</strong>
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowStockModal(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleStockUpdate}
              loading={submitting}
            >
              {t("common.save")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. DELETE MODAL */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t("supplies.delete.title")}
        size="sm"
      >
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <AlertTriangle />
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
            <Button variant="danger" onClick={handleDelete}>
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SupplyDetail;