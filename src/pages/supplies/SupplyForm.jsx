// src/pages/Supplies/SupplyForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  Tag,
  AlertCircle,
  Plus,
} from "lucide-react";

// API & Hooks
import { supplyService, supplyCategoryService } from "../../api/index";
import { useToast } from "../../hooks/useToast";

// Components
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const SupplyForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, apiError } = useToast();
  const isEditMode = !!id;

  // State
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", icon: "Package", color: "#F18237" });
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    unit: "piece",
    currentStock: 0,
    minimumStock: 10,
    maximumStock: 1000,
    costPerUnit: 0,
    pricingType: "included",
    chargePerUnit: 0,
    supplier: {
      name: "",
      contact: "",
      phone: "",
      email: "",
      leadTimeDays: 7,
    },
    storage: {
      location: "",
      requiresRefrigeration: false,
      expiryTracking: false,
      shelfLife: 0,
    },
    status: "active",
    notes: "",
  });

  // Fetch Categories and Supply Data
  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchSupply();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await supplyCategoryService.getAll();
      setCategories(response.categories || []);
    } catch (error) {
      console.error(error);
      apiError(error, "Failed to load categories");
    }
  };

  const fetchSupply = async () => {
    try {
      setLoading(true);
      const response = await supplyService.getById(id);
      const supply = response.supply || response;

      setFormData({
        name: supply.name || "",
        categoryId: supply.categoryId?._id || supply.categoryId || "",
        unit: supply.unit || "piece",
        currentStock: supply.currentStock || 0,
        minimumStock: supply.minimumStock || 10,
        maximumStock: supply.maximumStock || 1000,
        costPerUnit: supply.costPerUnit || 0,
        pricingType: supply.pricingType || "included",
        chargePerUnit: supply.chargePerUnit || 0,
        supplier: {
          name: supply.supplier?.name || "",
          contact: supply.supplier?.contact || "",
          phone: supply.supplier?.phone || "",
          email: supply.supplier?.email || "",
          leadTimeDays: supply.supplier?.leadTimeDays || 7,
        },
        storage: {
          location: supply.storage?.location || "",
          requiresRefrigeration: supply.storage?.requiresRefrigeration || false,
          expiryTracking: supply.storage?.expiryTracking || false,
          shelfLife: supply.storage?.shelfLife || 0,
        },
        status: supply.status || "active",
        notes: supply.notes || "",
      });
    } catch (error) {
      console.error(error);
      apiError(error, "Failed to load supply");
    } finally {
      setLoading(false);
    }
  };

  // Handle Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: finalValue,
          },
        };
      }
      return { ...prev, [name]: finalValue };
    });

    // Clear error
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Supply name is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.unit.trim()) newErrors.unit = "Unit is required";
    if (formData.currentStock < 0) newErrors.currentStock = "Stock cannot be negative";
    if (formData.costPerUnit < 0) newErrors.costPerUnit = "Cost cannot be negative";
    if (formData.pricingType === "chargeable" && formData.chargePerUnit < 0) {
      newErrors.chargePerUnit = "Charge cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      
      if (isEditMode) {
        await supplyService.update(id, formData);
        showSuccess("Supply updated successfully");
      } else {
        await supplyService.create(formData);
        showSuccess("Supply created successfully");
      }

      navigate("/supplies");
    } catch (error) {
      console.error(error);
      apiError(error, `Failed to ${isEditMode ? "update" : "create"} supply`);
    } finally {
      setSaving(false);
    }
  };

  // Create Category
  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      apiError(new Error("Category name is required"), "Validation Error");
      return;
    }

    try {
      const response = await supplyCategoryService.create(newCategory);
      const created = response.category || response;
      
      setCategories((prev) => [...prev, created]);
      setFormData((prev) => ({ ...prev, categoryId: created._id }));
      setNewCategory({ name: "", icon: "Package", color: "#F18237" });
      setShowCategoryForm(false);
      showSuccess("Category created successfully");
    } catch (error) {
      apiError(error, "Failed to create category");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading supply..." />
      </div>
    );
  }

