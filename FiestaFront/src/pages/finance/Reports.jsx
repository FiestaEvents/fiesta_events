import { useState } from 'react';
import { financeService } from '../../api/index';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';

import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  PieChart,
  BarChart3,
  DollarSign,
  Printer,
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

  const handleGenerateReport = async (format = 'pdf') => {
    try {
      setIsGenerating(true);

      const params = {
        type: reportType,
        period: period === 'custom' ? undefined : period,
        startDate: period === 'custom' ? customRange.startDate : undefined,
        endDate: period === 'custom' ? customRange.endDate : undefined,
      };

      const blob = await financeService.generateReport(params, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const reportTypes = [
    {
      id: 'profit-loss',
      name: 'Profit & Loss Statement',
      description: 'Revenue, expenses, and net profit overview',
      icon: TrendingUp,
      color: 'blue',
    },
    {
      id: 'balance-sheet',
      name: 'Balance Sheet',
      description: 'Assets, liabilities, and equity summary',
      icon: BarChart3,
      color: 'green',
    },
    {
      id: 'cash-flow',
      name: 'Cash Flow Statement',
      description: 'Cash inflows and outflows analysis',
      icon: DollarSign,
      color: 'purple',
    },
    {
      id: 'expense-breakdown',
      name: 'Expense Breakdown',
      description: 'Detailed categorization of all expenses',
      icon: PieChart,
      color: 'red',
    },
    {
      id: 'revenue-analysis',
      name: 'Revenue Analysis',
      description: 'Income sources and trends',
      icon: TrendingUp,
      color: 'green',
    },
    {
      id: 'tax-summary',
      name: 'Tax Summary',
      description: 'Tax obligations and deductions',
      icon: FileText,
      color: 'yellow',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-gray-600 mt-1">
          Generate comprehensive financial reports for your business
        </p>
      </div>

      {/* Report Configuration */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                />
              </>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button
              variant="primary"
              icon={Download}
              onClick={() => handleGenerateReport('pdf')}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate PDF'}
            </Button>
            <Button
              variant="outline"
              icon={Download}
              onClick={() => handleGenerateReport('xlsx')}
              disabled={isGenerating}
            >
              Export to Excel
            </Button>
            <Button
              variant="outline"
              icon={Download}
              onClick={() => handleGenerateReport('csv')}
              disabled={isGenerating}
            >
              Export to CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Types Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setReportType(type.id)}
              >
                <div className="p-6">
                  <div className={`p-3 bg-${type.color}-50 rounded-lg w-fit mb-4`}>
                    <Icon className={`w-6 h-6 text-${type.color}-600`} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {type.name}
                  </h4>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Report Features */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Report Features
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Included in Reports:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">
                    Detailed financial breakdown by category
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">
                    Visual charts and graphs
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">
                    Period-over-period comparison
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">
                    Key performance indicators
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Export Options:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">
                    PDF - Professional print-ready format
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">
                    Excel - Editable spreadsheet with formulas
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">
                    CSV - Raw data for further analysis
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Reports */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Reports
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Generate commonly used reports with one click
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setReportType('profit-loss');
                setPeriod('month');
                handleGenerateReport('pdf');
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
                handleGenerateReport('pdf');
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
                handleGenerateReport('pdf');
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
                handleGenerateReport('pdf');
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