import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Save, Package, DollarSign, Truck, ChevronRight, ChevronLeft,
  Check, AlertCircle, Plus, X, Tag, Loader2
} from "lucide-react";

// API
import { supplyService, supplyCategoryService } from "../../api/index";

// Components
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import OrbitLoader from "../../components/common/LoadingSpinner";
import { useToast } from "../../hooks/useToast";

// --- VALIDATION SCHEMA (Zod) ---
// This handles all your error logic in one place
const supplySchema = (t) => z.object({
  name: z.string().min(1, t("supplies.validation.nameRequired")),
  categoryId: z.string().min(1, t("supplies.validation.categoryRequired")),
  unit: z.string().min(1, t("supplies.validation.unitRequired")),
  status: z.enum(["active", "inactive", "discontinued"]),
  
  // Coerce converts strings to numbers automatically
  currentStock: z.coerce.number().min(0, t("supplies.validation.negativeStock")),
  minimumStock: z.coerce.number().min(0),
  maximumStock: z.coerce.number().min(0),
  
  costPerUnit: z.coerce.number().min(0, t("supplies.validation.negativeCost")),
  pricingType: z.enum(["included", "chargeable", "optional"]),
  chargePerUnit: z.coerce.number().min(0).optional(),
  
  supplier: z.object({
    name: z.string().optional(),
    contact: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email(t("common.invalidEmail")).optional().or(z.literal("")),
    leadTimeDays: z.coerce.number().min(0).default(7),
  }),
  
  storage: z.object({
    location: z.string().optional(),
    requiresRefrigeration: z.boolean().default(false),
    expiryTracking: z.boolean().default(false),
    shelfLife: z.coerce.number().min(0).optional(),
  }),
  notes: z.string().optional(),
});

