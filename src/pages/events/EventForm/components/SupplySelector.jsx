import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X, Package, AlertTriangle, Check } from "lucide-react";
import { supplyService } from "../../../../api/index";
import Button from "../../../../components/common/Button";
import Input from "../../../../components/common/Input";

const SupplySelector = ({ selectedSupplies, onAddSupply, onRemoveSupply, onUpdateQuantity }) => {
  const { t } = useTranslation();
  
  const [supplies, setSupplies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSupplyBrowser, setShowSupplyBrowser] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [suppliesRes, categoriesRes] = await Promise.all([
        supplyService.getAll({ status: "active" }),
        supplyService.getCategories(),
      ]);
      
      setSupplies(suppliesRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error("Failed to fetch supplies:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSupplies = supplies.filter(
    (supply) => 
      (!activeCategory || supply.categoryId?._id === activeCategory) &&
      supply.currentStock > 0 // Only show supplies in stock
  );

  const handleAddSupply = (supply) => {
    // Check if already added
    const alreadyAdded = selectedSupplies.some(s => s.supply === supply._id);
    if (alreadyAdded) {
      return;
    }

    const newSupply = {
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
    };

    onAddSupply(newSupply);
    setShowSupplyBrowser(false);
  };

  const getStockStatus = (supply) => {
    if (supply.currentStock === 0) return { color: "red", label: "Out of Stock" };
    if (supply.currentStock <= supply.minimumStock) return { color: "orange", label: "Low Stock" };
    return { color: "green", label: "In Stock" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected Supplies List */}
      {selectedSupplies.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
            {t("eventForm.step3.selectedSupplies")} ({selectedSupplies.length})
          </h4>
          
          {selectedSupplies.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <Package className="w-5 h-5 text-gray-400 flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {item.supplyName}
                  </p>
                  {item.pricingType === "included" && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">
                      <Check className="w-3 h-3 inline mr-1" />
                      {t("eventForm.step3.included")}
                    </span>
                  )}
                  {item.pricingType === "chargeable" && (
                    <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded">
                      {item.chargePerUnit} TND/{item.supplyUnit}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.supplyCategoryName} • {item.currentStock} {item.supplyUnit} {t("eventForm.step3.available")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max={item.currentStock}
                  value={item.quantityRequested}
                  onChange={(e) => {
                    const newQty = parseInt(e.target.value) || 1;
                    const maxQty = item.currentStock;
                    onUpdateQuantity(index, Math.min(Math.max(1, newQty), maxQty));
                  }}
                  className="w-20 text-center"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {item.supplyUnit}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onRemoveSupply(index)}
                className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Supply Cost Summary */}
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">
                {t("eventForm.step3.supplyCost")}:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedSupplies
                  .reduce((sum, item) => sum + (item.quantityRequested * item.costPerUnit), 0)
                  .toFixed(3)} TND
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {t("eventForm.step3.clientCharge")}:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedSupplies
                  .reduce(
                    (sum, item) =>
                      item.pricingType === "chargeable"
                        ? sum + (item.quantityRequested * item.chargePerUnit)
                        : sum,
                    0
                  )
                  .toFixed(3)} TND
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add Supply Button */}
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

      {/* Supply Browser */}
      {showSupplyBrowser && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-white dark:bg-gray-800">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 whitespace-nowrap text-sm font-medium rounded-lg transition-colors ${
                activeCategory === null
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {t("common.all")} ({supplies.length})
            </button>
            {categories.map((category) => {
              const count = supplies.filter(s => s.categoryId?._id === category._id).length;
              return (
                <button
                  key={category._id}
                  onClick={() => setActiveCategory(category._id)}
                  className={`px-4 py-2 whitespace-nowrap text-sm font-medium rounded-lg transition-colors ${
                    activeCategory === category._id
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {category.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Supply Grid */}
          {filteredSupplies.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                {t("eventForm.step3.noSuppliesAvailable")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {filteredSupplies.map((supply) => {
                const stockStatus = getStockStatus(supply);
                const isAdded = selectedSupplies.some(s => s.supply === supply._id);
                
                return (
                  <div
                    key={supply._id}
                    onClick={() => !isAdded && handleAddSupply(supply)}
                    className={`p-4 border rounded-lg transition-all ${
                      isAdded
                        ? "border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 cursor-not-allowed"
                        : "border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 cursor-pointer hover:shadow-md"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm text-gray-900 dark:text-white">
                          {supply.name}
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {supply.categoryId?.name}
                        </p>
                      </div>
                      
                      {isAdded ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {t("common.added")}
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            stockStatus.color === "red"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : stockStatus.color === "orange"
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          }`}
                        >
                          {stockStatus.label}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          {t("eventForm.step3.stock")}:
                        </span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {supply.currentStock} {supply.unit}
                        </span>
                      </div>
                      
                      {supply.currentStock <= supply.minimumStock && (
                        <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{t("eventForm.step3.lowStockWarning")}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        {supply.pricingType === "included" ? (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            ✓ {t("eventForm.step3.complimentary")}
                          </span>
                        ) : supply.pricingType === "chargeable" ? (
                          <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                            {supply.chargePerUnit.toFixed(3)} TND/{supply.unit}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {t("eventForm.step3.optional")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupplySelector;