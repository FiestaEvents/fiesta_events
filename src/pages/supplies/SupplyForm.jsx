import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  Tag,
  Box,
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

// --- VALIDATION SCHEMA ---
const supplySchema = (t) =>
  z.object({
    name: z.string().min(1, t("supplies.validation.nameRequired")),
    categoryId: z.string().min(1, t("supplies.validation.categoryRequired")),
    unit: z.string().min(1, t("supplies.validation.unitRequired")),
    status: z.enum(["active", "inactive", "discontinued"]).default("active"),

    currentStock: z.coerce
      .number()
      .min(0, t("supplies.validation.negativeStock")),
    minimumStock: z.coerce.number().min(0),
    maximumStock: z.coerce.number().min(0),

    costPerUnit: z.coerce.number().min(0),
    pricingType: z.enum(["included", "chargeable", "optional"]),
    chargePerUnit: z.coerce.number().min(0).optional(),

    supplier: z.object({
      name: z.string().optional(),
      contact: z.string().optional(),
      phone: z.string().optional(),
      email: z.union([
        z.literal(""),
        z.string().email(t("common.invalidEmail")),
      ]),
      leadTimeDays: z.coerce.number().min(0).default(7),
    }),

    storage: z.object({
      requiresRefrigeration: z.boolean().default(false),
      expiryTracking: z.boolean().default(false),
    }),
    notes: z.string().optional(),
  });