// --- SUB-COMPONENT: Category Creation Modal ---
// Keeps the main form clean
const CreateCategoryModal = ({ isOpen, onClose, onCreated, t }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      const res = await supplyCategoryService.create({
        name,
        icon: "Package", // Default icon
        color: "#F18237", // Default color
      });
      const newCat = res.category || res.data?.category || res;
      showSuccess(t("supplies.notifications.categoryCreated"));
      onCreated(newCat);
      setName("");
      onClose();
    } catch (err) {
      showError(t("supplies.notifications.categoryCreateError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6 animate-fadeIn">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {t("supplies.form.createCategory")}
        </h3>
        <Input 
          autoFocus
          label={t("supplies.form.categoryName")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Beverages"
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={onClose} type="button">{t("common.cancel")}</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} disabled={!name.trim()}>
            {t("common.create")}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const SupplyForm = ({ supply: supplyProp, onSuccess, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showError, showWarning, apiError } = useToast();

  const isEditMode = Boolean(id || supplyProp?._id);
  const supplyId = id || supplyProp?._id;
  const isModalMode = Boolean(onSuccess && onCancel);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Data State
  const [categories, setCategories] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // --- REACT HOOK FORM SETUP ---
  const { 
    register, 
    control, 
    handleSubmit, 
    setValue, 
    watch, 
    trigger, // Used to validate partial steps
    reset,
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: zodResolver(supplySchema(t)),
    defaultValues: {
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
      supplier: { leadTimeDays: 7 },
      storage: { requiresRefrigeration: false, expiryTracking: false },
    },
    mode: "onChange" // Validate as user types
  });

  // Watch values for logic (like showing low stock warning)
  const currentStock = watch("currentStock");
  const minimumStock = watch("minimumStock");
  const pricingType = watch("pricingType");

  // --- LOAD DATA ---
  useEffect(() => {
    const initData = async () => {
      setFetchLoading(true);
      try {
        const catRes = await supplyCategoryService.getAll();
        setCategories(catRes.categories || catRes.data?.categories || []);

        let dataToLoad = supplyProp;

        if (isEditMode && !supplyProp) {
          const res = await supplyService.getById(supplyId);
          dataToLoad = res.supply || res.data?.supply || res;
        }

        if (dataToLoad) {
          // Reset form with API data (Flattening nested if needed happens here)
          reset({
            ...dataToLoad,
            categoryId: dataToLoad.categoryId?._id || dataToLoad.categoryId,
            // Ensure numbers are numbers
            currentStock: Number(dataToLoad.currentStock),
            minimumStock: Number(dataToLoad.minimumStock),
          });
        }
      } catch (err) {
        apiError(err, t("supplies.notifications.loadError"));
        if (!isModalMode) navigate("/supplies");
      } finally {
        setFetchLoading(false);
      }
    };
    initData();
  }, [isEditMode, supplyId, supplyProp, reset, navigate, apiError, t]);

  // --- ACTIONS ---

  // Handle Category Creation via Modal
  const handleCategoryCreated = (newCategory) => {
    setCategories(prev => [...prev, newCategory]);
    setValue("categoryId", newCategory._id, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await supplyService.update(supplyId, data);
      } else {
        await supplyService.create(data);
      }
      if (isModalMode && onSuccess) onSuccess();
      else navigate("/supplies");
    } catch (error) {
      apiError(error, t("common.error"));
    }
  };

  // --- STEP NAVIGATION (With Validation) ---
  const handleNext = async () => {
    let fieldsToValidate = [];
    
    // Define which fields belong to which step for validation
    if (currentStep === 1) fieldsToValidate = ["name", "categoryId", "unit"];
    if (currentStep === 2) fieldsToValidate = ["currentStock", "costPerUnit", "pricingType"];
    
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      showWarning(t("common.fixErrors"));
    }
  };

  const handlePrevious = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // --- RENDER HELPERS ---
  const steps = [
    { number: 1, title: t("supplies.form.steps.basicInfo"), icon: Package },
    { number: 2, title: t("supplies.form.steps.inventory"), icon: Tag },
    { number: 3, title: t("supplies.form.steps.supplier"), icon: Truck },
  ];

  if (fetchLoading && isEditMode) return <div className="p-10 flex justify-center"><OrbitLoader /></div>;

  return (
    <>
      {/* Category Modal - Rendered outside form context */}
      <CreateCategoryModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)}
        onCreated={handleCategoryCreated}
        t={t}
      />

      <div className="bg-white dark:bg-[#1f2937] h-full flex flex-col p-4 sm:p-6 rounded-lg">
        {!isModalMode && (
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {isEditMode ? t("supplies.form.editTitle") : t("supplies.form.createTitle")}
          </h1>
        )}

        {/* --- STEP INDICATOR (Visual Only) --- */}
        <div className="mb-8 px-4">
          <div className="flex items-center justify-between relative max-w-lg mx-auto">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-100 dark:bg-gray-700 -z-10" />
            {steps.map((step) => {
              const isCompleted = step.number < currentStep;
              const isCurrent = step.number === currentStep;
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex flex-col items-center gap-2 bg-white dark:bg-[#1f2937] px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted ? "bg-green-100 text-green-600" : isCurrent ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          
          {/* --- STEP 1: BASIC INFO --- */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <Input
                label={t("supplies.form.name")}
                {...register("name")}
                error={errors.name?.message}
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("supplies.form.category")} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Controller
                        name="categoryId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={[
                              { value: "", label: t("common.select") },
                              ...categories.map(c => ({ value: c._id, label: c.name }))
                            ]}
                            error={errors.categoryId?.message}
                          />
                        )}
                      />
                    </div>
                    {/* Add Category Button */}
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => setIsCategoryModalOpen(true)}
                      icon={<Plus size={18} />}
                    />
                  </div>
                </div>

                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label={t("supplies.form.unit")}
                      options={[
                        { value: "piece", label: "Piece" },
                        { value: "kg", label: "Kilogram (kg)" },
                        // ... other options
                      ]}
                      error={errors.unit?.message}
                    />
                  )}
                />
              </div>

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                   <Select 
                     {...field} 
                     label={t("supplies.form.status")}
                     options={[
                       { value: "active", label: t("common.active") },
                       { value: "inactive", label: t("common.inactive") }
                     ]} 
                   />
                )}
              />
            </div>
          )}

          {/* --- STEP 2: INVENTORY --- */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label={t("supplies.form.currentStock")} type="number" {...register("currentStock")} error={errors.currentStock?.message} />
                <Input label={t("supplies.form.minimumStock")} type="number" {...register("minimumStock")} error={errors.minimumStock?.message} />
                <Input label={t("supplies.form.maximumStock")} type="number" {...register("maximumStock")} error={errors.maximumStock?.message} />
              </div>

              {/* Dynamic Warning based on watched values */}
              {currentStock <= minimumStock && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex gap-2 text-orange-800">
                  <AlertCircle size={16} className="mt-0.5" />
                  <span className="text-sm">{t("supplies.form.lowStockWarning")}</span>
                </div>
              )}

              <div className="h-px bg-gray-200 dark:bg-gray-700 my-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label={t("supplies.form.costPerUnit")} type="number" step="0.01" {...register("costPerUnit")} error={errors.costPerUnit?.message} icon={DollarSign} />
                
                <Controller
                  name="pricingType"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label={t("supplies.form.pricingType")} options={[
                      { value: "included", label: t("supplies.pricing.included") },
                      { value: "chargeable", label: t("supplies.pricing.chargeable") }
                    ]} />
                  )}
                />

                {pricingType === "chargeable" && (
                  <Input label={t("supplies.form.chargePerUnit")} type="number" step="0.01" {...register("chargePerUnit")} />
                )}
              </div>
            </div>
          )}

          {/* --- STEP 3: SUPPLIER --- */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label={t("supplies.form.supplierName")} {...register("supplier.name")} />
                <Input label={t("supplies.form.supplierEmail")} {...register("supplier.email")} error={errors.supplier?.email?.message} />
                <Input label={t("supplies.form.leadTime")} type="number" {...register("supplier.leadTimeDays")} />
              </div>

              <div className="space-y-3 pt-4">
                 <label className="flex items-center gap-2">
                   <input type="checkbox" {...register("storage.requiresRefrigeration")} className="rounded text-orange-600" />
                   <span className="text-sm">{t("supplies.form.requiresRefrigeration")}</span>
                 </label>
                 <label className="flex items-center gap-2">
                   <input type="checkbox" {...register("storage.expiryTracking")} className="rounded text-orange-600" />
                   <span className="text-sm">{t("supplies.form.expiryTracking")}</span>
                 </label>
              </div>

              <Textarea label={t("supplies.form.notes")} {...register("notes")} />
            </div>
          )}

          {/* --- FOOTER BUTTONS --- */}
          <div className="flex items-center justify-between pt-6 mt-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={currentStep === 1 ? (onCancel || (() => navigate("/supplies"))) : handlePrevious}
            >
              {currentStep === 1 ? t("common.cancel") : t("common.previous")}
            </Button>

            <div className="flex gap-3">
              {currentStep < totalSteps ? (
                <Button type="button" variant="primary" onClick={handleNext}>
                  {t("common.next")} <ChevronRight size={16} className="ml-1" />
                </Button>
              ) : (
                <Button type="submit" variant="primary" loading={isSubmitting}>
                  <Save size={16} className="mr-2" />
                  {isEditMode ? t("common.update") : t("common.create")}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default SupplyForm;