import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import { taskService } from '../../api/index';
import { PlusIcon, RefreshCwIcon, ClipboardListIcon } from '../../components/icons/IconComponents';
import TaskDetails from './TaskDetails.jsx';
import TaskForm from './TaskForm.jsx';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: search.trim() || undefined,
        status: status !== 'all' ? status : undefined,
        priority: priority !== 'all' ? priority : undefined,
        page,
        limit,
      };
      const res = await taskService.getAll(params);
      if (res.data) {
        if (Array.isArray(res.data)) {
          setTasks(res.data);
          setTotalPages(1);
        } else {
          setTasks(res.data.tasks || []);
          setTotalPages(res.data.totalPages || 1);
        }
      } else {
        setTasks([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, page, limit]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Actions
  const handleAddTask = useCallback(() => {
    setSelectedTask(null);
    setIsFormOpen(true);
  }, []);

  const handleEditTask = useCallback((task) => {
    setSelectedTask(task);
    setIsModalOpen(false);
    setIsFormOpen(true);
  }, []);

  const handleViewTask = useCallback((task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTask(null);
    setIsModalOpen(false);
    setIsFormOpen(false);
  }, []);

  const handleFormSuccess = useCallback(() => {
    fetchTasks();
    handleCloseModal();
  }, [fetchTasks, handleCloseModal]);

  const handleRefresh = useCallback(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSearchChange = useCallback((e) => {
    setPage(1);
    setSearch(e.target.value);
  }, []);

  const handleStatusChange = useCallback((e) => {
    setPage(1);
    setStatus(e.target.value);
  }, []);

  const handlePriorityChange = useCallback((e) => {
    setPage(1);
    setPriority(e.target.value);
  }, []);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
            Manage and track operational assignments.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCwIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleAddTask}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Error Message */}
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
        <div className="flex-1">
          <Input
            placeholder="Search by title or assignee..."
            value={search}
            onChange={handleSearchChange}
            aria-label="Search tasks"
          />
        </div>
        <div className="sm:w-40">
          <Select
            value={status}
            onChange={handleStatusChange}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ]}
            aria-label="Filter by status"
          />
        </div>
        <div className="sm:w-40">
          <Select
            value={priority}
            onChange={handlePriorityChange}
            options={[
              { value: 'all', label: 'All Priority' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
            aria-label="Filter by priority"
          />
        </div>
      </Card>

      {/* Table Section */}
      <Card>
        {loading ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <ClipboardListIcon className="mx-auto h-12 w-12" />
            <p className="mt-2">Loading tasks...</p>
          </div>
        ) : tasks.length > 0 ? (
          <>
            <Table
              columns={['Title', 'Due Date', 'Assignee', 'Priority', 'Status', 'Actions']}
              data={tasks.map((task) => [
                task.title || 'Untitled',
                task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date',
                task.assignedTo || '-',
                <Badge
                  key={`priority-${task._id || task.id}`}
                  color={
                    task.priority === 'high'
                      ? 'red'
                      : task.priority === 'medium'
                      ? 'yellow'
                      : 'gray'
                  }
                >
                  {task.priority || 'low'}
                </Badge>,
                <Badge
                  key={`status-${task._id || task.id}`}
                  color={
                    task.status === 'completed'
                      ? 'green'
                      : task.status === 'in-progress'
                      ? 'blue'
                      : 'gray'
                  }
                >
                  {task.status || 'pending'}
                </Badge>,
                <div key={`actions-${task._id || task.id}`} className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleViewTask(task)}>
                    View
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleEditTask(task)}>
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
            <ClipboardListIcon className="mx-auto h-12 w-12" />
            <p className="mt-2">No tasks found. Try adjusting your filters.</p>
          </div>
        )}
      </Card>

      {/* View Modal */}
      {isModalOpen && selectedTask && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Task Details">
          <TaskDetails task={selectedTask} onEdit={() => handleEditTask(selectedTask)} />
        </Modal>
      )}

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={handleCloseModal}
          title={selectedTask ? 'Edit Task' : 'Add Task'}
        >
          <TaskForm
            task={selectedTask}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
};

export default TasksPage;