// --- SUB-COMPONENT: Category Modal ---
const CreateCategoryModal = ({ isOpen, onClose, onCreated, t }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await supplyCategoryService.create({
        name,
        icon: "Package",
        color: "#F18237",
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6 animate-scaleIn border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">
          {t("supplies.form.createCategory")}
        </h3>
        <Input
          autoFocus
          label={t("supplies.form.categoryName")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Beverages"
          className="mb-6"
        />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} type="button">
            {t("common.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={!name.trim()}
          >
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
  const { apiError, showWarning } = useToast();

  const isEditMode = Boolean(id || supplyProp?._id);
  const supplyId = id || supplyProp?._id;
  const isModalMode = Boolean(onSuccess && onCancel);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [categories, setCategories] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // --- FORM SETUP ---
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(supplySchema(t)),
    defaultValues: {
      name: "",
      categoryId: "",
      unit: "piece",
      status: "active",
      currentStock: 0,
      minimumStock: 10,
      maximumStock: 1000,
      costPerUnit: 0,
      pricingType: "included",
      supplier: { leadTimeDays: 7, email: "" },
      storage: { requiresRefrigeration: false, expiryTracking: false },
    },
    mode: "onChange",
  });

  const currentStock = watch("currentStock");
  const minimumStock = watch("minimumStock");
  const pricingType = watch("pricingType");

  // --- INITIAL DATA LOAD ---
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
          reset({
            ...dataToLoad,
            categoryId: dataToLoad.categoryId?._id || dataToLoad.categoryId,
            currentStock: Number(dataToLoad.currentStock),
            minimumStock: Number(dataToLoad.minimumStock),
            maximumStock: Number(dataToLoad.maximumStock),
            costPerUnit: Number(dataToLoad.costPerUnit),
            supplier: {
              ...dataToLoad.supplier,
              email: dataToLoad.supplier?.email || "",
            },
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

  // --- HANDLERS ---
  const handleCategoryCreated = (newCategory) => {
    setCategories((prev) => [...prev, newCategory]);
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

  const handlePrevious = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (currentStep === 1) {
      if (onCancel) onCancel();
      else navigate("/supplies");
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleNext = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    let fields = [];
    if (currentStep === 1) fields = ["name", "categoryId", "unit", "status"];
    if (currentStep === 2)
      fields = ["currentStock", "costPerUnit", "pricingType"];

    const isValid = await trigger(fields);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      showWarning(t("common.fixErrors"));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target.type !== "textarea") {
      e.preventDefault();
      if (currentStep < totalSteps) handleNext();
    }
  };

  const steps = [
    { number: 1, title: t("supplies.form.steps.basicInfo"), icon: Package },
    { number: 2, title: t("supplies.form.steps.inventory"), icon: Tag },
    { number: 3, title: t("supplies.form.steps.supplier"), icon: Truck },
  ];

  if (fetchLoading && isEditMode)
    return (
      <div className="p-12 flex justify-center text-gray-500">
        <OrbitLoader />
      </div>
    );

  return (
    <>
      <CreateCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCreated={handleCategoryCreated}
        t={t}
      />

      <div className="bg-white dark:bg-[#1f2937] h-full flex flex-col rounded-xl shadow-sm overflow-hidden">
        {!isModalMode && (
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEditMode
                ? t("supplies.form.editTitle")
                : t("supplies.form.createTitle")}
            </h1>
          </div>
        )}

        {/* STEPPER */}
        <div className="pt-6 pb-2 px-6">
          <div className="flex items-center justify-between relative max-w-2xl mx-auto">
            {/* Connecting Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-100 dark:bg-gray-700 -z-10" />

            {steps.map((step) => {
              const isCompleted = step.number < currentStep;
              const isCurrent = step.number === currentStep;
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ring-4 ring-white dark:ring-[#1f2937] ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                          : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={16} strokeWidth={3} />
                    ) : (
                      <Icon size={18} />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors ${
                      isCurrent
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={handleKeyDown}
          className="flex-1 flex flex-col w-full min-h-0"
        >
          <div className="flex-1 px-6 py-6 overflow-y-auto custom-scrollbar">
            <div className="max-w-3xl mx-auto w-full">
              {/* STEP 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 gap-6">
                    <Input
                      label={t("supplies.form.name")}
                      {...register("name")}
                      error={errors.name?.message}
                      required
                      placeholder="e.g. Bottled Water 500ml"
                      className="text-lg"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t("supplies.form.category")}{" "}
                          <span className="text-red-500">*</span>
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
                                    ...categories.map((c) => ({
                                      value: c._id,
                                      label: c.name,
                                    })),
                                  ]}
                                  error={errors.categoryId?.message}
                                />
                              )}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            className="shrink-0 aspect-square px-0 w-[42px]"
                            onClick={() => setIsCategoryModalOpen(true)}
                            icon={<Plus size={18} />}
                            title={t("supplies.form.addCategory")}
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
                              { value: "kg", label: "Kg" },
                              { value: "liter", label: "Liter" },
                              { value: "box", label: "Box" },
                              { value: "pack", label: "Pack" },
                            ]}
                            error={errors.unit?.message}
                          />
                        )}
                      />
                    </div>

                    <div className="pt-2">
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            label={t("supplies.form.status")}
                            options={[
                              { value: "active", label: t("common.active") },
                              {
                                value: "inactive",
                                label: t("common.inactive"),
                              },
                            ]}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Inventory & Pricing */}
              {currentStep === 2 && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Stock Section */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Box className="w-4 h-4 text-orange-500" />{" "}
                      {t("supplies.form.steps.inventory")}
                    </h3>
                    {/* ✅ CHANGED: grid-cols-1 to stack inputs properly */}
                    <div className="grid grid-cols-1 gap-5">
                      <Input
                        label={t("supplies.form.currentStock")}
                        type="number"
                        {...register("currentStock")}
                        error={errors.currentStock?.message}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Input
                          label={t("supplies.form.minimumStock")}
                          type="number"
                          {...register("minimumStock")}
                          error={errors.minimumStock?.message}
                        />
                        <Input
                          label={t("supplies.form.maximumStock")}
                          type="number"
                          {...register("maximumStock")}
                          error={errors.maximumStock?.message}
                        />
                      </div>
                    </div>
                    {Number(currentStock) <= Number(minimumStock) && (
                      <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg flex gap-3 text-orange-800 dark:text-orange-300">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <span className="text-sm font-medium">
                          {t("supplies.form.lowStockWarning")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pricing Section */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />{" "}
                      {t("supplies.pricing.title")}
                    </h3>
                    {/* ✅ CHANGED: grid-cols-1 to give pricing inputs full width */}
                    <div className="grid grid-cols-1 gap-5">
                      <Input
                        label={t("supplies.form.costPerUnit")}
                        type="number"
                        step="0.01"
                        {...register("costPerUnit")}
                        error={errors.costPerUnit?.message}
                        icon={DollarSign}
                        placeholder="0.00"
                      />

                      <div className="space-y-4">
                        <Controller
                          name="pricingType"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              label={t("supplies.form.pricingType")}
                              options={[
                                {
                                  value: "included",
                                  label: t("supplies.pricing.included"),
                                },
                                {
                                  value: "chargeable",
                                  label: t("supplies.pricing.chargeable"),
                                },
                              ]}
                            />
                          )}
                        />

                        {pricingType === "chargeable" && (
                          <div className="animate-in slide-in-from-top-2">
                            <Input
                              label={t("supplies.form.chargePerUnit")}
                              type="number"
                              step="0.01"
                              {...register("chargePerUnit")}
                              icon={DollarSign}
                              placeholder="0.00"
                              className="border-blue-200 focus:border-blue-500 focus:ring-blue-200"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Supplier & Info */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-500" />{" "}
                      {t("supplies.form.steps.supplier")}
                    </h3>
                    {/* Stacking supplier inputs for better visibility in modals */}
                    <div className="grid grid-cols-1 gap-5">
                      <Input
                        label={t("supplies.form.supplierName")}
                        {...register("supplier.name")}
                        placeholder="e.g. Acme Corp"
                      />
                      <Input
                        label={t("supplies.form.supplierEmail")}
                        {...register("supplier.email")}
                        error={errors.supplier?.email?.message}
                        placeholder="contact@supplier.com"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Input
                          label={t("supplies.form.leadTime")}
                          type="number"
                          {...register("supplier.leadTimeDays")}
                          suffix="days"
                        />
                        <Input
                          label={t("supplies.form.supplierPhone")}
                          {...register("supplier.phone")}
                          placeholder="+216..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#1f2937] p-1">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <label className="flex items-center gap-3 cursor-pointer group p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors flex-1">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            {...register("storage.requiresRefrigeration")}
                            className="peer sr-only"
                          />
                          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all"></div>
                          <Check className="w-3.5 h-3.5 text-white absolute top-1 left-1 opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                          {t("supplies.form.requiresRefrigeration")}
                        </span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors flex-1">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            {...register("storage.expiryTracking")}
                            className="peer sr-only"
                          />
                          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all"></div>
                          <Check className="w-3.5 h-3.5 text-white absolute top-1 left-1 opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                          {t("supplies.form.expiryTracking")}
                        </span>
                      </label>
                    </div>

                    <Textarea
                      label={t("supplies.form.notes")}
                      {...register("notes")}
                      placeholder={t("supplies.form.notesPlaceholder")}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handlePrevious}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              {currentStep === 1 ? (
                t("common.cancel")
              ) : (
                <span className="flex items-center gap-2">
                  <ChevronLeft size={16} /> {t("common.previous")}
                </span>
              )}
            </Button>

            <div className="flex gap-3">
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  className="px-6"
                >
                  <span className="flex items-center gap-2">
                    {t("common.next")} <ChevronRight size={16} />
                  </span>
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  className="px-6 shadow-lg shadow-orange-500/20"
                >
                  <span className="flex items-center gap-2">
                    <Save size={16} />
                    {isEditMode ? t("common.update") : t("common.create")}
                  </span>
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
