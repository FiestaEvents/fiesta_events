import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import { reminderService } from '../../api/index';
import { PlusIcon, RefreshCwIcon, BellIcon } from '../../components/icons/IconComponents';
import ReminderDetails from './ReminderDetails';
import ReminderForm from './ReminderForm';
import { format } from 'date-fns';

const RemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: search.trim() || undefined,
        status: status !== 'all' ? status : undefined,
        type: type !== 'all' ? type : undefined,
        page,
        limit,
      };
      const res = await reminderService.getAll(params);
      if (res.data) {
        if (Array.isArray(res.data)) {
          setReminders(res.data);
          setTotalPages(1);
        } else {
          setReminders(res.data.reminders || []);
          setTotalPages(res.data.totalPages || 1);
        }
      } else {
        setReminders([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching reminders:', err);
      setError('Failed to load reminders. Please try again.');
      setReminders([]);
    } finally {
      setLoading(false);
    }
  }, [search, status, type, page, limit]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleAddReminder = useCallback(() => {
    setSelectedReminder(null);
    setIsFormOpen(true);
  }, []);

  const handleEditReminder = useCallback((reminder) => {
    setSelectedReminder(reminder);
    setIsModalOpen(false);
    setIsFormOpen(true);
  }, []);

  const handleViewReminder = useCallback((reminder) => {
    setSelectedReminder(reminder);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedReminder(null);
    setIsModalOpen(false);
    setIsFormOpen(false);
  }, []);

  const handleFormSuccess = useCallback(() => {
    fetchReminders();
    handleCloseModal();
  }, [fetchReminders, handleCloseModal]);

  const handleRefresh = useCallback(() => {
    fetchReminders();
  }, [fetchReminders]);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reminders</h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
            Manage notifications, alerts, and follow-up reminders.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCwIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleAddReminder}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Reminder
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <Button onClick={handleRefresh} size="sm" variant="outline">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Search & Filters */}
      <Card className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
        <Input
          placeholder="Search reminders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="sm:w-40">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
        </div>
        <div className="sm:w-40">
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'event', label: 'Event' },
              { value: 'payment', label: 'Payment' },
              { value: 'task', label: 'Task' },
              { value: 'general', label: 'General' },
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <BellIcon className="mx-auto h-12 w-12" />
            <p className="mt-2">Loading reminders...</p>
          </div>
        ) : reminders.length > 0 ? (
          <>
            <Table
              columns={['Title', 'Date', 'Type', 'Status', 'Actions']}
              data={reminders.map((rem) => [
                rem.title || 'Untitled',
                rem.date ? format(new Date(rem.date), 'PPpp') : 'No date',
                <Badge
                  key={`type-${rem._id || rem.id}`}
                  color={
                    rem.type === 'event'
                      ? 'blue'
                      : rem.type === 'payment'
                      ? 'yellow'
                      : rem.type === 'task'
                      ? 'purple'
                      : 'gray'
                  }
                >
                  {rem.type || 'general'}
                </Badge>,
                <Badge
                  key={`status-${rem._id || rem.id}`}
                  color={rem.status === 'completed' ? 'green' : 'gray'}
                >
                  {rem.status || 'pending'}
                </Badge>,
                <div key={`actions-${rem._id || rem.id}`} className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleViewReminder(rem)}>
                    View
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleEditReminder(rem)}>
                    Edit
                  </Button>
                </div>,
              ])}
            />
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                pageSize={limit}
                onPageSizeChange={setLimit}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <BellIcon className="mx-auto h-12 w-12" />
            <p className="mt-2">No reminders found. Try adjusting your filters.</p>
          </div>
        )}
      </Card>

      {/* View Modal */}
      {isModalOpen && selectedReminder && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Reminder Details">
          <ReminderDetails
            reminder={selectedReminder}
            onEdit={() => handleEditReminder(selectedReminder)}
          />
        </Modal>
      )}

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={handleCloseModal}
          title={selectedReminder ? 'Edit Reminder' : 'Add Reminder'}
        >
          <ReminderForm
            reminder={selectedReminder}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
};

export default RemindersPage;
