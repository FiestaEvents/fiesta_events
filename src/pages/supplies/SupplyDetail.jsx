// src/pages/Supplies/SupplyDetail.jsx
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
  AlertCircle,
  DollarSign,
  Calendar,
  Archive,
  RefreshCw,
} from "lucide-react";

// API & Hooks
import { supplyService } from "../../api/index";
import { useToast } from "../../hooks/useToast";

// Components
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const SupplyDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, apiError } = useToast();

  // State
  const [supply, setSupply] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [stockAction, setStockAction] = useState({
    type: "purchase", // purchase, usage, adjustment, return, waste
    quantity: "",
    reference: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch Supply
  useEffect(() => {
    fetchSupply();
  }, [id]);

  const fetchSupply = async () => {
    try {
      setLoading(true);
      const response = await supplyService.getById(id);
      setSupply(response.supply || response);
    } catch (error) {
      console.error(error);
      apiError(error, "Failed to load supply");
    } finally {
      setLoading(false);
    }
  };

// Stock Status
  const getStockStatus = () => {
    if (!supply) return null;
    if (supply.currentStock === 0) 
      return { label: t("supplies.status.outOfStock"), variant: "danger", icon: AlertCircle };
    if (supply.currentStock <= supply.minimumStock) 
      return { label: t("supplies.status.lowStock"), variant: "warning", icon: AlertCircle };
    if (supply.currentStock >= supply.maximumStock) 
      return { label: t("supplies.status.overstocked"), variant: "info", icon: TrendingUp };
    return { label: t("supplies.status.inStock"), variant: "success", icon: Package };
  };

  // Update Stock
   const handleStockUpdate = async () => {
    if (!stockAction.quantity || stockAction.quantity <= 0) {
      apiError(new Error(t("supplies.modal.invalidQty")), "Validation Error"); 
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

      showSuccess(t("supplies.modal.success"));
      setShowStockModal(false);
      setStockAction({ type: "purchase", quantity: "", reference: "", notes: "" });
      fetchSupply();
    } catch (error) {
      apiError(error, t("supplies.modal.error"));
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate new stock level for preview
  const getNewStockLevel = () => {
    if (!supply || !stockAction.quantity) return supply?.currentStock || 0;
    
    const qty = parseInt(stockAction.quantity);
    if (stockAction.type === "purchase" || stockAction.type === "return") {
      return supply.currentStock + qty;
    } else if (stockAction.type === "usage" || stockAction.type === "waste") {
      return supply.currentStock - qty;
    } else if (stockAction.type === "adjustment") {
      return qty; // Adjustment sets absolute value
    }
    return supply.currentStock;
  };

  // Actions
  const handleDelete = async () => {
    try {
      await supplyService.delete(id);
      showSuccess(t("supplies.modal.deleted"));
      navigate("/supplies");
    } catch (error) {
      apiError(error, t("supplies.modal.error"));
    }
  };

  const handleArchive = async () => {
    try {
      await supplyService.archive(id);
      showSuccess(t("supplies.modal.archived"));
      fetchSupply();
    } catch (error) {
      apiError(error, t("supplies.modal.error"));
    }
  };

  const handleRestore = async () => {
    try {
      await supplyService.restore(id);
      showSuccess(t("supplies.modal.restored"));
      fetchSupply();
    } catch (error) {
      apiError(error, t("supplies.modal.error"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading supply..." />
      </div>
    );
  }

  if (!supply) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Supply Not Found</h2>
          <Button onClick={() => navigate("/supplies")}>
            Back to Supplies
          </Button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus();
  const totalValue = supply.currentStock * supply.costPerUnit;
  const StatusIcon = stockStatus.icon;

  return (
    <div className="min-h-full bg-white rounded-lg p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={() => navigate("/supplies")}
            >
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{supply.name}</h1>
              <p className="text-gray-500 mt-1">{supply.categoryId?.name || "Uncategorized"}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={Edit}
              onClick={() => navigate(`/supplies/${id}/edit`)}
            >
              Edit
            </Button>
            
            {supply.isArchived ? (
              <Button
                variant="outline"
                icon={RefreshCw}
                onClick={handleRestore}
              >
                Restore
              </Button>
            ) : (
              <Button
                variant="outline"
                icon={Archive}
                onClick={handleArchive}
              >
                Archive
              </Button>
            )}

            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Status Banner */}
        {supply.isArchived && (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 flex items-center gap-3">
            <Archive className="text-gray-600" size={20} />
            <p className="text-gray-800 font-medium">
              This supply is archived. Restore it to make it available for events.
            </p>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="text-blue-600" size={24} />
              <Badge variant={stockStatus.variant} className="flex items-center gap-1">
                <StatusIcon size={12} />
                {stockStatus.label}
              </Badge>
            </div>
           <h3 className="text-2xl font-bold text-gray-900">
              {supply.currentStock} {supply.unit}
            </h3>
            <p className="text-sm text-gray-500">{t("supplies.detail.currentStock")}</p> 
            <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
              Min: {supply.minimumStock} • Max: {supply.maximumStock}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {totalValue.toFixed(3)} TND
            </h3>
            <p className="text-sm text-gray-500">{t("supplies.detail.totalValue")}</p>
            <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
              {supply.costPerUnit.toFixed(3)} TND per {supply.unit}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              {supply.pricingType === "chargeable" ? (
                <TrendingUp className="text-orange-600" size={24} />
              ) : (
                <TrendingDown className="text-gray-400" size={24} />
              )}
              <Badge variant={supply.pricingType === "chargeable" ? "success" : "secondary"}>
                {supply.pricingType}
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {supply.pricingType === "chargeable" 
                ? `${supply.chargePerUnit.toFixed(3)} TND`
                : "Included"
              }
            </h3>
            <p className="text-sm text-gray-500">{t("supplies.detail.clientCharge")}</p>
            {supply.pricingType === "chargeable" && (
              <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-green-600">
                Margin: {((supply.chargePerUnit - supply.costPerUnit) * 100 / supply.costPerUnit).toFixed(1)}%
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Badge variant={supply.status === "active" ? "success" : "secondary"}>
                {supply.status}
              </Badge>
            </div>
            <Button
              className="w-full mt-2"
              variant="primary"
              onClick={() => setShowStockModal(true)}
            >
              {t("supplies.detail.updateStock")}
            </Button>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-semibold">{supply.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="mt-1 text-sm text-gray-900">{supply.categoryId?.name || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Unit</dt>
                  <dd className="mt-1 text-sm text-gray-900">{supply.unit}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <Badge variant={supply.status === "active" ? "success" : "secondary"}>
                      {supply.status}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </Card>

            {/* Supplier Information */}
            {supply.supplier?.name && (
              <Card>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Supplier Information</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Supplier Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-semibold">{supply.supplier.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                    <dd className="mt-1 text-sm text-gray-900">{supply.supplier.contact || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{supply.supplier.phone || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{supply.supplier.email || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Lead Time</dt>
                    <dd className="mt-1 text-sm text-gray-900">{supply.supplier.leadTimeDays || 0} days</dd>
                  </div>
                </dl>
              </Card>
            )}

            {/* Storage & Handling */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Storage & Handling</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Storage Location</dt>
                  <dd className="mt-1 text-sm text-gray-900">{supply.storage?.location || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Refrigeration</dt>
                  <dd className="mt-1">
                    <Badge variant={supply.storage?.requiresRefrigeration ? "warning" : "secondary"}>
                      {supply.storage?.requiresRefrigeration ? "Required" : "Not Required"}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Expiry Tracking</dt>
                  <dd className="mt-1">
                    <Badge variant={supply.storage?.expiryTracking ? "info" : "secondary"}>
                      {supply.storage?.expiryTracking ? "Enabled" : "Disabled"}
                    </Badge>
                  </dd>
                </div>
                {supply.storage?.expiryTracking && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Shelf Life</dt>
                    <dd className="mt-1 text-sm text-gray-900">{supply.storage?.shelfLife || 0} days</dd>
                  </div>
                )}
              </dl>
            </Card>

            {/* Notes */}
            {supply.notes && (
              <Card>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Notes</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{supply.notes}</p>
              </Card>
            )}
          </div>

          {/* Right Column - Stock History */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="text-orange-600" size={20} />
                Stock History
              </h3>

              {supply.stockHistory && supply.stockHistory.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {supply.stockHistory
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 20)
                    .map((entry, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={
                              entry.type === "purchase" || entry.type === "return"
                                ? "success"
                                : "danger"
                            }
                            size="sm"
                          >
                            {entry.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {entry.type === "purchase" || entry.type === "return" ? "+" : "-"}
                          {entry.quantity} {supply.unit}
                        </p>
                        {entry.notes && (
                          <p className="text-xs text-gray-600 mt-1">{entry.notes}</p>
                        )}
                        {entry.reference && (
                          <p className="text-xs text-gray-500 mt-1">Ref: {entry.reference}</p>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No stock history yet</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Stock Update Modal */}
        <Modal
          open={showStockModal}
          onClose={() => setShowStockModal(false)}
          title={t("supplies.modal.title")}
          size="md"
        >
           <div className="space-y-4">
            <Select
              label={t("supplies.modal.actionType")}
              value={stockAction.type}
              onChange={(e) => setStockAction({ ...stockAction, type: e.target.value })}
              options={[
                { value: "purchase", label: t("supplies.stockActions.purchase") },
                { value: "usage", label: t("supplies.stockActions.usage") },
                { value: "adjustment", label: t("supplies.stockActions.adjustment") },
                { value: "return", label: t("supplies.stockActions.return") },
                { value: "waste", label: t("supplies.stockActions.waste") },
              ]}
            />

            <Input
              label={t("supplies.modal.quantity")}
              type="number"
              min="1"
              value={stockAction.quantity}
              onChange={(e) => setStockAction({ ...stockAction, quantity: e.target.value })}
              required
              help={`Current stock: ${supply.currentStock} ${supply.unit}`}
            />

            <Input
              label={t("supplies.modal.reference")}
              placeholder="e.g., Invoice #123, Event ID"
              value={stockAction.reference}
              onChange={(e) => setStockAction({ ...stockAction, reference: e.target.value })}
            />

            <Textarea
              label={t("supplies.modal.notes")}
              placeholder="Additional details about this stock update..."
              rows={3}
              value={stockAction.notes}
              onChange={(e) => setStockAction({ ...stockAction, notes: e.target.value })}
            />

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-bold">New Stock Level:</span>{" "}
                {getNewStockLevel()}{" "}
                {supply.unit}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowStockModal(false)}
              >
                {t("supplies.modal.cancel")}
              </Button>
              <Button
                variant="primary"
                onClick={handleStockUpdate}
                loading={submitting}
              >
                {t("supplies.modal.updateStock")}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title={t("supplies.delete.title")}
          description={t("supplies.delete.description")}
          confirmText={t("supplies.delete.confirmText")}
          cancelText={t("supplies.delete.cancelText")}
          variant="danger"
        />
      </div>
    </div>
  );
};

export default SupplyDetail;