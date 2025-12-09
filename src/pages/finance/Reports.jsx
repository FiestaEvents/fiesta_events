import { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  PieChart,
  DollarSign,
  Eye,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// ✅ API & Services
import { financeService } from "../../api/index";

// ✅ Generic Components & Utils
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Card from "../../components/common/Card";
import formatCurrency from "../../utils/formatCurrency";

// ✅ Context
import { useToast } from "../../hooks/useToast";

const FinanceReports = () => {
  const { t } = useTranslation();
  const { showSuccess, showError, apiError } = useToast();

  const [reportType, setReportType] = useState("profit-loss");
  const [period, setPeriod] = useState("month");
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Get date range based on period
  const getDateRange = (selectedPeriod) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
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
          showError(t("reports.errors.selectDates"));
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
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      const dateRange = getDateRange(period);

      if (!dateRange) {
        setIsGenerating(false);
        return;
      }

      let data = null;

      // Call appropriate API based on report type
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
      showSuccess(t("reports.success.generated"));
    } catch (error) {
      console.error("Error generating report:", error);
      apiError(error, t("reports.errors.generateFailed"));
    } finally {
      setIsGenerating(false);
    }
  };

  // CSV export logic
  const convertToCSV = (payments, t) => {
  if (!payments || payments.length === 0) return "";

  const headers = [
    t("payments.csv.type", "Type"),
    t("payments.csv.description", "Description"),
    t("payments.csv.client", "Client"),
    t("payments.csv.reference", "Reference"),
    t("payments.csv.date", "Date"),
    t("payments.csv.amount", "Amount"),
    t("payments.csv.method", "Payment Method"),
    t("payments.csv.status", "Status"),
    t("payments.csv.netAmount", "Net Amount"),
    t("payments.csv.createdAt", "Created At"),
  ];

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return "";
    const stringValue = String(value);
    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const formatDateForCSV = (date) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const getClientName = (payment) => {
    if (payment.client?.name) return payment.client.name;
    if (payment.event?.clientId?.name) return payment.event.clientId.name;
    return "";
  };

  const rows = payments.map((payment) => {
    return [
      escapeCSV(payment.type?.toUpperCase() || ""),
      escapeCSV(payment.description || ""),
      escapeCSV(getClientName(payment)),
      escapeCSV(payment.reference || ""),
      escapeCSV(formatDateForCSV(payment.paidDate || payment.createdAt)),
      escapeCSV(payment.amount?.toFixed(3) || "0.000"),
      escapeCSV(payment.method || ""),
      escapeCSV(payment.status?.toUpperCase() || ""),
      escapeCSV(payment.netAmount?.toFixed(3) || payment.amount?.toFixed(3) || "0.000"),
      escapeCSV(formatDateForCSV(payment.createdAt)),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
};

const downloadCSV = (csvContent, filename = "payments-export.csv") => {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

  // --- CSV Generators ---
  const generateProfitLossCSV = (data) => {
    const revenue = data?.revenue || 0;
    const expenses = data?.expenses || 0;
    const profitability = data?.profitability || revenue - expenses;

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
        const net = flow.net || inflow - outflow;
        csv += `${period},${inflow},${outflow},${net}\n`;
      });
    } else {
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
      const percentage =
        totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(2) : 0;
      csv += `${category},${amount},${percentage}%\n`;
    });
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
      const percentage =
        totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(2) : 0;
      csv += `${category},${amount},${percentage}%\n`;
    });
    csv += `Total,${totalIncome},100%\n`;
    return csv;
  };

  const generateTaxSummaryCSV = (data) => {
    const year = data?.year || new Date().getFullYear();
    let csv = "Tax Summary for " + year + "\n\n";
    csv += "Category,Amount\n";
    csv += `Total Income,${data?.totalIncome || 0}\n`;
    csv += `Total Expenses,${data?.totalExpense || 0}\n`;
    csv += `Taxable Income,${data?.taxableIncome || 0}\n`;
    csv += `Total Tax Paid,${data?.totalTaxPaid || 0}\n`;
    return csv;
  };

  // --- Option Arrays ---
  const reportTypeOptions = [
    { value: "profit-loss", label: t("reports.types.profitLoss.name") },
    { value: "cash-flow", label: t("reports.types.cashFlow.name") },
    {
      value: "expense-breakdown",
      label: t("reports.types.expenseBreakdown.name"),
    },
    {
      value: "revenue-analysis",
      label: t("reports.types.revenueAnalysis.name"),
    }, // Added missing translation key assumption
    { value: "tax-summary", label: t("reports.types.taxSummary.name") },
  ];

  const periodOptions = [
    { value: "week", label: t("reports.periods.week") },
    { value: "month", label: t("reports.periods.month") },
    { value: "quarter", label: t("reports.periods.quarter") },
    { value: "year", label: t("reports.periods.year") },
    { value: "last-month", label: t("reports.periods.lastMonth") },
    { value: "last-quarter", label: t("reports.periods.lastQuarter") },
    { value: "last-year", label: t("reports.periods.lastYear") },
    { value: "custom", label: t("reports.periods.custom") },
  ];

  const reportTypeDetails = [
    {
      id: "profit-loss",
      name: t("reports.types.profitLoss.name"),
      description: t("reports.types.profitLoss.description"),
      icon: TrendingUp,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      id: "cash-flow",
      name: t("reports.types.cashFlow.name"),
      description: t("reports.types.cashFlow.description"),
      icon: DollarSign,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      id: "expense-breakdown",
      name: t("reports.types.expenseBreakdown.name"),
      description: t("reports.types.expenseBreakdown.description"),
      icon: PieChart,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
    },
    {
      id: "tax-summary",
      name: t("reports.types.taxSummary.name"),
      description: t("reports.types.taxSummary.description"),
      icon: FileText,
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("reports.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t("reports.description")}
        </p>
      </div>

      {/* API Limitation Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
            {t("reports.notice.title")}
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            {t("reports.notice.description")}
          </p>
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("reports.configuration.title")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label={t("reports.configuration.reportType")}
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={reportTypeOptions}
          />

          <Select
            label={t("reports.configuration.period")}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={periodOptions}
          />

          {period === "custom" && (
            <>
              <Input
                label={t("reports.configuration.startDate")}
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
                label={t("reports.configuration.endDate")}
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
            {isGenerating
              ? t("reports.configuration.generating")
              : t("reports.configuration.generate")}
          </Button>
          {reportData && (
            <Button variant="outline" icon={Download} onClick={handleExportCSV}>
              {t("reports.configuration.export")}
            </Button>
          )}
        </div>
      </Card>

      {/* Report Preview */}
      {showPreview && reportData && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("reports.preview.title")}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(false)}
            >
              {t("reports.preview.close")}
            </Button>
          </div>

          <div className="overflow-x-auto">
            {reportType === "profit-loss" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricPreviewBox
                    label={t("reports.preview.totalRevenue")}
                    value={formatCurrency(reportData?.revenue || 0)}
                    color="green"
                  />
                  <MetricPreviewBox
                    label={t("reports.preview.totalExpenses")}
                    value={formatCurrency(reportData?.expenses || 0)}
                    color="red"
                  />
                  <MetricPreviewBox
                    label={t("reports.preview.netProfit")}
                    value={formatCurrency(
                      reportData?.profitability ||
                        (reportData?.revenue || 0) - (reportData?.expenses || 0)
                    )}
                    color="blue"
                  />
                </div>
              </div>
            )}

            {reportType === "cash-flow" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricPreviewBox
                    label={t("reports.preview.currentBalance")}
                    value={formatCurrency(reportData?.currentBalance || 0)}
                    color="green"
                  />
                </div>
                {reportData?.cashFlow && reportData.cashFlow.length > 0 && (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {t("reports.preview.period")}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          {t("reports.preview.inflow")}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          {t("reports.preview.outflow")}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          {t("reports.preview.netFlow")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {reportData.cashFlow.map((flow, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {flow.period || flow.month || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-right text-green-600">
                            {formatCurrency(flow.inflow || 0)}
                          </td>
                          <td className="px-6 py-4 text-sm text-right text-red-600">
                            {formatCurrency(flow.outflow || 0)}
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(
                              flow.net ||
                                (flow.inflow || 0) - (flow.outflow || 0)
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {(reportType === "expense-breakdown" ||
              reportType === "revenue-analysis") && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {reportType === "expense-breakdown"
                      ? t("reports.preview.totalExpenses")
                      : t("reports.preview.totalRevenue")}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      reportType === "expense-breakdown"
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t("reports.preview.category")}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        {t("reports.preview.amount")}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        {t("reports.preview.percentage")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {(reportData?.breakdown || []).map((item, index) => {
                      const total =
                        reportType === "expense-breakdown"
                          ? reportData?.totalExpenses || 1
                          : reportData?.totalIncome || 1;
                      const percentage = (
                        ((item.amount || item.total || 0) / total) *
                        100
                      ).toFixed(1);

                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
                            {(item.category || item._id || "Other").replace(
                              /_/g,
                              " "
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">
                            {formatCurrency(item.amount || item.total || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
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
                  <MetricPreviewBox
                    label={t("reports.preview.totalRevenue")}
                    value={formatCurrency(reportData?.totalIncome || 0)}
                    color="green"
                  />
                  <MetricPreviewBox
                    label={t("reports.preview.totalExpenses")}
                    value={formatCurrency(reportData?.totalExpense || 0)}
                    color="red"
                  />
                  <MetricPreviewBox
                    label={t("reports.preview.taxableIncome")}
                    value={formatCurrency(reportData?.taxableIncome || 0)}
                    color="blue"
                  />
                  <MetricPreviewBox
                    label={t("reports.preview.totalTaxPaid")}
                    value={formatCurrency(reportData?.totalTaxPaid || 0)}
                    color="yellow"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Report Types Grid */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("reports.types.available")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypeDetails.map((type) => {
            const Icon = type.icon;
            const isSelected = reportType === type.id;

            return (
              <div
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-lg border rounded-lg ${
                  isSelected
                    ? "ring-2 ring-blue-500 border-blue-300 dark:border-blue-600"
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
      </Card>

      {/* Quick Reports */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("reports.quickReports.title")}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {t("reports.quickReports.description")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickReportButton
            icon={Calendar}
            text={t("reports.quickReports.monthlyPL")}
            onClick={() => {
              setReportType("profit-loss");
              setPeriod("month");
              handleGenerateReport();
            }}
          />
          <QuickReportButton
            icon={DollarSign}
            text={t("reports.quickReports.quarterlyCashFlow")}
            onClick={() => {
              setReportType("cash-flow");
              setPeriod("quarter");
              handleGenerateReport();
            }}
          />
          <QuickReportButton
            icon={PieChart}
            text={t("reports.quickReports.annualExpenses")}
            onClick={() => {
              setReportType("expense-breakdown");
              setPeriod("year");
              handleGenerateReport();
            }}
          />
          <QuickReportButton
            icon={FileText}
            text={t("reports.quickReports.taxSummary")}
            onClick={() => {
              setReportType("tax-summary");
              setPeriod("year");
              handleGenerateReport();
            }}
          />
        </div>
      </Card>
    </div>
  );
};

// --- Sub-components ---

const MetricPreviewBox = ({ label, value, color }) => {
  const colors = {
    green:
      "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    yellow:
      "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
  };

  return (
    <div
      className={`p-4 rounded-lg ${colors[color].split(" ")[0]} ${colors[color].split(" ")[1]}`}
    >
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p
        className={`text-2xl font-bold ${colors[color].split(" ").slice(2).join(" ")}`}
      >
        {value}
      </p>
    </div>
  );
};

const QuickReportButton = ({ icon: Icon, text, onClick }) => (
  <Button
    variant="outline"
    onClick={onClick}
    className="h-auto py-4 flex-col gap-2"
  >
    <Icon className="w-5 h-5" />
    <span>{text}</span>
  </Button>
);

export default FinanceReports;
