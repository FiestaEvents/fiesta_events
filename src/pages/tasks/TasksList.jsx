import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckSquare, 
  Eye, 
  Edit,
  Clock, 
  User, 
  Calendar, 
  List,
  Kanban
} from 'lucide-react';

// Hooks and Services
import { useApi, useApiMutation } from '../../hooks/useApi';
import { taskService, teamService } from '../../api/index';

// Components
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';

// Constants following documentation patterns
const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const TASK_CATEGORIES = {
  EVENT_PREPARATION: 'event_preparation',
  MARKETING: 'marketing',
  MAINTENANCE: 'maintenance',
  CLIENT_FOLLOWUP: 'client_followup',
  PARTNER_COORDINATION: 'partner_coordination',
  ADMINISTRATIVE: 'administrative',
  OTHER: 'other'
};

const Tasks = () => {
  const navigate = useNavigate();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('kanban');
  const [filters, setFilters] = useState({
    priority: '',
    status: '',
    category: '',
    sortBy: '-createdAt'
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Data fetching with proper hook usage
  const { 
    data: tasksData, 
    loading, 
    pagination, 
    refetch 
  } = useApi(
    () => taskService.getAll({
      search: searchTerm,
      ...filters,
      page: currentPage,
      limit: 50
    }),
    [searchTerm, filters, currentPage]
  );

  // DEBUG: Log the actual task data structure
  React.useEffect(() => {
    if (tasksData?.data?.data?.tasks) {
      console.log('🔍 ACTUAL TASK DATA STRUCTURE:', tasksData.data.data.tasks);
      console.log('🔍 First task sample:', tasksData.data.data.tasks[0]);
      console.log('🔍 All tasks statuses:', tasksData.data.data.tasks.map(t => ({
        id: t._id || t.id,
        title: t.title,
        status: t.status,
        priority: t.priority
      })));
    }
  }, [tasksData]);

  // FIXED: Extract tasks from the correct nested structure
  const tasks = useMemo(() => {
    if (!tasksData) {
      console.log('📋 No tasks data available');
      return [];
    }
    
    // Extract from the nested structure: data.data.tasks
    const extractedTasks = tasksData?.data?.data?.tasks;
    
    if (extractedTasks && Array.isArray(extractedTasks)) {
      console.log('✅ Successfully extracted tasks:', extractedTasks.length);
      return extractedTasks;
    }
    
    console.log('❌ No tasks found in data.data.tasks');
    return [];
  }, [tasksData]);

  // FIXED: Extract pagination from the correct structure
  const extractedPagination = useMemo(() => {
    if (!tasksData) return null;
    
    return tasksData?.data?.data?.pagination || pagination;
  }, [tasksData, pagination]);

  // Mutations
  const updateMutation = useApiMutation(taskService.update);

  // Filter options
  const priorityOptions = useMemo(() => [
    { value: '', label: 'All Priorities' },
    { value: TASK_PRIORITIES.LOW, label: 'Low' },
    { value: TASK_PRIORITIES.MEDIUM, label: 'Medium' },
    { value: TASK_PRIORITIES.HIGH, label: 'High' },
    { value: TASK_PRIORITIES.URGENT, label: 'Urgent' }
  ], []);

  const statusOptions = useMemo(() => [
    { value: '', label: 'All Status' },
    { value: TASK_STATUSES.TODO, label: 'To Do' },
    { value: TASK_STATUSES.IN_PROGRESS, label: 'In Progress' },
    { value: TASK_STATUSES.COMPLETED, label: 'Completed' },
    { value: TASK_STATUSES.CANCELLED, label: 'Cancelled' }
  ], []);

  const categoryOptions = useMemo(() => [
    { value: '', label: 'All Categories' },
    { value: TASK_CATEGORIES.EVENT_PREPARATION, label: 'Event Preparation' },
    { value: TASK_CATEGORIES.MARKETING, label: 'Marketing' },
    { value: TASK_CATEGORIES.MAINTENANCE, label: 'Maintenance' },
    { value: TASK_CATEGORIES.CLIENT_FOLLOWUP, label: 'Client Follow-up' },
    { value: TASK_CATEGORIES.PARTNER_COORDINATION, label: 'Partner Coordination' },
    { value: TASK_CATEGORIES.ADMINISTRATIVE, label: 'Administrative' },
    { value: TASK_CATEGORIES.OTHER, label: 'Other' }
  ], []);

  // Utility functions
  const getPriorityColor = useCallback((priority) => {
    const colors = {
      [TASK_PRIORITIES.LOW]: 'gray',
      [TASK_PRIORITIES.MEDIUM]: 'blue',
      [TASK_PRIORITIES.HIGH]: 'orange',
      [TASK_PRIORITIES.URGENT]: 'red'
    };
    return colors[priority] || 'gray';
  }, []);

  const getStatusColor = useCallback((status) => {
    const colors = {
      [TASK_STATUSES.TODO]: 'blue',
      [TASK_STATUSES.IN_PROGRESS]: 'purple',
      [TASK_STATUSES.COMPLETED]: 'green',
      [TASK_STATUSES.CANCELLED]: 'gray'
    };
    return colors[status] || 'gray';
  }, []);

  const formatDate = useCallback((date) => {
    if (!date) return 'No date';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  }, []);

  // Event handlers
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback(async (taskId, newStatus) => {
    try {
      await updateMutation.mutate(taskId, { status: newStatus });
      toast.success('Task status updated successfully');
      refetch();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  }, [updateMutation, refetch]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({
      priority: '',
      status: '',
      category: '',
      sortBy: '-createdAt'
    });
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Computed values
  const kanbanColumns = useMemo(() => [
    { id: 'todo', label: 'To Do', status: TASK_STATUSES.TODO },
    { id: 'in_progress', label: 'In Progress', status: TASK_STATUSES.IN_PROGRESS },
    { id: 'completed', label: 'Completed', status: TASK_STATUSES.COMPLETED }
  ], []);

  const getTasksByStatus = useCallback((status) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  // Statistics - FIXED: Proper status counting
  const stats = useMemo(() => {
    console.log('📊 Calculating stats for tasks:', tasks.length);
    
    const totalTasks = tasks.length;
    const todoTasks = tasks.filter(t => t.status === TASK_STATUSES.TODO || !t.status).length;
    const inProgressTasks = tasks.filter(t => t.status === TASK_STATUSES.IN_PROGRESS).length;
    const completedTasks = tasks.filter(t => t.status === TASK_STATUSES.COMPLETED).length;

    console.log('📊 Stats calculated:', { totalTasks, todoTasks, inProgressTasks, completedTasks });
    
    return { totalTasks, todoTasks, inProgressTasks, completedTasks };
  }, [tasks]);

  const hasActiveFilters = useMemo(() => {
    return searchTerm || filters.priority || filters.status || filters.category;
  }, [searchTerm, filters]);

  // Kanban Board Component
  const KanbanBoard = useCallback(() => {
    console.log('🎯 Rendering Kanban with tasks:', tasks.length);
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {kanbanColumns.map((column) => {
          const columnTasks = getTasksByStatus(column.status);
          console.log(`🎯 Column ${column.label}:`, columnTasks.length);
          
          return (
            <div key={column.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {column.label}
                </h3>
                <Badge variant="default">{columnTasks.length}</Badge>
              </div>
              
              <div className="space-y-3 min-h-[200px]">
                {columnTasks.length > 0 ? (
                  columnTasks.map((task) => (
                    <TaskCard 
                      key={task._id || task.id} 
                      task={task} 
                      onStatusChange={handleStatusChange}
                      onView={() => navigate(`/tasks/${task._id || task.id}`)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                    No tasks in {column.label.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [kanbanColumns, getTasksByStatus, handleStatusChange, navigate, tasks]);

  // Task Card Component
  const TaskCard = useCallback(({ task, onStatusChange, onView }) => {
    console.log('🎯 Rendering task card:', task.title);
    
    return (
      <Card 
        className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-700"
        onClick={onView}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white flex-1 pr-2">
              {task.title || 'Untitled Task'}
            </h4>
            <Badge variant={getPriorityColor(task.priority)} size="sm">
              {task.priority || 'medium'}
            </Badge>
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(task.dueDate)}
            </div>
            {task.assignedTo && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <User className="w-4 h-4 mr-1" />
                {task.assignedTo.name || 'Unassigned'}
              </div>
            )}
          </div>

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks completed
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
            <Select
              size="sm"
              value={task.status || TASK_STATUSES.TODO}
              onChange={(e) => {
                e.stopPropagation();
                onStatusChange(task._id || task.id, e.target.value);
              }}
              options={statusOptions.filter(opt => opt.value !== '')}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
            >
              View
            </Button>
          </div>
        </div>
      </Card>
    );
  }, [getPriorityColor, formatDate, statusOptions]);

  // List View Component
  const ListView = useCallback(() => {
    console.log('📝 Rendering List view with tasks:', tasks.length);
    
    return (
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task._id || task.id} className="p-4 bg-white dark:bg-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h4
                    className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-orange-600 dark:hover:text-orange-400"
                    onClick={() => navigate(`/tasks/${task._id || task.id}`)}
                  >
                    {task.title || 'Untitled Task'}
                  </h4>
                  <Badge variant={getPriorityColor(task.priority)} size="sm">
                    {task.priority || 'medium'}
                  </Badge>
                  <Badge variant={getStatusColor(task.status)} size="sm">
                    {(task.status || TASK_STATUSES.TODO).replace('_', ' ')}
                  </Badge>
                </div>
                
                {task.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Due: {formatDate(task.dueDate)}
                  </div>
                  {task.assignedTo && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {task.assignedTo.name || 'Unassigned'}
                    </div>
                  )}
                  {task.category && (
                    <Badge variant="default" size="sm">
                      {task.category.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Eye}
                  onClick={() => navigate(`/tasks/${task._id || task.id}`)}
                >
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Edit}
                  onClick={() => navigate(`/tasks/${task._id || task.id}/edit`)}
                >
                  Edit
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }, [tasks, getPriorityColor, getStatusColor, formatDate, navigate]);

  console.log('🎯 FINAL - Tasks component rendering with:', {
    tasksCount: tasks.length,
    loading,
    stats,
    viewMode
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track team tasks and assignments
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate('/tasks/new')}
        >
          Create Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={CheckSquare}
          color="purple"
        />
        <StatCard
          title="To Do"
          value={stats.todoTasks}
          icon={List}
          color="blue"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgressTasks}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Completed"
          value={stats.completedTasks}
          icon={CheckSquare}
          color="green"
        />
      </div>

      {/* View Mode Toggle */}
      <Card className="p-2 w-fit">
        <div className="flex items-center space-x-1">
          <Button
            variant={viewMode === 'kanban' ? 'primary' : 'ghost'}
            size="sm"
            icon={Kanban}
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            icon={List}
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search tasks..."
              className="lg:col-span-2"
            />

            <Select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              options={priorityOptions}
              icon={Filter}
            />

            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={statusOptions}
            />

            <Select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              options={categoryOptions}
            />
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : tasks.length > 0 ? (
        <>
          {viewMode === 'kanban' ? <KanbanBoard /> : <ListView />}
          
          {/* Pagination */}
          {extractedPagination && extractedPagination.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={extractedPagination.totalPages}
                totalItems={extractedPagination.total}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={CheckSquare}
          title={hasActiveFilters ? "No Tasks Found" : "No Tasks Yet"}
          description={
            hasActiveFilters
              ? "No tasks match your search criteria. Try adjusting your filters."
              : "Get started by creating your first task to organize your team's work."
          }
          action={{
            label: 'Create Task',
            onClick: () => navigate('/tasks/new')
          }}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {value}
        </p>
      </div>
      <div className={`p-3 bg-${color}-100 dark:bg-${color}-900 rounded-lg`}>
        <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
      </div>
    </div>
  </Card>
);

export default Tasks;