const unitOptions = [
    { value: "piece", label: t("supplies.units.piece") },
    { value: "bottle", label: t("supplies.units.bottle") },
    { value: "pack", label: t("supplies.units.pack") },
    { value: "box", label: t("supplies.units.box") },
    { value: "kg", label: t("supplies.units.kg") },
    { value: "g", label: t("supplies.units.g") },
    { value: "liter", label: t("supplies.units.liter") },
    { value: "ml", label: t("supplies.units.ml") },
    { value: "dozen", label: t("supplies.units.dozen") },
    { value: "serving", label: t("supplies.units.serving") },
    { value: "can", label: t("supplies.units.can") },
    { value: "jar", label: t("supplies.units.jar") },
    { value: "bag", label: t("supplies.units.bag") },
    { value: "carton", label: t("supplies.units.carton") },
    { value: "unit", label: t("supplies.units.unit") },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate("/supplies")}
          >
            {t("common.back") || "Back"}
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? t("supplies.edit.title") || "Edit Supply" : t("supplies.create.title") || "Add New Supply"}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEditMode
                ? t("supplies.edit.subtitle") || "Update supply information and inventory details"
                : t("supplies.create.subtitle") || "Add a new supply item to your inventory"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="text-orange-600" size={20} />
              {t("supplies.form.basicInfo") || "Basic Information"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t("supplies.form.name") || "Supply Name"}
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                placeholder="e.g., Bottled Water"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("supplies.form.category") || "Category"} <span className="text-red-500">*</span>
                </label>
                
                {!showCategoryForm ? (
                  <div className="flex gap-2">
                    <Select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      error={errors.categoryId}
                      options={[
                        { value: "", label: "Select Category" },
                        ...categories.map((cat) => ({
                          value: cat._id,
                          label: cat.name,
                        })),
                      ]}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      icon={Plus}
                      onClick={() => setShowCategoryForm(true)}
                    >
                      {t("supplies.form.newCategory")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Input
                      placeholder="Category name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleCreateCategory}
                      >
                        {t("supplies.form.createCategory")}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCategoryForm(false)}
                      >
                        {t("supplies.form.cancel")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Select
                label={t("supplies.form.unit") || "Unit of Measurement"}
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                error={errors.unit}
                options={unitOptions}
                required
              />

              <Select
                label={t("supplies.form.status")}
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: "active", label: t("supplies.statuses.active") },
                  { value: "inactive", label: t("supplies.statuses.inactive") },
                  { value: "discontinued", label: t("supplies.statuses.discontinued") },
                ]}
              />
            </div>
          </Card>

          {/* Inventory Management */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="text-blue-600" size={20} />
              {t("supplies.form.inventory") || "Inventory Management"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t("supplies.form.currentStock") || "Current Stock"}
                name="currentStock"
                type="number"
                value={formData.currentStock}
                onChange={handleChange}
                error={errors.currentStock}
                min="0"
                required
              />

              <Input
                label={t("supplies.form.minimumStock") || "Minimum Stock"}
                name="minimumStock"
                type="number"
                value={formData.minimumStock}
                onChange={handleChange}
                min="0"
                help="Alert when stock reaches this level"
              />

              <Input
                label={t("supplies.form.maximumStock") || "Maximum Stock"}
                name="maximumStock"
                type="number"
                value={formData.maximumStock}
                onChange={handleChange}
                min="0"
                help="Maximum storage capacity"
              />
            </div>

            {/* Stock Status Indicator */}
            {formData.currentStock <= formData.minimumStock && formData.currentStock > 0 && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="text-orange-600 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-sm text-orange-800">
                  <span className="font-bold">{t("supplies.form.lowStockWarning")}:</span> {t("supplies.form.lowStockDesc")}
                </p>
              </div>
            )}
          </Card>

          {/* Pricing */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="text-green-600" size={20} />
              {t("supplies.form.pricing") || "Pricing"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t("supplies.form.costPerUnit") || "Cost Per Unit (Venue)"}
                name="costPerUnit"
                type="number"
                step="0.001"
                value={formData.costPerUnit}
                onChange={handleChange}
                error={errors.costPerUnit}
                min="0"
                required
                help="How much you pay per unit"
              />

              <Select
                label={t("supplies.form.pricingType")}
                name="pricingType"
                value={formData.pricingType}
                onChange={handleChange}
                options={[
                  { value: "included", label: t("supplies.pricingTypes.included") },
                  { value: "chargeable", label: t("supplies.pricingTypes.chargeable") },
                  { value: "optional", label: t("supplies.pricingTypes.optional") },
                ]}
              />

              {formData.pricingType === "chargeable" && (
                <Input
                  label={t("supplies.form.chargePerUnit") || "Charge Per Unit (Client)"}
                  name="chargePerUnit"
                  type="number"
                  step="0.001"
                  value={formData.chargePerUnit}
                  onChange={handleChange}
                  error={errors.chargePerUnit}
                  min="0"
                  help="How much you charge clients per unit"
                />
              )}
            </div>

            {/* Profit Margin Indicator */}
            {formData.pricingType === "chargeable" && formData.chargePerUnit > 0 && formData.costPerUnit > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-bold">{t("supplies.form.profitMargin")}:</span>{" "}
                  {((formData.chargePerUnit - formData.costPerUnit) * 100 / formData.costPerUnit).toFixed(1)}%
                  ({(formData.chargePerUnit - formData.costPerUnit).toFixed(3)} TND per {formData.unit})
                </p>
              </div>
            )}
          </Card>

          {/* Supplier Information */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {t("supplies.form.supplier") || "Supplier Information (Optional)"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t("supplies.form.supplierName") || "Supplier Name"}
                name="supplier.name"
                value={formData.supplier.name}
                onChange={handleChange}
                placeholder="e.g., ABC Distributors"
              />

              <Input
                label={t("supplies.form.supplierContact") || "Contact Person"}
                name="supplier.contact"
                value={formData.supplier.contact}
                onChange={handleChange}
                placeholder="e.g., John Doe"
              />

              <Input
                label={t("supplies.form.supplierPhone") || "Phone"}
                name="supplier.phone"
                type="tel"
                value={formData.supplier.phone}
                onChange={handleChange}
                placeholder="e.g., +216 12 345 678"
              />

              <Input
                label={t("supplies.form.supplierEmail") || "Email"}
                name="supplier.email"
                type="email"
                value={formData.supplier.email}
                onChange={handleChange}
                placeholder="e.g., supplier@example.com"
              />

              <Input
                label={t("supplies.form.leadTime") || "Lead Time (Days)"}
                name="supplier.leadTimeDays"
                type="number"
                value={formData.supplier.leadTimeDays}
                onChange={handleChange}
                min="0"
                help="Days needed for reorder delivery"
              />
            </div>
          </Card>

          {/* Storage & Handling */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {t("supplies.form.storage") || "Storage & Handling"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t("supplies.form.storageLocation") || "Storage Location"}
                name="storage.location"
                value={formData.storage.location}
                onChange={handleChange}
                placeholder="e.g., Main Storage, Refrigerator"
              />

              <Input
                label={t("supplies.form.shelfLife") || "Shelf Life (Days)"}
                name="storage.shelfLife"
                type="number"
                value={formData.storage.shelfLife}
                onChange={handleChange}
                min="0"
                disabled={!formData.storage.expiryTracking}
                help="Only if expiry tracking is enabled"
              />
            </div>

            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="storage.requiresRefrigeration"
                  checked={formData.storage.requiresRefrigeration}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {t("supplies.form.requiresRefrigeration") || "Requires Refrigeration"}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="storage.expiryTracking"
                  checked={formData.storage.expiryTracking}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {t("supplies.form.expiryTracking") || "Enable Expiry Tracking"}
                </span>
              </label>
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <Textarea
              label={t("supplies.form.notes") || "Additional Notes"}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Any additional information about this supply..."
            />
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 sticky bottom-0 bg-white p-4 border-t border-gray-200 rounded-lg shadow-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/supplies")}
              disabled={saving}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              loading={saving}
            >
              {isEditMode ? t("common.update") || "Update Supply" : t("common.create") || "Create Supply"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplyForm;