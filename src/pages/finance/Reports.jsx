import { useState } from "react";
import { financeService } from "../../api/index";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  PieChart,
  BarChart3,
  DollarSign,
  Eye,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

const FinanceReports = () => {
  const [reportType, setReportType] = useState("profit-loss");
  const [period, setPeriod] = useState("month");
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // FIXED: Get date range based on period
  const getDateRange = (period) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case "last-month":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
        endDate.setDate(0); // Last day of previous month
        break;
      case "last-quarter":
        startDate.setMonth(endDate.getMonth() - 6);
        endDate.setMonth(endDate.getMonth() - 3);
        break;
      case "last-year":
        startDate = new Date(endDate.getFullYear() - 1, 0, 1);
        endDate.setFullYear(endDate.getFullYear() - 1);
        endDate.setMonth(11);
        endDate.setDate(31);
        break;
      case "custom":
        if (!customRange.startDate || !customRange.endDate) {
          toast.error("Please select both start and end dates for custom range");
          return null;
        }
        return {
          startDate: customRange.startDate,
          endDate: customRange.endDate,
        };
      default:
        startDate.setMonth(endDate.getMonth() - 1);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  // FIXED: Generate report using only available API methods
  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      const dateRange = getDateRange(period);
      
      if (!dateRange) {
        setIsGenerating(false);
        return;
      }

      let data = null;

      // Call appropriate API based on report type - ONLY AVAILABLE ENDPOINTS
      switch (reportType) {
        case "profit-loss":
          data = await financeService.getProfitLoss(dateRange);
          break;
        case "cash-flow":
          data = await financeService.getCashflow(dateRange);
          break;
        case "expense-breakdown":
          data = await financeService.getExpensesBreakdown(dateRange);
          break;
        case "revenue-analysis":
          data = await financeService.getIncomeBreakdown(dateRange);
          break;
        case "tax-summary":
          data = await financeService.getTaxSummary(dateRange);
          break;
        default:
          throw new Error("Invalid report type");
      }

      setReportData(data);
      setShowPreview(true);
      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(error.response?.data?.error || error.message || "Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  // FIXED: Client-side CSV export for available reports only
  const handleExportCSV = () => {
    if (!reportData) {
      toast.error("Please generate a report first");
      return;
    }

    try {
      let csvContent = "";
      const timestamp = new Date().toISOString().split("T")[0];

      // Generate CSV based on report type - ONLY AVAILABLE ENDPOINTS
      switch (reportType) {
        case "profit-loss":
          csvContent = generateProfitLossCSV(reportData);
          break;
        case "cash-flow":
          csvContent = generateCashFlowCSV(reportData);
          break;
        case "expense-breakdown":
          csvContent = generateExpenseBreakdownCSV(reportData);
          break;
        case "revenue-analysis":
          csvContent = generateRevenueAnalysisCSV(reportData);
          break;
        case "tax-summary":
          csvContent = generateTaxSummaryCSV(reportData);
          break;
        default:
          throw new Error("Invalid report type");
      }

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}-report-${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV");
    }
  };

  // CSV generation helpers for available endpoints
  const generateProfitLossCSV = (data) => {
    // Handle different response formats from getProfitLoss
    const revenue = data?.revenue || 0;
    const expenses = data?.expenses || 0;
    const profitability = data?.profitability || (revenue - expenses);
    
    let csv = "Category,Amount\n";
    csv += `Total Revenue,${revenue}\n`;
    csv += `Total Expenses,${expenses}\n`;
    csv += `Net Profit,${profitability}\n`;
    
    return csv;
  };

  const generateCashFlowCSV = (data) => {
    const cashFlow = data?.cashFlow || [];
    const currentBalance = data?.currentBalance || 0;
    
    let csv = "Period,Inflow,Outflow,Net Cash Flow\n";
    
    if (cashFlow.length > 0) {
      cashFlow.forEach((flow) => {
        const period = flow.period || flow.month || "N/A";
        const inflow = flow.inflow || 0;
        const outflow = flow.outflow || 0;
        const net = flow.net || (inflow - outflow);
        csv += `${period},${inflow},${outflow},${net}\n`;
      });
    } else {
      // Fallback if no time series data
      csv += `Current Balance,,,${currentBalance}\n`;
    }
    
    return csv;
  };

  const generateExpenseBreakdownCSV = (data) => {
    const breakdown = data?.breakdown || [];
    const totalExpenses = data?.totalExpenses || 0;
    
    let csv = "Category,Amount,Percentage\n";
    
    breakdown.forEach((item) => {
      const category = item.category || item._id || "Other";
      const amount = item.amount || item.total || 0;
      const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(2) : 0;
      csv += `${category},${amount},${percentage}%\n`;
    });
    
    // Add total row
    csv += `Total,${totalExpenses},100%\n`;
    
    return csv;
  };

  const generateRevenueAnalysisCSV = (data) => {
    const breakdown = data?.breakdown || [];
    const totalIncome = data?.totalIncome || 0;
    
    let csv = "Category,Amount,Percentage\n";
    
    breakdown.forEach((item) => {
      const category = item.category || item._id || "Other";
      const amount = item.amount || item.total || 0;
      const percentage = totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(2) : 0;
      csv += `${category},${amount},${percentage}%\n`;
    });
    
    // Add total row
    csv += `Total,${totalIncome},100%\n`;
    
    return csv;
  };

  const generateTaxSummaryCSV = (data) => {
    const year = data?.year || new Date().getFullYear();
    const totalIncome = data?.totalIncome || 0;
    const totalExpense = data?.totalExpense || 0;
    const taxableIncome = data?.taxableIncome || 0;
    const totalTaxPaid = data?.totalTaxPaid || 0;
    
    let csv = "Tax Summary for " + year + "\n\n";
    csv += "Category,Amount\n";
    csv += `Total Income,${totalIncome}\n`;
    csv += `Total Expenses,${totalExpense}\n`;
    csv += `Taxable Income,${taxableIncome}\n`;
    csv += `Total Tax Paid,${totalTaxPaid}\n`;
    
    return csv;
  };

  const generateSummaryCSV = (data) => {
    const summary = data?.summary || data || {};
    const categoryBreakdown = data?.categoryBreakdown || [];
    const timeSeries = data?.timeSeries || [];
    
    let csv = "Financial Summary\n\n";
    
    // Summary section
    csv += "Overview\n";
    csv += "Metric,Value\n";
    csv += `Total Income,${summary.totalIncome || summary.income || 0}\n`;
    csv += `Total Expenses,${summary.totalExpenses || summary.expenses || 0}\n`;
    csv += `Net Profit,${summary.netProfit || (summary.totalIncome || 0) - (summary.totalExpenses || 0)}\n`;
    csv += `Transaction Count,${summary.totalTransactions || summary.transactions || 0}\n\n`;
    
    // Category breakdown if available
    if (categoryBreakdown.length > 0) {
      csv += "Category Breakdown\n";
      csv += "Category,Amount\n";
      categoryBreakdown.forEach((item) => {
        const category = item.category || item._id || "Other";
        const amount = item.amount || item.total || 0;
        csv += `${category},${amount}\n`;
      });
      csv += "\n";
    }
    
    return csv;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("tn-TN", {
      style: "currency",
      currency: "TND",
    }).format(amount || 0);
  };

  // FIXED: Only include report types that have API endpoints
  const reportTypes = [
    {
      id: "profit-loss",
      name: "Profit & Loss Statement",
      description: "Revenue, expenses, and net profit overview",
      icon: TrendingUp,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      id: "cash-flow",
      name: "Cash Flow Statement",
      description: "Cash inflows and outflows analysis",
      icon: DollarSign,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      id: "expense-breakdown",
      name: "Expense Breakdown",
      description: "Detailed categorization of all expenses",
      icon: PieChart,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
    },
    {
      id: "revenue-analysis",
      name: "Revenue Analysis",
      description: "Income sources and trends",
      icon: TrendingUp,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      id: "tax-summary",
      name: "Tax Summary",
      description: "Tax obligations and deductions",
      icon: FileText,
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Financial Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Generate comprehensive financial reports for your business
        </p>
      </div>

      {/* API Limitation Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Report Generation
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Reports are generated from your financial data and can be
              previewed on-screen or exported as CSV. All reports use actual API endpoints.
            </p>
          </div>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Configure Report
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>

            <Select
              label="Period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="last-month">Last Month</option>
              <option value="last-quarter">Last Quarter</option>
              <option value="last-year">Last Year</option>
              <option value="custom">Custom Range</option>
            </Select>

            {period === "custom" && (
              <>
                <Input
                  label="Start Date"
                  type="date"
                  value={customRange.startDate}
                  onChange={(e) =>
                    setCustomRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />

                <Input
                  label="End Date"
                  type="date"
                  value={customRange.endDate}
                  onChange={(e) =>
                    setCustomRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  min={customRange.startDate}
                />
              </>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button
              variant="primary"
              icon={Eye}
              onClick={handleGenerateReport}
              loading={isGenerating}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Report"}
            </Button>
            {reportData && (
              <Button
                variant="outline"
                icon={Download}
                onClick={handleExportCSV}
              >
                Export to CSV
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Report Preview */}
      {showPreview && reportData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Report Preview
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                Close
              </Button>
            </div>

            <div className="overflow-x-auto">
              {reportType === "profit-loss" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(reportData?.revenue || 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Total Expenses
                      </p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(reportData?.expenses || 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Net Profit
                      </p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(reportData?.profitability || (reportData?.revenue || 0) - (reportData?.expenses || 0))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {reportType === "cash-flow" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Current Balance
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(reportData?.currentBalance || 0)}
                      </p>
                    </div>
                  </div>
                  {reportData?.cashFlow && reportData.cashFlow.length > 0 && (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Period
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Inflow
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Outflow
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Net Flow
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {reportData.cashFlow.map((flow, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {flow.period || flow.month || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400">
                              {formatCurrency(flow.inflow || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">
                              {formatCurrency(flow.outflow || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(flow.net || (flow.inflow || 0) - (flow.outflow || 0))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {(reportType === "expense-breakdown" || reportType === "revenue-analysis") && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Total {reportType === "expense-breakdown" ? "Expenses" : "Income"}
                    </p>
                    <p className={`text-2xl font-bold ${
                      reportType === "expense-breakdown" 
                        ? "text-red-600 dark:text-red-400" 
                        : "text-green-600 dark:text-green-400"
                    }`}>
                      {formatCurrency(
                        reportType === "expense-breakdown" 
                          ? reportData?.totalExpenses || 0
                          : reportData?.totalIncome || 0
                      )}
                    </p>
                  </div>
                  
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Category
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {(reportData?.breakdown || []).map((item, index) => {
                        const total = reportType === "expense-breakdown" 
                          ? reportData?.totalExpenses || 1
                          : reportData?.totalIncome || 1;
                        const percentage = ((item.amount || item.total || 0) / total * 100).toFixed(1);
                        
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
                              {(item.category || item._id || "Other").replace(/_/g, " ")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(item.amount || item.total || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                              {percentage}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {reportType === "tax-summary" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Total Income
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(reportData?.totalIncome || 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Total Expenses
                      </p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(reportData?.totalExpense || 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Taxable Income
                      </p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(reportData?.taxableIncome || 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Total Tax Paid
                      </p>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {formatCurrency(reportData?.totalTaxPaid || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {reportType === "summary" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Total Income
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(reportData?.summary?.totalIncome || reportData?.totalIncome || 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Total Expenses
                      </p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(reportData?.summary?.totalExpenses || reportData?.totalExpenses || 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Net Profit
                      </p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(
                          reportData?.summary?.netProfit || 
                          (reportData?.summary?.totalIncome || reportData?.totalIncome || 0)
                          (reportData?.summary?.totalExpenses || reportData?.totalExpenses || 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        {/* Report Types Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Available Reports
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = reportType === type.id;

              return (
                <div
                  key={type.id}
                  className={`cursor-pointer transition-all hover:shadow-lg border rounded-lg ${
                    isSelected 
                      ? "ring-2 ring-blue-500 dark:ring-blue-400 border-blue-300 dark:border-blue-600" 
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                  onClick={() => setReportType(type.id)}
                >
                  <div className="p-6">
                    <div className={`p-3 ${type.bgColor} rounded-lg w-fit mb-4`}>
                      <Icon className={`w-6 h-6 ${type.iconColor}`} />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {type.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {type.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Reports
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Generate commonly used reports with one click
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setReportType("profit-loss");
                setPeriod("month");
                handleGenerateReport();
              }}
              className="h-auto py-4 flex-col gap-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Monthly P&L</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setReportType("cash-flow");
                setPeriod("quarter");
                handleGenerateReport();
              }}
              className="h-auto py-4 flex-col gap-2"
            >
              <DollarSign className="w-5 h-5" />
              <span>Quarterly Cash Flow</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setReportType("expense-breakdown");
                setPeriod("year");
                handleGenerateReport();
              }}
              className="h-auto py-4 flex-col gap-2"
            >
              <PieChart className="w-5 h-5" />
              <span>Annual Expenses</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setReportType("tax-summary");
                setPeriod("year");
                handleGenerateReport();
              }}
              className="h-auto py-4 flex-col gap-2"
            >
              <FileText className="w-5 h-5" />
              <span>Tax Summary</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceReports;