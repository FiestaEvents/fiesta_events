import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  X,
  Package,
  AlertTriangle,
  Check,
  Loader2,
  DollarSign,
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
      quantityRequested: 1,
      costPerUnit: supply.costPerUnit || 0,
      chargePerUnit: supply.chargePerUnit || 0,
      pricingType: supply.pricingType || "included",
      currentStock: supply.currentStock,
    });
  };

  const togglePricingType = (index, currentType) => {
    const newType = currentType === "included" ? "chargeable" : "included";
    // If switching to chargeable and price is 0, maybe set a default?
    onUpdateSupply(index, { pricingType: newType });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected Supplies List */}
      {selectedSupplies.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
            {t("eventForm.step3.selectedSupplies")} ({selectedSupplies.length})
          </h4>

          {selectedSupplies.map((item, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              {/* Info */}
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <div className="p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                  <Package className="w-5 h-5 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {item.supplyName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.currentStock} {item.supplyUnit} available
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                {/* Pricing Toggle */}
                <button
                  type="button"
                  onClick={() => togglePricingType(index, item.pricingType)}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium border transition-colors ${
                    item.pricingType === "included"
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                      : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                  }`}
                >
                  {item.pricingType === "included"
                    ? "Included (Free)"
                    : "Chargeable"}
                </button>

                {/* Price Input (If Chargeable) */}
                {item.pricingType === "chargeable" && (
                  <div className="relative w-24">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={item.chargePerUnit}
                      onChange={(e) =>
                        onUpdateSupply(index, {
                          chargePerUnit: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="pr-8 text-right h-9"
                      placeholder="0.00"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      TND
                    </span>
                  </div>
                )}

                {/* Quantity Input */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Qty:</span>
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
                    className="w-16 text-center h-9"
                  />
                </div>

                <button
                  onClick={() => onRemoveSupply(index)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Cost Summary (Small Footer) */}
          <div className="flex justify-end gap-6 text-sm pt-2 px-2 text-gray-600 dark:text-gray-400">
            <span>
              Venue Cost:{" "}
              <b>
                {selectedSupplies
                  .reduce((s, i) => s + i.quantityRequested * i.costPerUnit, 0)
                  .toFixed(2)}{" "}
                TND
              </b>
            </span>
            <span className="text-orange-600 dark:text-orange-400">
              Client Bill:{" "}
              <b>
                {selectedSupplies
                  .reduce(
                    (s, i) =>
                      i.pricingType === "chargeable"
                        ? s + i.quantityRequested * i.chargePerUnit
                        : s,
                    0
                  )
                  .toFixed(2)}{" "}
                TND
              </b>
            </span>
          </div>
        </div>
      )}

      {/* Add Supply Button & Browser (Same as before) */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowSupplyBrowser(!showSupplyBrowser)}
        icon={showSupplyBrowser ? X : Plus}
        className="w-full"
      >
        {showSupplyBrowser
          ? t("eventForm.step3.closeSupplyBrowser")
          : t("eventForm.step3.addSupplies")}
      </Button>

      {showSupplyBrowser && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-white dark:bg-gray-800 animate-in fade-in slide-in-from-top-2">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeCategory === null ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}
            >
              {t("common.all")}
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => setActiveCategory(c._id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeCategory === c._id ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            {filteredSupplies.map((supply) => {
              const isAdded = selectedSupplies.some(
                (s) => s.supply === supply._id
              );
              return (
                <div
                  key={supply._id}
                  onClick={() => !isAdded && handleAddSupply(supply)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${isAdded ? "opacity-50 border-green-200 bg-green-50" : "hover:border-orange-500 border-gray-200 dark:border-gray-700 dark:hover:border-orange-500"}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {supply.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {supply.currentStock} {supply.unit}
                      </p>
                    </div>
                    {isAdded && <Check className="w-4 h-4 text-green-600" />}
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
