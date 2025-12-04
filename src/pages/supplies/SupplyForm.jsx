import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Save,
  Package,
  DollarSign,
  Truck,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Plus,
  X,
  Tag
} from "lucide-react";

// ✅ API & Services
import { supplyService, supplyCategoryService } from "../../api/index";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// ✅ Context
import { useToast } from "../../hooks/useToast";

const SupplyForm = ({ supply: supplyProp, onSuccess, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showError, showWarning, apiError } = useToast();

  const isEditMode = Boolean(id || supplyProp?._id);
  const supplyId = id || supplyProp?._id;
  const isModalMode = Boolean(onSuccess && onCancel);

  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Data
  const [categories, setCategories] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [errors, setErrors] = useState({});

  // Form State
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
    status: "active",
    supplier: { name: "", contact: "", phone: "", email: "", leadTimeDays: 7 },
    storage: { location: "", requiresRefrigeration: false, expiryTracking: false, shelfLife: 0 },
    notes: "",
  });

  // Constants
  const steps = [
    { number: 1, title: t("supplies.form.steps.basicInfo"), icon: Package },
    { number: 2, title: t("supplies.form.steps.inventory"), icon: Tag },
    { number: 3, title: t("supplies.form.steps.supplier"), icon: Truck },
  ];

  const UNIT_OPTIONS = [
    { value: "piece", label: "Piece" },
    { value: "bottle", label: "Bottle" },
    { value: "pack", label: "Pack" },
    { value: "box", label: "Box" },
    { value: "kg", label: "Kilogram (kg)" },
    { value: "g", label: "Gram (g)" },
    { value: "liter", label: "Liter (L)" },
    { value: "ml", label: "Milliliter (ml)" },
  ];

  const PRICING_TYPES = [
    { value: "included", label: "Included (Free to client)" },
    { value: "chargeable", label: "Chargeable" },
    { value: "optional", label: "Optional" },
  ];

  // --- Helper: Load Data ---
  const loadSupplyData = useCallback((data) => {
    if (!data) return;
    setFormData({
      name: data.name || "",
      categoryId: data.categoryId?._id || data.categoryId || "",
      unit: data.unit || "piece",
      currentStock: data.currentStock || 0,
      minimumStock: data.minimumStock || 10,
      maximumStock: data.maximumStock || 1000,
      costPerUnit: data.costPerUnit || 0,
      pricingType: data.pricingType || "included",
      chargePerUnit: data.chargePerUnit || 0,
      status: data.status || "active",
      supplier: {
        name: data.supplier?.name || "",
        contact: data.supplier?.contact || "",
        phone: data.supplier?.phone || "",
        email: data.supplier?.email || "",
        leadTimeDays: data.supplier?.leadTimeDays || 7,
      },
      storage: {
        location: data.storage?.location || "",
        requiresRefrigeration: data.storage?.requiresRefrigeration || false,
        expiryTracking: data.storage?.expiryTracking || false,
        shelfLife: data.storage?.shelfLife || 0,
      },
      notes: data.notes || "",
    });
  }, []);

  // --- Fetch Data ---
  useEffect(() => {
    const initData = async () => {
      setFetchLoading(true);
      try {
        const catRes = await supplyCategoryService.getAll();
        setCategories(catRes.categories || catRes.data?.categories || []);

        if (isEditMode && !supplyProp) {
          const res = await supplyService.getById(supplyId);
          loadSupplyData(res.supply || res.data?.supply || res);
        } else if (supplyProp) {
          loadSupplyData(supplyProp);
        }
      } catch (err) {
        apiError(err, t("supplies.notifications.loadError"));
        if (!isModalMode) navigate("/supplies");
      } finally {
        setFetchLoading(false);
      }
    };
    initData();
  }, [isEditMode, supplyId, supplyProp, isModalMode, navigate, loadSupplyData, apiError, t]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: finalValue }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await supplyCategoryService.create({ name: newCategoryName, icon: "Package", color: "#F18237" });
      const newCat = res.category || res.data?.category || res;
      setCategories(prev => [...prev, newCat]);
      setFormData(prev => ({ ...prev, categoryId: newCat._id }));
      setNewCategoryName("");
      setShowCategoryInput(false);
    } catch (err) {
      showError(t("supplies.notifications.categoryCreateError"));
    }
  };

  // Validation
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = t("supplies.validation.nameRequired");
      if (!formData.categoryId) newErrors.categoryId = t("supplies.validation.categoryRequired");
      if (!formData.unit) newErrors.unit = t("supplies.validation.unitRequired");
    }
    if (step === 2) {
        if(formData.currentStock < 0) newErrors.currentStock = t("supplies.validation.negativeStock");
        if(formData.costPerUnit < 0) newErrors.costPerUnit = t("supplies.validation.negativeCost");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllRequired = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = t("supplies.validation.nameRequired");
    if (!formData.categoryId) newErrors.categoryId = t("supplies.validation.categoryRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- NAVIGATION LOGIC ---

  // ✅ FIX: Accept event `e` and preventDefault to stop unintentional form submission
  const handleNext = (e) => {
    if (e) e.preventDefault(); 
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      showWarning(t("common.fixErrors"));
    }
  };

  const handlePrevious = (e) => {
    if (e) e.preventDefault();
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step) => {
      if (step < currentStep || validateStep(currentStep)) setCurrentStep(step);
  };

  // --- SUBMISSION LOGIC ---

  const submitData = async () => {
    try {
      setLoading(true);
      const payload = { ...formData };
      
      payload.currentStock = Number(payload.currentStock);
      payload.minimumStock = Number(payload.minimumStock);
      payload.maximumStock = Number(payload.maximumStock);
      payload.costPerUnit = Number(payload.costPerUnit);
      payload.chargePerUnit = Number(payload.chargePerUnit);
      payload.supplier.leadTimeDays = Number(payload.supplier.leadTimeDays);
      payload.storage.shelfLife = Number(payload.storage.shelfLife);

      if (isEditMode) {
        await supplyService.update(supplyId, payload);
      } else {
        await supplyService.create(payload);
      }

      if (isModalMode && onSuccess) onSuccess();
      else navigate("/supplies");
      
    } catch (error) {
      apiError(error, t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Smart handleSubmit to handle "Enter" key correctly
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If user presses Enter on an intermediate step, treat as Next
    if (currentStep < totalSteps) {
      handleNext();
      return;
    }

    // If on last step, validate all and submit
    if (!validateAllRequired()) return showWarning(t("common.fixErrors"));
    await submitData();
  };

  // ✅ FIX: Dedicated handler for Quick Save button
  const handleQuickUpdate = async (e) => {
      e.preventDefault();
      // Ensure basic required fields (Step 1) are valid before quick saving
      if (!validateStep(1)) {
          setCurrentStep(1);
          showWarning(t("common.fixErrors"));
          return;
      }
      await submitData();
  };

  // --- Renders ---

  const renderStepIndicator = () => (
    <div className="mb-8 px-4">
      <div className="flex items-center justify-between relative max-w-lg mx-auto">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gray-100 dark:bg-gray-700 -z-10" />
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const StepIcon = step.icon;
          return (
            <button
              key={step.number}
              type="button" // ✅ Explicitly set type button
              onClick={() => handleStepClick(step.number)}
              disabled={!isCompleted && !isCurrent}
              className={`group flex flex-col items-center gap-2 bg-white dark:bg-[#1f2937] px-2 transition-all ${
                isCompleted || isCurrent ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                isCompleted ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" : 
                isCurrent ? "bg-orange-500 text-white shadow-orange-200 dark:shadow-none" : 
                "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
              }`}>
                {isCompleted ? <Check className="w-6 h-6" /> : <StepIcon className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-semibold whitespace-nowrap ${isCurrent ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                {step.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <Input label={t("supplies.form.name")} name="name" value={formData.name} onChange={handleChange} error={errors.name} required placeholder="e.g., Bottled Water" className="w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("supplies.form.category")} <span className="text-red-500">*</span>
                    </label>
                    {!showCategoryInput ? (
                        <div className="flex gap-2">
                            <Select name="categoryId" value={formData.categoryId} onChange={handleChange} options={[{ value: "", label: t("common.select") }, ...categories.map(c => ({ value: c._id, label: c.name }))]} error={errors.categoryId} className="flex-1" />
                            <Button type="button" variant="outline" icon={Plus} onClick={() => setShowCategoryInput(true)} />
                        </div>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category..." className="flex-1" />
                            <Button type="button" size="sm" onClick={handleCreateCategory} variant="primary">Add</Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => setShowCategoryInput(false)}><X size={16}/></Button>
                        </div>
                    )}
                </div>
                <Select label={t("supplies.form.unit")} name="unit" value={formData.unit} onChange={handleChange} options={UNIT_OPTIONS} error={errors.unit} required />
            </div>

            <Select label={t("supplies.form.status")} name="status" value={formData.status} onChange={handleChange} options={[{ value: "active", label: t("common.active") }, { value: "inactive", label: t("common.inactive") }, { value: "discontinued", label: t("supplies.status.discontinued") }]} />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label={t("supplies.form.currentStock")} name="currentStock" type="number" min="0" value={formData.currentStock} onChange={handleChange} error={errors.currentStock} />
                <Input label={t("supplies.form.minimumStock")} name="minimumStock" type="number" min="0" value={formData.minimumStock} onChange={handleChange} />
                <Input label={t("supplies.form.maximumStock")} name="maximumStock" type="number" min="0" value={formData.maximumStock} onChange={handleChange} />
            </div>

            {Number(formData.currentStock) <= Number(formData.minimumStock) && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg flex items-start gap-2">
                    <AlertCircle className="text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" size={16} />
                    <p className="text-sm text-orange-800 dark:text-orange-300">{t("supplies.form.lowStockWarning")}</p>
                </div>
            )}

            <div className="h-px bg-gray-200 dark:bg-gray-700 my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label={t("supplies.form.costPerUnit")} name="costPerUnit" type="number" step="0.001" min="0" value={formData.costPerUnit} onChange={handleChange} icon={DollarSign} />
                <Select label={t("supplies.form.pricingType")} name="pricingType" value={formData.pricingType} onChange={handleChange} options={PRICING_TYPES} />
                {formData.pricingType === "chargeable" && (
                    <Input label={t("supplies.form.chargePerUnit")} name="chargePerUnit" type="number" step="0.001" min="0" value={formData.chargePerUnit} onChange={handleChange} />
                )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label={t("supplies.form.supplierName")} name="supplier.name" value={formData.supplier.name} onChange={handleChange} />
                <Input label={t("supplies.form.supplierContact")} name="supplier.contact" value={formData.supplier.contact} onChange={handleChange} />
                <Input label={t("supplies.form.supplierPhone")} name="supplier.phone" value={formData.supplier.phone} onChange={handleChange} />
                <Input label={t("supplies.form.supplierEmail")} name="supplier.email" value={formData.supplier.email} onChange={handleChange} />
                <Input label={t("supplies.form.leadTime")} name="supplier.leadTimeDays" type="number" min="0" value={formData.supplier.leadTimeDays} onChange={handleChange} />
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-700 my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label={t("supplies.form.storageLocation")} name="storage.location" value={formData.storage.location} onChange={handleChange} />
                <div className="space-y-3 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="storage.requiresRefrigeration" checked={formData.storage.requiresRefrigeration} onChange={handleChange} className="rounded text-orange-600 focus:ring-orange-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{t("supplies.form.requiresRefrigeration")}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="storage.expiryTracking" checked={formData.storage.expiryTracking} onChange={handleChange} className="rounded text-orange-600 focus:ring-orange-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{t("supplies.form.expiryTracking")}</span>
                    </label>
                </div>
            </div>

            <Textarea label={t("supplies.form.notes")} name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full" />
          </div>
        );

      default: return null;
    }
  };

  if (fetchLoading && isEditMode) return <div className="p-10 text-center text-gray-500">{t("common.loading")}</div>;

  return (
    <div className="bg-white dark:bg-[#1f2937] h-full flex flex-col p-4 sm:p-6 rounded-lg">
      {!isModalMode && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? t("supplies.form.editTitle") : t("supplies.form.createTitle")}
          </h1>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {renderStepIndicator()}
        
        <div className="flex-1 mt-4 mb-8">{renderStepContent()}</div>

        <div className="flex items-center justify-between pt-6 mt-auto">
          {/* Previous / Cancel */}
          <Button
            type="button" // ✅ Explicitly prevent submit
            variant="ghost"
            onClick={currentStep === 1 ? (isModalMode && onCancel ? onCancel : () => navigate("/supplies")) : handlePrevious}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            {currentStep === 1 ? t("common.cancel") : <span className="flex items-center"><ChevronLeft className="w-4 h-4 mr-1" /> {t("common.previous")}</span>}
          </Button>

          <div className="flex items-center gap-3">
            {/* Quick Save (Only in Edit Mode & Not Last Step) */}
            {isEditMode && currentStep < totalSteps && (
              <Button 
                type="button" // ✅ Explicitly prevent submit, handled by onClick
                variant="ghost" 
                onClick={handleQuickUpdate} 
                disabled={loading} 
                className="text-orange-600 hover:bg-orange-50"
              >
                <Save className="w-4 h-4 mr-2" /> {t("common.updateNow")}
              </Button>
            )}

            {/* Next / Submit */}
            {currentStep < totalSteps ? (
              <Button 
                type="button" // ✅ Explicitly prevent submit
                variant="primary" 
                onClick={handleNext} 
                disabled={loading} 
                className="px-6"
              >
                <span className="flex items-center">{t("common.next")} <ChevronRight className="w-4 h-4 ml-1" /></span>
              </Button>
            ) : (
              <Button 
                type="submit" // ✅ Only this button submits
                variant="primary" 
                loading={loading} 
                className="px-6"
              >
                <span className="flex items-center"><Save className="w-4 h-4 mr-2" /> {isEditMode ? t("common.update") : t("common.create")}</span>
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SupplyForm;