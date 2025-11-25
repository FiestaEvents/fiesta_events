import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format, addHours, addDays } from "date-fns";
import {
  Plus,
  Search,
  Filter,
  Eye,
  X,
  Edit,
  Trash2,
  Clock,
  BellOff,
  AlertTriangle,
  Bell,
  Calendar
} from "lucide-react";

// ✅ API & Services
import { reminderService } from "../../api/index";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Pagination from "../../components/common/Pagination";
import Badge from "../../components/common/Badge";

// ✅ Context & Sub-components
import { useToast } from "../../context/ToastContext";
import ReminderDetailModal from "./ReminderDetailModal";
import ReminderForm from "./ReminderForm";

const RemindersList = () => {
  const navigate = useNavigate();
  const { showSuccess, apiError, showInfo, promise } = useToast();
  const { t } = useTranslation();

  // State
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [snoozingReminders, setSnoozingReminders] = useState(new Set());

  // Modals
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    reminderId: null,
    reminderName: "",
    onConfirm: null
  });

  const [snoozeOptionsModal, setSnoozeOptionsModal] = useState({ 
    isOpen: false, 
    reminder: null 
  });

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [priority, setPriority] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch Reminders
  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit,
        ...(search.trim() && { search: search.trim() }),
        ...(status !== "all" && { status }),
        ...(type !== "all" && { type }),
        ...(priority !== "all" && { priority }),
      };

      const response = await reminderService.getAll(params);

      // Data extraction logic
      let data = response?.data?.data?.reminders || response?.data?.reminders || response?.reminders || response?.data || response || [];
      if (!Array.isArray(data)) data = [];
      
      let pTotalPages = response?.data?.data?.totalPages || response?.data?.totalPages || response?.totalPages || 1;
      let pTotalCount = response?.data?.data?.totalCount || response?.data?.totalCount || response?.totalCount || data.length;

      setReminders(data);
      setTotalPages(pTotalPages);
      setTotalCount(pTotalCount);
      setHasInitialLoad(true);
    } catch (err) {
      apiError(err, t('reminders.errorLoading'));
      setReminders([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [search, status, type, priority, page, limit, apiError, t]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // --- Handlers ---

  const handleDeleteConfirm = useCallback(async (reminderId, reminderName) => {
    try {
      await promise(reminderService.delete(reminderId), {
        loading: t('reminders.notifications.deleting', { name: reminderName }),
        success: t('reminders.notifications.deleted'),
        error: t('reminders.notifications.deleteError')
      });
      fetchReminders();
      setConfirmationModal({ isOpen: false, reminderId: null, reminderName: "", onConfirm: null });
      if (selectedReminder?._id === reminderId) setIsDetailModalOpen(false);
    } catch (err) {
      // Promise handles UI feedback
    }
  }, [fetchReminders, selectedReminder, promise, t]);

  const handleDeleteReminder = (reminderId, reminderName) => {
    setConfirmationModal({
      isOpen: true,
      reminderId,
      reminderName,
      onConfirm: () => handleDeleteConfirm(reminderId, reminderName)
    });
  };

  const handleSnoozeAction = useCallback(async (duration, unit = 'hours') => {
    const { reminder } = snoozeOptionsModal;
    if (!reminder?._id) return;

    try {
      setSnoozingReminders(prev => new Set(prev).add(reminder._id));
      const now = new Date();
      const snoozeUntil = unit === 'days' ? addDays(now, duration) : addHours(now, duration);

      await promise(reminderService.snooze(reminder._id, {
        snoozeUntil: snoozeUntil.toISOString(),
        duration,
        unit
      }), {
        loading: t('reminders.notifications.snoozing'),
        success: t('reminders.notifications.snoozed'),
        error: t('reminders.notifications.snoozeError')
      });
      
      await fetchReminders();
      setSnoozeOptionsModal({ isOpen: false, reminder: null });
    } catch (err) {
      // Error handled by promise toast
    } finally {
      setSnoozingReminders(prev => {
        const newSet = new Set(prev);
        newSet.delete(reminder._id);
        return newSet;
      });
    }
  }, [snoozeOptionsModal, fetchReminders, promise, t]);

  const handleUnsnooze = useCallback(async (reminder) => {
    try {
      setSnoozingReminders(prev => new Set(prev).add(reminder._id));
      await promise(reminderService.update(reminder._id, { status: "active", snoozeUntil: null }), {
        loading: t('reminders.notifications.activating'),
        success: t('reminders.notifications.unsnoozed'),
        error: t('reminders.notifications.activateError')
      });
      await fetchReminders();
    } catch (err) {
      // Error handled
    } finally {
      setSnoozingReminders(prev => {
        const newSet = new Set(prev);
        newSet.delete(reminder._id);
        return newSet;
      });
    }
  }, [fetchReminders, promise, t]);

  const handleFormSuccess = () => {
    fetchReminders();
    setIsFormOpen(false);
    showSuccess(selectedReminder ? t('reminders.notifications.updated') : t('reminders.notifications.created'));
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
    setType("all");
    setPriority("all");
    setPage(1);
    showInfo(t('reminders.notifications.filtersCleared'));
  };

  // Helpers
  const getPriorityColor = (p) => {
    const map = { urgent: "danger", high: "warning", medium: "info", low: "secondary" };
    return map[p] || "secondary";
  };

  const getTypeColor = (tp) => {
    const map = { event: "primary", payment: "warning", task: "purple", maintenance: "orange", followup: "success" };
    return map[tp] || "secondary";
  };

  const getStatusColor = (st) => {
    const map = { completed: "success", active: "info", snoozed: "warning", cancelled: "danger" };
    return map[st] || "secondary";
  };

  const hasActiveFilters = search.trim() !== "" || status !== "all" || type !== "all" || priority !== "all";
  const showEmptyState = !loading && reminders.length === 0 && !hasActiveFilters && hasInitialLoad;
  const showNoResults = !loading && reminders.length === 0 && hasActiveFilters && hasInitialLoad;

  // Columns
  const columns = [
    {
      header: t('reminders.columns.title'),
      accessor: "title",
      width: "20%",
      render: (row) => <div className="font-medium text-gray-900 dark:text-white">{row.title || t('reminders.untitled')}</div>,
    },
    {
      header: t('reminders.columns.description'),
      accessor: "description",
      width: "25%",
      render: (row) => <div className="text-gray-500 truncate max-w-xs" title={row.description}>{row.description || "-"}</div>,
    },
    {
      header: t('reminders.columns.dateTime'),
      accessor: "reminderDate",
      width: "15%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          {row.reminderDate ? format(new Date(row.reminderDate), "dd/MM/yyyy") : "-"}
          {row.reminderTime && <span className="text-xs bg-gray-100 px-1 rounded">{row.reminderTime}</span>}
        </div>
      ),
    },
    {
      header: t('reminders.columns.type'),
      accessor: "type",
      width: "10%",
      render: (row) => <Badge variant={getTypeColor(row.type)} className="capitalize">{row.type}</Badge>,
    },
    {
      header: t('reminders.columns.priority'),
      accessor: "priority",
      width: "10%",
      render: (row) => <Badge variant={getPriorityColor(row.priority)} className="capitalize">{row.priority}</Badge>,
    },
    {
      header: t('reminders.columns.status'),
      accessor: "status",
      width: "10%",
      render: (row) => <Badge variant={getStatusColor(row.status)} className="capitalize">{row.status}</Badge>,
    },
    {
      header: t('reminders.columns.actions'),
      accessor: "actions",
      width: "10%",
      className: "text-center",
      render: (row) => {
        const isSnoozing = snoozingReminders.has(row._id);
        const isSnoozed = row.status === "snoozed";
        
        return (
          <div className="flex justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={isSnoozing}
              onClick={(e) => { e.stopPropagation(); isSnoozed ? handleUnsnooze(row) : setSnoozeOptionsModal({ isOpen: true, reminder: row }); }}
              className={isSnoozed ? "text-orange-500" : "text-gray-500"}
            >
              {isSnoozing ? <Clock className="w-4 h-4 animate-spin" /> : isSnoozed ? <BellOff className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedReminder(row); setIsDetailModalOpen(true); }}>
              <Eye className="w-4 h-4 text-blue-500" />
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedReminder(row); setIsFormOpen(true); }}>
              <Edit className="w-4 h-4 text-green-500" />
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteReminder(row._id, row.title); }}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Helper to render custom footer if Pagination component hides itself
  const renderPagination = () => {
    // If we have multiple pages, rely on the standard Pagination component
    if (totalPages > 1) {
      return (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={limit}
            onPageSizeChange={(val) => { setLimit(val); setPage(1); }}
            totalItems={totalCount}
          />
        </div>
      );
    }

    // If single page, manually render the info bar (Showing X to Y of Z...)
    const start = Math.min((page - 1) * limit + 1, totalCount);
    const end = Math.min(page * limit, totalCount);

    return (
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div>
          Showing <span className="font-medium text-gray-900 dark:text-white">{start}</span> to{" "}
          <span className="font-medium text-gray-900 dark:text-white">{end}</span> of{" "}
          <span className="font-medium text-gray-900 dark:text-white">{totalCount}</span> results
        </div>
        <div className="flex items-center gap-2">
          <span>Per page:</span>
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('reminders.title')}</h1>
          <p className="mt-1 text-gray-500">{t('reminders.subtitle')} {hasInitialLoad && `(${totalCount})`}</p>
        </div>
        {totalCount > 0 && (
          <Button variant="primary" icon={Plus} onClick={() => { setSelectedReminder(null); setIsFormOpen(true); }}>
            {t('reminders.addReminder')}
          </Button>
        )}
      </div>

      {/* Filters */}
      {hasInitialLoad && !showEmptyState && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
          <Input className="flex-1" icon={Search} placeholder={t('reminders.searchPlaceholder')} value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
          <div className="sm:w-40">
            <Select 
              value={status} 
              onChange={(e) => { setPage(1); setStatus(e.target.value); }}
              options={[{ value: "all", label: t('reminders.status.all') }, { value: "active", label: t('reminders.status.active') }, { value: "completed", label: t('reminders.status.completed') }, { value: "snoozed", label: t('reminders.status.snoozed') }]}
            />
          </div>
          <div className="sm:w-40">
            <Select 
              value={priority} 
              onChange={(e) => { setPage(1); setPriority(e.target.value); }}
              options={[{ value: "all", label: t('reminders.priority.all') }, { value: "urgent", label: t('reminders.priority.urgent') }, { value: "high", label: t('reminders.priority.high') }, { value: "medium", label: t('reminders.priority.medium') }, { value: "low", label: t('reminders.priority.low') }]}
            />
          </div>
          {hasActiveFilters && (
            <Button variant="outline" icon={X} onClick={handleClearFilters}>{t('reminders.clearFilters')}</Button>
          )}
        </div>
      )}

      {/* Content */}
      {showNoResults ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('reminders.noResults')}</h3>
          <Button variant="outline" onClick={handleClearFilters} className="mt-4">{t('reminders.clearFilters')}</Button>
        </div>
      ) : showEmptyState ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('reminders.noReminders')}</h3>
          <Button variant="primary" icon={Plus} onClick={() => setIsFormOpen(true)} className="mt-4">{t('reminders.createFirst')}</Button>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={reminders}
            loading={loading}
            emptyMessage={t('reminders.noReminders')}
            onRowClick={(row) => { setSelectedReminder(row); setIsDetailModalOpen(true); }}
            striped
            hoverable
          />
          
          {/* ✅ FIXED: Ensure Pagination Info shows even on single page */}
          {renderPagination()}
        </>
      )}

      {/* Modals */}
      <ReminderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        reminder={selectedReminder}
        onEdit={(r) => { setSelectedReminder(r); setIsDetailModalOpen(false); setIsFormOpen(true); }}
        refreshData={fetchReminders}
      />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedReminder ? t('reminders.form.editTitle') : t('reminders.form.createTitle')} size="lg">
        <ReminderForm reminder={selectedReminder} onSuccess={handleFormSuccess} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      <Modal isOpen={snoozeOptionsModal.isOpen} onClose={() => setSnoozeOptionsModal({ isOpen: false, reminder: null })} title={t('reminders.modals.snooze.title')} size="sm">
        <div className="p-4 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => handleSnoozeAction(1, 'hours')}>1 Hour</Button>
          <Button variant="outline" onClick={() => handleSnoozeAction(4, 'hours')}>4 Hours</Button>
          <Button variant="outline" onClick={() => handleSnoozeAction(1, 'days')}>1 Day</Button>
          <Button variant="outline" onClick={() => handleSnoozeAction(1, 'weeks')}>1 Week</Button>
        </div>
      </Modal>

      <Modal isOpen={confirmationModal.isOpen} onClose={() => setConfirmationModal(p => ({ ...p, isOpen: false }))} title={t('reminders.modals.delete.title')} size="sm">
        <div className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="mb-6 text-gray-600">{t('reminders.modals.delete.description', { name: confirmationModal.reminderName })}</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => setConfirmationModal(p => ({ ...p, isOpen: false }))}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={confirmationModal.onConfirm}>{t('common.delete')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RemindersList;