import { useState } from 'react';
import { financeService } from '../../api/index';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Reports = () => {
  const [reportType, setReportType] = useState('profit-loss');
  const [period, setPeriod] = useState('month');
  const [customRange, setCustomRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // FIXED: Get date range based on period
  const getDateRange = (period) => {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        now.setDate(0); // Last day of previous month
        break;
      case 'last-quarter':
        startDate.setMonth(now.getMonth() - 6);
        now.setMonth(now.getMonth() - 3);
        break;
      case 'last-year':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        now.setFullYear(now.getFullYear() - 1);
        now.setMonth(11);
        now.setDate(31);
        break;
      case 'custom':
        return {
          startDate: customRange.startDate,
          endDate: customRange.endDate,
        };
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };
  };

  // FIXED: Generate report using actual API methods
  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      const dateRange = getDateRange(period);

      let data = null;

      // Call appropriate API based on report type
      switch (reportType) {
        case 'profit-loss':
          data = await financeService.getProfitLoss();
          break;
        case 'cash-flow':
          data = await financeService.getCashflow();
          break;
        case 'expense-breakdown':
          data = await financeService.getExpensesBreakdown();
          break;
        case 'revenue-analysis':
          data = await financeService.getIncomeBreakdown();
          break;
        case 'tax-summary':
          data = await financeService.getTaxSummary();
          break;
        case 'summary':
          data = await financeService.getSummary(dateRange);
          break;
        default:
          throw new Error('Invalid report type');
      }

      setReportData(data);
      setShowPreview(true);
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(error.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  // FIXED: Client-side CSV export
  const handleExportCSV = () => {
    if (!reportData) {
      toast.error('Please generate a report first');
      return;
    }

    try {
      let csvContent = '';
      const timestamp = new Date().toISOString().split('T')[0];

      // Generate CSV based on report type
      switch (reportType) {
        case 'profit-loss':
          csvContent = generateProfitLossCSV(reportData);
          break;
        case 'cash-flow':
          csvContent = generateCashFlowCSV(reportData);
          break;
        case 'expense-breakdown':
          csvContent = generateExpenseBreakdownCSV(reportData);
          break;
        case 'revenue-analysis':
          csvContent = generateRevenueAnalysisCSV(reportData);
          break;
        case 'tax-summary':
          csvContent = generateTaxSummaryCSV(reportData);
          break;
        case 'summary':
          csvContent = generateSummaryCSV(reportData);
          break;
        default:
          throw new Error('Invalid report type');
      }

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  // CSV generation helpers
  const generateProfitLossCSV = (data) => {
    const rows = data?.profitLoss || data || [];
    let csv = 'Period,Income,Expenses,Net Profit\n';
    rows.forEach(row => {
      const period = row.period || row.month || 'N/A';
      const income = row.income || 0;
      const expenses = row.expenses || 0;
      const profit = income - expenses;
      csv += `${period},${income},${expenses},${profit}\n`;
    });
    return csv;
  };

  const generateCashFlowCSV = (data) => {
    const cashflow = data?.cashflow || data || {};
    let csv = 'Category,Amount\n';
    csv += `Total Inflow,${cashflow.totalInflow || 0}\n`;
    csv += `Total Outflow,${cashflow.totalOutflow || 0}\n`;
    csv += `Net Cash Flow,${cashflow.netCashFlow || 0}\n`;
    return csv;
  };

  const generateExpenseBreakdownCSV = (data) => {
    const expenses = data?.expenses || data || [];
    let csv = 'Category,Total Amount\n';
    expenses.forEach(exp => {
      const category = (exp.category || exp._id || 'Other').replace(/,/g, ' ');
      csv += `${category},${exp.total || 0}\n`;
    });
    return csv;
  };

  const generateRevenueAnalysisCSV = (data) => {
    const income = data?.income || data || [];
    let csv = 'Category,Total Amount\n';
    income.forEach(inc => {
      const category = (inc.category || inc._id || 'Other').replace(/,/g, ' ');
      csv += `${category},${inc.total || 0}\n`;
    });
    return csv;
  };

  const generateTaxSummaryCSV = (data) => {
    const taxData = data?.taxSummary || data || {};
    let csv = 'Category,Amount\n';
    csv += `Total Revenue,${taxData.totalRevenue || 0}\n`;
    csv += `Total Deductions,${taxData.totalDeductions || 0}\n`;
    csv += `Taxable Income,${taxData.taxableIncome || 0}\n`;
    csv += `Estimated Tax,${taxData.estimatedTax || 0}\n`;
    return csv;
  };

  const generateSummaryCSV = (data) => {
    const summary = data?.summary || data || {};
    let csv = 'Metric,Value\n';
    csv += `Total Income,${summary.totalIncome || 0}\n`;
    csv += `Total Expenses,${summary.totalExpenses || 0}\n`;
    csv += `Net Profit,${(summary.totalIncome || 0) - (summary.totalExpenses || 0)}\n`;
    csv += `Transaction Count,${summary.totalTransactions || 0}\n`;
    csv += `Average Transaction,${summary.avgTransaction || 0}\n`;
    return csv;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  // FIXED: Report types that map to actual API methods
  const reportTypes = [
    {
      id: 'profit-loss',
      name: 'Profit & Loss Statement',
      description: 'Revenue, expenses, and net profit overview',
      icon: TrendingUp,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'cash-flow',
      name: 'Cash Flow Statement',
      description: 'Cash inflows and outflows analysis',
      icon: DollarSign,
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'expense-breakdown',
      name: 'Expense Breakdown',
      description: 'Detailed categorization of all expenses',
      icon: PieChart,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      id: 'revenue-analysis',
      name: 'Revenue Analysis',
      description: 'Income sources and trends',
      icon: TrendingUp,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      id: 'tax-summary',
      name: 'Tax Summary',
      description: 'Tax obligations and deductions',
      icon: FileText,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      id: 'summary',
      name: 'Financial Summary',
      description: 'Overall financial overview',
      icon: BarChart3,
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Generate comprehensive financial reports for your business
        </p>
      </div>

      {/* API Limitation Notice */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Report Generation
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Reports are generated from your financial data and can be previewed on-screen or exported as CSV. 
              PDF and Excel formats require backend support and are not currently available.
            </p>
          </div>
        </div>
      </Card>

      {/* Report Configuration */}
      <Card>
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

            {period === 'custom' && (
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
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
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
      </Card>

      {/* Report Preview */}
      {showPreview && reportData && (
        <Card>
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
              {reportType === 'profit-loss' && (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Period</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Income</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Expenses</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {(reportData?.profitLoss || reportData || []).map((row, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.period || row.month || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400">
                          {formatCurrency(row.income || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">
                          {formatCurrency(row.expenses || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">
                          {formatCurrency((row.income || 0) - (row.expenses || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {reportType === 'cash-flow' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Inflow</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(reportData?.cashflow?.totalInflow || reportData?.totalInflow || 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Outflow</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(reportData?.cashflow?.totalOutflow || reportData?.totalOutflow || 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Cash Flow</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(reportData?.cashflow?.netCashFlow || reportData?.netCashFlow || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(reportType === 'expense-breakdown' || reportType === 'revenue-analysis') && (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {(reportData?.expenses || reportData?.income || reportData || []).map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
                          {(item.category || item._id || 'Other').replace(/_/g, ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(item.total || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Report Types Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Available Reports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = reportType === type.id;

            return (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Reports */}
      <Card>
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
                setReportType('profit-loss');
                setPeriod('month');
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
                setReportType('cash-flow');
                setPeriod('quarter');
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
                setReportType('expense-breakdown');
                setPeriod('year');
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
                setReportType('tax-summary');
                setPeriod('year');
                handleGenerateReport();
              }}
              className="h-auto py-4 flex-col gap-2"
            >
              <FileText className="w-5 h-5" />
              <span>Tax Summary</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;