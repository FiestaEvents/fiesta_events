//src/pages/events/EventForm/components/SupplySelector.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  X,
  Package,
  Loader2,
  Check, // ✅ Ensuring Check is imported
  Info,
} from "lucide-react";
import { supplyService, supplyCategoryService } from "../../../../api/index";
import Button from "../../../../components/common/Button";
import Input from "../../../../components/common/Input";

const SupplySelector = ({
  selectedSupplies,
  onAddSupply,
  onRemoveSupply,
  onUpdateSupply,
}) => {
  const { t } = useTranslation();

  const [supplies, setSupplies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSupplyBrowser, setShowSupplyBrowser] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [suppliesRes, categoriesRes] = await Promise.all([
          supplyService.getAll({ status: "active" }),
          supplyCategoryService.getAll(),
        ]);
        setSupplies(suppliesRes?.supplies || suppliesRes?.data?.supplies || []);
        setCategories(
          categoriesRes?.categories || categoriesRes?.data?.categories || []
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSupplies = supplies.filter(
    (supply) =>
      (!activeCategory || supply.categoryId?._id === activeCategory) &&
      supply.currentStock > 0
  );

  const handleAddSupply = (supply) => {
    const alreadyAdded = selectedSupplies.some((s) => s.supply === supply._id);
    if (alreadyAdded) return;

    onAddSupply({
      supply: supply._id,
      supplyName: supply.name,
      supplyCategoryId: supply.categoryId?._id,
      supplyCategoryName: supply.categoryId?.name,
      supplyUnit: supply.unit,
      quantityRequested: 1, // Default quantity
      // ✅ STRICTLY FETCHED FROM DB
      costPerUnit: supply.costPerUnit || 0,
      chargePerUnit: supply.chargePerUnit || 0,
      pricingType: supply.pricingType || "included",
      currentStock: supply.currentStock,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Calculate totals for footer
  const totalClientBill = selectedSupplies.reduce(
    (sum, item) =>
      item.pricingType === "chargeable"
        ? sum + item.quantityRequested * item.chargePerUnit
        : sum,
    0
  );

  return (
    <div className="space-y-6">
      {/* --- SELECTED SUPPLIES LIST --- */}
      {selectedSupplies.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-6 md:col-span-5">Item</div>
            <div className="col-span-2 text-right">Unit Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {selectedSupplies.map((item, index) => {
              const lineTotal =
                item.pricingType === "chargeable"
                  ? (item.quantityRequested * item.chargePerUnit).toFixed(2)
                  : "0.00";

              return (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {/* 1. Item Info */}
                  <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                    <div className="hidden sm:flex p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-500 shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="font-medium text-sm text-gray-900 dark:text-white truncate"
                        title={item.supplyName}
                      >
                        {item.supplyName}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {item.currentStock} {item.supplyUnit} available
                      </p>
                    </div>
                  </div>

                  {/* 2. Unit Price (READ ONLY) */}
                  <div className="col-span-2 text-right">
                    {item.pricingType === "chargeable" ? (
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.chargePerUnit.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Free
                      </span>
                    )}
                  </div>

                  {/* 3. Quantity Input (THE ONLY EDITABLE FIELD) */}
                  <div className="col-span-2 flex justify-center">
                    <Input
                      type="number"
                      min="1"
                      max={item.currentStock}
                      value={item.quantityRequested}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        onUpdateSupply(index, {
                          quantityRequested: Math.min(val, item.currentStock),
                        });
                      }}
                      className="w-16 text-center h-9 text-sm"
                    />
                  </div>

                  {/* 4. Line Total (Calculated) */}
                  <div className="col-span-2 text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {lineTotal}{" "}
                      <span className="text-[10px] font-normal text-gray-500">
                        TND
                      </span>
                    </span>
                  </div>

                  {/* 5. Remove */}
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => onRemoveSupply(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Summary */}
          <div className="bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700 p-3 flex justify-end items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total Extra:
            </span>
            <span className="text-base font-bold text-orange-600 dark:text-orange-500">
              {totalClientBill.toFixed(3)} TND
            </span>
          </div>
        </div>
      )}

      {/* --- ADD BUTTON & BROWSER --- */}
      {/* (This part remains largely the same, simpler browsing) */}
      <Button
        type="button"
        variant={selectedSupplies.length === 0 ? "outline" : "ghost"}
        onClick={() => setShowSupplyBrowser(!showSupplyBrowser)}
        className={`w-full border-dashed ${showSupplyBrowser ? "border-orange-500 text-orange-600 bg-orange-50" : "border-gray-300 text-gray-500 hover:border-orange-500 hover:text-orange-600"}`}
      >
        <div className="flex items-center justify-center gap-2 py-2">
          {showSupplyBrowser ? (
            <X className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>
            {showSupplyBrowser
              ? t("eventForm.step3.closeSupplyBrowser")
              : t("eventForm.step3.addSupplies")}
          </span>
        </div>
      </Button>

      {showSupplyBrowser && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg animate-in fade-in slide-in-from-top-2">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap border ${activeCategory === null ? "bg-orange-600 border-orange-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"}`}
            >
              {t("common.all")}
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => setActiveCategory(c._id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap border ${activeCategory === c._id ? "bg-orange-600 border-orange-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"}`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {filteredSupplies.map((supply) => {
              const isAdded = selectedSupplies.some(
                (s) => s.supply === supply._id
              );
              return (
                <div
                  key={supply._id}
                  onClick={() => !isAdded && handleAddSupply(supply)}
                  className={`relative p-3 border rounded-lg cursor-pointer transition-all group ${
                    isAdded
                      ? "bg-green-50 border-green-200 opacity-60"
                      : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-orange-400 hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div className="mb-2">
                      <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                        {supply.name}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {supply.currentStock} {supply.unit}
                      </p>
                    </div>
                    <div className="flex justify-between items-end">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${supply.pricingType === "chargeable" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {supply.pricingType === "chargeable"
                          ? `${supply.chargePerUnit} TND`
                          : "Free"}
                      </span>
                      {isAdded ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Plus className="w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplySelector;
