import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiList } from '../../hooks/useApi';
import { financeService } from '../../api/index';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import {
  Plus,
  Search,
  Filter,
  Wallet,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Transactions = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  const {
    data: transactions,
    pagination,
    isLoading,
    refetch,
  } = useApiList(financeService.getAll, {
    search: searchQuery,
    ...filters,
  });

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      category: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
    });
    setSearchQuery('');
  };

  const handleDelete = async () => {
    try {
      await financeService.delete(deleteModal.id);
      toast.success('Transaction deleted successfully');
      setDeleteModal({ show: false, id: null });
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete transaction');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await financeService.export('csv', filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Transactions exported successfully');
    } catch (error) {
      toast.error('Failed to export transactions');
    }
  };

  const getTypeColor = (type) => {
    return type === 'income' ? 'green' : 'red';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      cell: (transaction) => (
        <div className="text-sm text-gray-900">
          {formatDate(transaction.date)}
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      cell: (transaction) => (
        <div>
          <div className="font-medium text-gray-900">
            {transaction.description}
          </div>
          <div className="text-sm text-gray-500 capitalize">
            {transaction.category.replace('_', ' ')}
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (transaction) => (
        <Badge color={getTypeColor(transaction.type)}>
          {transaction.type === 'income' ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span className="ml-1 capitalize">{transaction.type}</span>
        </Badge>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (transaction) => (
        <div
          className={`font-semibold ${
            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {transaction.type === 'income' ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </div>
      ),
    },
    {
      header: 'Payment Method',
      accessor: 'paymentMethod',
      cell: (transaction) => (
        <span className="text-sm text-gray-600 capitalize">
          {transaction.paymentMethod.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Reference',
      accessor: 'reference',
      cell: (transaction) => (
        <span className="text-sm text-gray-500">
          {transaction.reference || '-'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (transaction) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            onClick={() => navigate(`/finance/transactions/${transaction._id}`)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Edit}
            onClick={() => navigate(`/finance/transactions/${transaction._id}/edit`)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => setDeleteModal({ show: true, id: transaction._id })}
          />
        </div>
      ),
    },
  ];

  // Calculate statistics
  const stats = transactions
    ? [
        {
          label: 'Total Income',
          value: formatCurrency(
            transactions
              .filter((t) => t.type === 'income')
              .reduce((sum, t) => sum + t.amount, 0)
          ),
          icon: TrendingUp,
          color: 'green',
        },
        {
          label: 'Total Expenses',
          value: formatCurrency(
            transactions
              .filter((t) => t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0)
          ),
          icon: TrendingDown,
          color: 'red',
        },
        {
          label: 'Net Amount',
          value: formatCurrency(
            transactions.reduce((sum, t) => {
              return t.type === 'income' ? sum + t.amount : sum - t.amount;
            }, 0)
          ),
          icon: DollarSign,
          color: 'blue',
        },
        {
          label: 'Total Transactions',
          value: transactions.length,
          icon: Wallet,
          color: 'purple',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">
            View and manage all financial transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Download} onClick={handleExport}>
            Export
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/finance/transactions/new')}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 bg-${stat.color}-50 rounded-lg`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Inputes 
                icon={Search}
                placeholder="Search by description, category, or reference..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Type"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </Select>

              <Select
                label="Category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="event_revenue">Event Revenue</option>
                <option value="partner_payment">Partner Payment</option>
                <option value="utilities">Utilities</option>
                <option value="maintenance">Maintenance</option>
                <option value="marketing">Marketing</option>
                <option value="staff_salary">Staff Salary</option>
                <option value="equipment">Equipment</option>
                <option value="insurance">Insurance</option>
                <option value="taxes">Taxes</option>
                <option value="other">Other</option>
              </Select>

              <div className="space-y-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange('startDate', e.target.value)
                  }
                />
              </div>

              <Input
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />

              <Input
                label="Min Amount"
                type="number"
                value={filters.minAmount}
                onChange={(e) =>
                  handleFilterChange('minAmount', e.target.value)
                }
                placeholder="0.00"
              />

              <Input
                label="Max Amount"
                type="number"
                value={filters.maxAmount}
                onChange={(e) =>
                  handleFilterChange('maxAmount', e.target.value)
                }
                placeholder="0.00"
              />

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : transactions && transactions.length > 0 ? (
            <>
              <Table columns={columns} data={transactions} />
              <div className="p-6 border-t">
                <Pagination
                  currentPage={pagination?.page || 1}
                  totalPages={pagination?.pages || 1}
                  onPageChange={(page) => refetch({ page })}
                />
              </div>
            </>
          ) : (
            <EmptyState
              icon={Wallet}
              title="No transactions found"
              description="Get started by adding your first transaction"
              action={{
                label: 'Add Transaction',
                onClick: () => navigate('/finance/transactions/new'),
              }}
            />
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default Transactions;