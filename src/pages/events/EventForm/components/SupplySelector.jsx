import React, { useState, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Plus, X, Package, Loader2, Check, Search } from "lucide-react";
import { supplyService, supplyCategoryService } from "../../../../api/index";
import { FormInput } from "../../../../components/forms/FormInput";

export const SupplySelector = () => {
  const { t } = useTranslation();
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "supplies",
  });

  const [dbSupplies, setDbSupplies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);

  // Fetch only on open
  useEffect(() => {
    if (showBrowser && dbSupplies.length === 0) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [suppliesRes, categoriesRes] = await Promise.all([
            supplyService.getAll({ status: "active" }),
            supplyCategoryService.getAll(),
          ]);
          setDbSupplies(
            suppliesRes?.supplies || suppliesRes?.data?.supplies || []
          );
          setCategories(
            categoriesRes?.categories || categoriesRes?.data?.categories || []
          );
        } catch (error) {
          console.error("Supply fetch error:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [showBrowser, dbSupplies.length]);

  const filteredDbSupplies = dbSupplies.filter(
    (supply) =>
      (!activeCategory || supply.categoryId?._id === activeCategory) &&
      supply.currentStock > 0
  );

  const handleAddFromBrowser = (supply, e) => {
    // 🛑 STOP SUBMISSION
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (fields.some((field) => field.supply === supply._id)) return;

    append({
      supply: supply._id,
      supplyName: supply.name,
      quantityRequested: 1,
      supplyUnit: supply.unit,
      pricingType: supply.pricingType || "included",
      currentStock: supply.currentStock,
      costPerUnit: supply.costPerUnit || 0,
      chargePerUnit: supply.chargePerUnit || 0,
    });
  };

  // Safe Math
  const calculateTotal = (field) => {
    if (field.pricingType !== "chargeable") return "0.00";
    const qty = Number(field.quantityRequested) || 0;
    const price = Number(field.chargePerUnit) || 0;
    return (qty * price).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {fields.length > 0
            ? `${fields.length} item(s) allocated`
            : "No items allocated yet"}
        </span>

        {/* NATIVE BUTTON - SAFE FROM SUBMIT */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setShowBrowser(!showBrowser);
          }}
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-xs font-bold hover:bg-gray-50 bg-white dark:bg-transparent dark:text-white dark:border-gray-600 transition-colors"
        >
          {showBrowser ? <X size={14} /> : <Plus size={14} />}
          {showBrowser ? t("common.close") : "Add Inventory"}
        </button>
      </div>

      {/* --- A. SELECTED SUPPLIES LIST --- */}
      {fields.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-orange-700 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 dark:bg-orange-900/50 border-b border-gray-200 dark:border-orange-700 text-xs font-semibold text-gray-500 uppercase">
            <div className="col-span-5 md:col-span-6">Item</div>
            <div className="col-span-3 md:col-span-2 text-center">Qty</div>
            <div className="col-span-2 md:col-span-3 text-right">Price</div>
            <div className="col-span-2 md:col-span-1"></div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                {/* 1. Info */}
                <div className="col-span-5 md:col-span-6 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex p-1.5 bg-green-50 dark:bg-green-900/20 rounded text-green-600">
                      <Package size={16} />
                    </div>
                    <div className="truncate">
                      <p
                        className="font-medium text-sm text-gray-900 dark:text-white truncate"
                        title={field.supplyName}
                      >
                        {field.supplyName}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {field.currentStock} {field.supplyUnit} stock
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Quantity */}
                <div className="col-span-3 md:col-span-2">
                  <FormInput
                    name={`supplies.${index}.quantityRequested`}
                    type="number"
                    className="mb-0 text-center"
                    min="1"
                    max={field.currentStock}
                    onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                  />
                </div>

                {/* 3. Price */}
                <div className="col-span-2 md:col-span-3 text-right">
                  {field.pricingType === "chargeable" ? (
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {calculateTotal(field)}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {field.chargePerUnit} ea
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                      {field.pricingType}
                    </span>
                  )}
                </div>

                {/* 4. Remove */}
                <div className="col-span-2 md:col-span-1 text-right">
                  <button
                    type="button" // EXPLICIT TYPE
                    onClick={() => remove(index)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- B. DATABASE BROWSER --- */}
      {showBrowser && (
        <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 animate-in fade-in slide-in-from-top-2">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-orange-500" />
            </div>
          ) : (
            <>
              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveCategory(null);
                  }}
                  type="button"
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors whitespace-nowrap ${
                    activeCategory === null
                      ? "bg-orange-600 text-white dark:bg-white dark:text-black"
                      : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  All Items
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    type="button" // EXPLICIT TYPE
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveCategory(c._id);
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors whitespace-nowrap ${
                      activeCategory === c._id
                        ? "bg-gray-800 text-white border-gray-800 dark:bg-white dark:text-black"
                        : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {filteredDbSupplies.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-gray-500 text-sm">
                    No stock available in this category.
                  </div>
                ) : (
                  filteredDbSupplies.map((item) => {
                    const isAllocated = fields.some(
                      (f) => f.supply === item._id
                    );
                    return (
                      <button
                        key={item._id}
                        type="button" // CRITICAL FIX HERE
                        disabled={isAllocated}
                        onClick={(e) => handleAddFromBrowser(item, e)}
                        className={`
                                    relative p-3 border rounded-lg text-left transition-all
                                    ${
                                      isAllocated
                                        ? "bg-green-50 border-green-200 opacity-60 cursor-default"
                                        : "bg-white border-gray-200 hover:border-orange-500 hover:shadow-md dark:bg-gray-700 dark:border-gray-600"
                                    }
                                  `}
                      >
                        <div className="flex justify-between items-start mb-2">
                          {isAllocated ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Plus className="w-4 h-4 text-gray-400" />
                          )}
                          <span
                            className={`text-[10px] px-1.5 rounded ${item.pricingType === "chargeable" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}
                          >
                            {item.pricingType === "chargeable"
                              ? `${item.chargePerUnit}`
                              : "Free"}
                          </span>
                        </div>
                        <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {item.currentStock} {item.unit} left
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
