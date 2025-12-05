import React, { useCallback, useEffect, useState, useMemo } from "react";
// ... (imports remain the same)
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Download,
  Edit,
  Eye,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Filter,
  X,
  FolderOpen,
} from "lucide-react";
import OrbitLoader from "../../components/common/LoadingSpinner";
// ✅ Generic Components
import { StatusBadge } from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Select from "../../components/common/Select";

// ✅ Services & Utils
import { invoiceService } from "../../api/index";
import { useToast } from "../../context/ToastContext";
import formatCurrency from "../../utils/formatCurrency";

const InvoicesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError, showInfo, promise } = useToast();
  const { t } = useTranslation();

  // State
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [invoiceType, setInvoiceType] = useState("client");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    startDate: "",
    endDate: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState("all");
  const [localStartDate, setLocalStartDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    invoiceId: null,
    invoiceName: "",
    onConfirm: null,
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  useEffect(() => {
    if (isFilterOpen) {
      setLocalStatus(filters.status);
      setLocalStartDate(filters.startDate);
      setLocalEndDate(filters.endDate);
    }
  }, [isFilterOpen, filters]);

  const handleApplyFilters = () => {
    setFilters({
      status: localStatus,
      startDate: localStartDate,
      endDate: localEndDate,
    });
    setPage(1);
    setIsFilterOpen(false);
    showSuccess(t("invoices.filters.applied") || "Filters applied");
  };

  const handleResetLocalFilters = () => {
    setLocalStatus("all");
    setLocalStartDate("");
    setLocalEndDate("");
  };

  const handleClearAllFilters = () => {
    setFilters({ status: "all", startDate: "", endDate: "" });
    setSearchTerm("");
    setPage(1);
    showInfo(t("invoices.filters.clear"));
  };

  const normalizeInvoiceData = (invoice) => {
    if (!invoice || typeof invoice !== "object") return null;
    let recipientName = "",
      recipientEmail = "",
      recipientCompany = "";
    if (invoice.invoiceType === "client") {
      recipientName =
        invoice.client?.name ||
        invoice.recipientName ||
        t("invoices.recipient.client");
      recipientEmail = invoice.client?.email || invoice.recipientEmail;
      recipientCompany = invoice.client?.company || invoice.recipientCompany;
    } else {
      recipientName =
        invoice.partner?.name ||
        invoice.recipientName ||
        t("invoices.recipient.partner");
      recipientEmail = invoice.partner?.email || invoice.recipientEmail;
      recipientCompany = invoice.partner?.company || invoice.recipientCompany;
    }
    return {
      ...invoice,
      _id: invoice._id || invoice.id,
      invoiceNumber:
        invoice.invoiceNumber || `INV-${(invoice._id || "").substring(0, 8)}`,
      recipientName,
      recipientEmail,
      recipientCompany,
      totalAmount: invoice.totalAmount || 0,
      status: invoice.status || "draft",
      issueDate: invoice.issueDate || new Date().toISOString(),
      dueDate: invoice.dueDate || new Date().toISOString(),
      items: invoice.items || [],
    };
  };

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await invoiceService.getStats({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        invoiceType: invoiceType,
      });
      const data = response?.stats || response?.data?.stats || {};
      const statsData = Array.isArray(data)
        ? data.find((s) => s._id === invoiceType) || {}
        : data;
      setStats({
        totalRevenue: statsData.totalRevenue || 0,
        paid: statsData.paid || 0,
        totalDue: statsData.totalDue || 0,
        overdue: statsData.overdue || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [filters, invoiceType]);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: searchTerm.trim() || undefined,
        invoiceType: invoiceType,
        status: filters.status !== "all" ? filters.status : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page,
        limit,
        sort: "-createdAt",
      };
      const response = await invoiceService.getAll(params);
      let rawData = response?.invoices || response?.data?.invoices || [];
      const data = rawData.map(normalizeInvoiceData).filter(Boolean);

      // ✅ FIX: Robust Calculation
      const totalItems =
        response?.pagination?.total ||
        response?.data?.pagination?.total ||
        data.length;
      const calculatedTotalPages = Math.ceil(totalItems / limit);

      setInvoices(data);
      setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
      setTotalCount(totalItems);
    } catch (err) {
      const msg =
        err.response?.data?.message || t("invoices.errors.loadInvoicesFailed");
      setError(msg);
      showError(msg);
      setInvoices([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setHasInitialLoad(true);
    }
  }, [searchTerm, filters, page, limit, invoiceType, t, showError]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  useEffect(() => {
    setPage(1);
    setSelectedRows([]);
  }, [invoiceType]);

  // ✅ FIX: Client-Side Slicing Fallback
  const paginatedInvoices = useMemo(() => {
    if (invoices.length > limit) {
      const startIndex = (page - 1) * limit;
      return invoices.slice(startIndex, startIndex + limit);
    }
    return invoices;
  }, [invoices, page, limit]);

  // Handlers (Download, Delete, etc. - mostly same as before)
  const handleCreateInvoice = () =>
    navigate(`/invoices/new?type=${invoiceType}`);
  const handleEditInvoice = (invoice) =>
    navigate(`/invoices/${invoice._id}/edit`);
  const handleRowClick = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  }, []);
  const handleDownloadInvoice = async (invoice) => {
    /* ... existing logic ... */
  };
  const handleDeleteConfirm = async (id, name) => {
    /* ... existing logic ... */
  };
  const handleDeleteClick = (id, name) => {
    setConfirmationModal({
      isOpen: true,
      invoiceId: id,
      invoiceName: name,
      onConfirm: () => handleDeleteConfirm(id, name),
    });
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    filters.status !== "all" ||
    filters.startDate !== "" ||
    filters.endDate !== "";
  const showEmptyState =
    !loading &&
    !error &&
    invoices.length === 0 &&
    !hasActiveFilters &&
    hasInitialLoad;
  const showNoResults =
    !loading &&
    !error &&
    invoices.length === 0 &&
    hasActiveFilters &&
    hasInitialLoad;
  const showData =
    hasInitialLoad && (invoices.length > 0 || (loading && totalCount > 0));

  const columns = [
    {
      accessor: "invoiceNumber",
      header: t("invoices.table.headers.invoiceNumber"),
      width: "15%",
      sortable: true,
      render: (row) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.invoiceNumber}
        </div>
      ),
    },
    {
      accessor: "recipientName",
      header: t("invoices.table.headers.recipient"),
      width: "25%",
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.recipientName}
          </div>
          <div className="text-xs text-gray-500">{row.recipientCompany}</div>
        </div>
      ),
    },
    {
      accessor: "dueDate",
      header: t("invoices.table.headers.dueDate"),
      width: "15%",
      sortable: true,
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400 font-mono text-sm">
          {formatDate(row.dueDate)}
        </div>
      ),
    },
    {
      accessor: "totalAmount",
      header: t("invoices.table.headers.amount"),
      width: "15%",
      sortable: true,
      render: (row) => (
        <div className="font-bold text-green-600 dark:text-green-600">
          {formatCurrency(row.totalAmount)}
        </div>
      ),
    },
    {
      accessor: "status",
      header: t("invoices.table.headers.status"),
      width: "10%",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: t("invoices.table.headers.actions"),
      width: "20%",
      className: "text-center",
      render: (row) => {
        const canEdit = ["draft", "sent"].includes(row.status);
        return (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick(row);
              }}
              className="text-orange-500 hover:text-orange-600"
              title={t("invoices.actions.view")}
            >
              <Eye size={16} />
            </Button>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditInvoice(row);
                }}
                className="text-blue-500 hover:text-blue-600"
                title={t("invoices.actions.edit")}
              >
                <Edit size={16} />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadInvoice(row);
              }}
              className="text-green-500 hover:text-green-600"
              title={t("invoices.actions.download")}
            >
              <Download size={16} />
            </Button>
            {row.status === "draft" && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(row._id, row.invoiceNumber);
                }}
                className="text-red-500 hover:text-red-600"
                title={t("invoices.actions.delete")}
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md min-h-[500px] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("invoices.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("invoices.subtitle", {
              type:
                invoiceType === "client"
                  ? t("invoices.recipient.client")
                  : t("invoices.recipient.partner"),
            })}{" "}
            {hasInitialLoad &&
              totalCount > 0 &&
              ` • ${t("invoices.pagination.showing", { start: (page - 1) * limit + 1, end: Math.min(page * limit, totalCount), total: totalCount })}`}
          </p>
        </div>
        {!showEmptyState && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              icon={Settings}
              onClick={() => navigate("/invoices/settings")}
              className="hidden md:flex"
            >
              {t("invoices.settings")}
            </Button>
            <Button
              variant="primary"
              icon={<Plus className="size-4" />}
              onClick={handleCreateInvoice}
              className="flex-1 sm:flex-none justify-center"
            >
              {t("invoices.create.button", {
                type: t("invoices.types.invoice"),
              })}
            </Button>
          </div>
        )}
      </div>

      {!showEmptyState && hasInitialLoad && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
            <StatBox
              label={t("invoices.stats.totalRevenue")}
              value={stats?.totalRevenue}
              loading={statsLoading}
              icon={TrendingUp}
              color="blue"
            />
            <StatBox
              label={t("invoices.stats.paid")}
              value={stats?.paid}
              loading={statsLoading}
              icon={CheckCircle}
              color="green"
            />
            <StatBox
              label={t("invoices.stats.pending")}
              value={stats?.totalDue}
              loading={statsLoading}
              icon={Clock}
              color="yellow"
            />
            <StatBox
              label={t("invoices.stats.overdue")}
              value={stats?.overdue}
              loading={statsLoading}
              icon={XCircle}
              color="red"
            />
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shrink-0 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 self-start md:self-auto">
                <button
                  onClick={() => setInvoiceType("client")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${invoiceType === "client" ? "bg-white shadow text-orange-600 dark:bg-gray-600 dark:text-white" : "text-gray-500 dark:text-gray-300 hover:text-gray-900"}`}
                >
                  <Users size={16} /> {t("invoices.tabs.clients")}
                </button>
                <button
                  onClick={() => setInvoiceType("partner")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${invoiceType === "partner" ? "bg-white shadow text-orange-600 dark:bg-gray-600 dark:text-white" : "text-gray-500 dark:text-gray-300 hover:text-gray-900"}`}
                >
                  <Briefcase size={16} /> {t("invoices.tabs.partners")}
                </button>
              </div>
              <div className="flex gap-3 flex-1 justify-end w-full md:w-auto items-center">
                <Input
                  className="w-full md:w-64"
                  icon={Search}
                  placeholder={t("invoices.recipient.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => {
                    setPage(1);
                    setSearchTerm(e.target.value);
                  }}
                />
                <Button
                  variant={isFilterOpen ? "primary" : "outline"}
                  icon={Filter}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`whitespace-nowrap ${isFilterOpen ? "ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-gray-900" : ""}`}
                >
                  {t("invoices.filters.status")}
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    icon={X}
                    onClick={handleClearAllFilters}
                    className="text-gray-500"
                  >
                    {t("invoices.filters.clear")}
                  </Button>
                )}
              </div>
            </div>
            {isFilterOpen && (
              <div className="mt-2 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    {t("invoices.filters.options") || "Filter Options"}
                  </h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    label={t("invoices.filters.status")}
                    value={localStatus}
                    onChange={(e) => setLocalStatus(e.target.value)}
                    options={[
                      { value: "all", label: t("invoices.status.all") },
                      { value: "draft", label: t("invoices.status.draft") },
                      { value: "sent", label: t("invoices.status.sent") },
                      { value: "paid", label: t("invoices.status.paid") },
                      { value: "overdue", label: t("invoices.status.overdue") },
                    ]}
                  />
                  <Input
                    type="date"
                    label={t("invoices.filters.startDate")}
                    value={localStartDate}
                    onChange={(e) => setLocalStartDate(e.target.value)}
                  />
                  <Input
                    type="date"
                    label={t("invoices.filters.endDate")}
                    value={localEndDate}
                    onChange={(e) => setLocalEndDate(e.target.value)}
                  />
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleResetLocalFilters}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  >
                    {t("invoices.filters.reset") || "Reset"}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleApplyFilters}
                    className="px-6"
                  >
                    {t("invoices.filters.apply") || "Apply Filters"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col relative">
        {loading && !hasInitialLoad && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg">
            <OrbitLoader />
            <p className="text-gray-500 dark:text-gray-400">
              {t("invoices.create.loading")}
            </p>
          </div>
        )}
        {showData && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <Table
              columns={columns}
              // ✅ Pass sliced data
              data={paginatedInvoices}
              loading={loading}
              onRowClick={handleRowClick}
              selectable={false}
              selectedRows={selectedRows}
              onSelectionChange={setSelectedRows}
              striped
              hoverable
              pagination={true}
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={limit}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setLimit(newSize);
                setPage(1);
              }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </div>
        )}
        {showNoResults && (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
              <FolderOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("invoices.empty.noResults")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
              {t("invoices.empty.noResultsDesc")}
            </p>
            <Button onClick={handleClearAllFilters} variant="outline" icon={X}>
              {t("invoices.empty.clearAll")}
            </Button>
          </div>
        )}
        {showEmptyState && (
          <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-6 ring-1 ring-gray-100 dark:ring-gray-700">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-full">
                <FileText
                  className="h-12 w-12 text-orange-500"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t("invoices.empty.title")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-8 leading-relaxed">
              {t("invoices.empty.description")}
            </p>
            <Button
              onClick={handleCreateInvoice}
              variant="primary"
              size="lg"
              icon={<Plus className="size-4" />}
              className="shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-shadow"
            >
              {t("invoices.create.firstButton")}
            </Button>
          </div>
        )}
      </div>

      {selectedInvoice && isDetailModalOpen && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          size="lg"
          title={t("invoices.modal.title", {
            number: selectedInvoice.invoiceNumber,
          })}
        >
          {/* Modal Content - same as before */}
          <div className="p-6 space-y-6">
            <div className="flex justify-between border-b pb-4 border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedInvoice.recipientName}
                </h3>
                <p className="text-gray-500">
                  {selectedInvoice.recipientEmail}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedInvoice.recipientCompany}
                </p>
              </div>
              <div className="text-right">
                <StatusBadge status={selectedInvoice.status} size="lg" />
                <p className="text-xs text-gray-400 mt-2">
                  {t("invoices.modal.due")}{" "}
                  {formatDate(selectedInvoice.dueDate)}
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="p-3 text-left">
                      {t("invoices.modal.headers.description")}
                    </th>
                    <th className="p-3 text-right">
                      {t("invoices.modal.headers.qty")}
                    </th>
                    <th className="p-3 text-right">
                      {t("invoices.modal.headers.price")}
                    </th>
                    <th className="p-3 text-right">
                      {t("invoices.modal.headers.total")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {selectedInvoice.items.map((item, i) => (
                    <tr key={i}>
                      <td className="p-3 text-gray-900 dark:text-white">
                        {item.description}
                      </td>
                      <td className="p-3 text-right text-gray-600 dark:text-gray-400">
                        {item.quantity}
                      </td>
                      <td className="p-3 text-right text-gray-600 dark:text-gray-400">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="p-3 text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-2 text-right">
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>{t("invoices.modal.total")}</span>{" "}
                  <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-6 border-t border-gray-100 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => handleDownloadInvoice(selectedInvoice)}
                icon={Download}
              >
                {t("invoices.actions.download")}
              </Button>
              {selectedInvoice.status === "draft" && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleEditInvoice(selectedInvoice);
                  }}
                  icon={Edit}
                >
                  {t("invoices.actions.edit")}
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal((p) => ({ ...p, isOpen: false }))}
        title={t("invoices.delete.title")}
        size="md"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/30 rounded-full p-2">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t("invoices.delete.title")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("invoices.delete.message", {
                  name: confirmationModal.invoiceName,
                })}
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    setConfirmationModal((p) => ({ ...p, isOpen: false }))
                  }
                >
                  {t("invoices.actions.cancel")}
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmationModal.onConfirm}
                  icon={Trash2}
                >
                  {t("invoices.actions.delete")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ... StatBox remains same
const StatBox = ({ label, value, loading, icon: Icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    yellow:
      "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4 transition-all hover:shadow-md">
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {loading ? "..." : formatCurrency(value)}
        </p>
      </div>
    </div>
  );
};

export default InvoicesPage;
