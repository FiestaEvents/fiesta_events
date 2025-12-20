import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Package, Download, Box } from "lucide-react";

// API
import { supplyService } from "../../../api/index";

// Components
import Button from "../../../components/common/Button";
import TableComponent from "../../../components/common/NewTable";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

// Utils
import { generateEventSupplyPDF } from "../../../utils/pdfGenerator";
import { useToast } from "../../../hooks/useToast";

const EventSuppliesTab = ({ event }) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();

  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (event?._id) {
      fetchSupplies();
    }
  }, [event]);

  const fetchSupplies = async () => {
    try {
      setLoading(true);
      // Assuming the backend supports filtering by event ID
      // You might need to adjust this based on your actual API implementation
      // e.g. supplyService.getByEvent(event._id)
      const response = await supplyService.getAll({ event: event._id, limit: 100 });
      
      const data = response.supplies || response.data?.supplies || response.data || [];
      setSupplies(data);
    } catch (error) {
      console.error("Failed to fetch supplies:", error);
      // showError(t("eventDetail.errors.loadSupplies"));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      if (supplies.length === 0) {
        showError(t("eventDetail.supplies.noDataToExport", "No supplies to export"));
        return;
      }
      generateEventSupplyPDF(event, supplies);
      showSuccess(t("eventDetail.notifications.pdfGenerated"));
    } catch (error) {
      console.error(error);
      showError(t("eventDetail.errors.pdfGeneration"));
    }
  };

  const columns = [
    { 
      header: t("supplies.table.name"), 
      accessor: "name",
      render: (row) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.name}
        </div>
      )
    },
    { 
      header: t("supplies.table.category"), 
      accessor: "category",
      render: (row) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {row.categoryId?.name || "Uncategorized"}
        </span>
      )
    },
    { 
      header: t("supplies.table.stock"), 
      accessor: "quantity",
      render: (row) => (
         <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
            {row.quantity || row.currentStock || 1} {row.unit}
         </span>
      )
    },
    { 
      header: t("supplies.table.value"), 
      accessor: "cost",
      render: (row) => (
          <span className="font-medium text-gray-900 dark:text-white">
              {((row.quantity || 1) * (row.costPerUnit || 0)).toFixed(3)} TND
          </span>
      )
    },
  ];

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (supplies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-4">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          {t("eventDetail.supplies.emptyTitle", "No Supplies Allocated")}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">
          {t("eventDetail.supplies.emptyDesc", "Supplies allocated to this event via logistics or tasks will appear here.")}
        </p>
        <Button 
            variant="outline" 
            onClick={() => window.location.href = '/supplies'} // Or use navigate from parent
        >
            {t("eventDetail.supplies.manageInventory", "Go to Inventory")}
        </Button>
      </div>
    );
  }

  const totalCost = supplies.reduce((acc, item) => acc + ((item.quantity||1) * (item.costPerUnit||0)), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           <Box className="w-5 h-5 text-orange-500" />
           <h3 className="text-lg font-bold text-gray-900 dark:text-white">
             {t("eventDetail.supplies.listTitle", "Event Supplies")}
             <span className="ml-2 text-sm font-normal text-gray-500">({supplies.length})</span>
           </h3>
        </div>
        <Button 
          variant="outline" 
          icon={Download} 
          onClick={handleExport}
        >
          {t("common.exportPDF")}
        </Button>
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
        <TableComponent 
          columns={columns} 
          data={supplies} 
          striped 
          hoverable 
          pagination={false}
        />
      </div>

      {/* Footer Summary */}
      <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 p-4 rounded-lg flex justify-between items-center">
        <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
          {t("eventDetail.supplies.totalEstimatedCost", "Total Estimated Cost")}
        </span>
        <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
          {totalCost.toFixed(3)} TND
        </span>
      </div>
    </div>
  );
};

export default EventSuppliesTab;