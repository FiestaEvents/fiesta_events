import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaginationList, useApiMutation } from '../../hooks/useApi';
import { taskService } from '../../api/index';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import { 
  Plus, Search, Filter, CheckSquare, Eye, Edit,
  Clock, AlertCircle, User, Calendar, List
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Tasks = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [filters, setFilters] = useState({
    priority: '',
    status: '',
    category: '',
    sortBy: '-createdAt'
  });

  const {
    data: tasks,
    loading,
    pagination,
    setPage,
    refetch
  } = usePaginationList(
    (params) => taskService.getAll({
      ...params,
      search: searchTerm,
      ...filters
    }),
    [searchTerm, filters]
  );

  const updateMutation = useApiMutation(taskService.update);

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'event_preparation', label: 'Event Preparation' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'client_followup', label: 'Client Follow-up' },
    { value: 'partner_coordination', label: 'Partner Coordination' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'other', label: 'Other' }
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'gray',
      medium: 'blue',
      high: 'orange',
      urgent: 'red'
    };
    return colors[priority] || 'gray';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      todo: 'blue',
      in_progress: 'purple',
      completed: 'green',
      cancelled: 'gray'
    };
    return colors[status] || 'gray';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateMutation.mutate(taskId, { status: newStatus });
      toast.success('Task status updated');
      refetch();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const kanbanColumns = [
    { id: 'todo', label: 'To Do', status: 'todo' },
    { id: 'in_progress', label: 'In Progress', status: 'in_progress' },
    { id: 'completed', label: 'Completed', status: 'completed' }
  ];

  const getTasksByStatus = (status) => {
    return tasks?.filter(task => task.status === status) || [];
  };

  const totalTasks = tasks?.length || 0;
  const todoTasks = tasks?.filter(t => t.status === 'todo').length || 0;
  const inProgressTasks = tasks?.filter(t => t.status === 'in_progress').length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your tasks
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalTasks}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckSquare className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">To Do</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {todoTasks}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <List className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {inProgressTasks}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {completedTasks}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1 w-fit">
        <button
          onClick={() => setViewMode('kanban')}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${viewMode === 'kanban'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          Kanban Board
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${viewMode === 'list'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          List View
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={handleSearch}
            icon={Search}
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

        {(searchTerm || filters.priority || filters.status || filters.category) && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  priority: '',
                  status: '',
                  category: '',
                  sortBy: '-createdAt'
                });
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Kanban Board / List View */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : tasks?.length > 0 ? (
        viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kanbanColumns.map((column) => {
              const columnTasks = getTasksByStatus(column.status);
              return (
                <div key={column.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{column.label}</h3>
                    <Badge color="gray">{columnTasks.length}</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {columnTasks.length > 0 ? (
                      columnTasks.map((task) => (
                        <Card
                          key={task._id}
                          className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => navigate(`/tasks/${task._id}`)}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-gray-900 flex-1">
                                {task.title}
                              </h4>
                              <Badge color={getPriorityColor(task.priority)} size="sm">
                                {task.priority}
                              </Badge>
                            </div>

                            {task.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(task.dueDate)}
                              </div>
                              {task.assignedTo && (
                                <div className="flex items-center text-gray-500">
                                  <User className="w-4 h-4 mr-1" />
                                  {task.assignedTo.name}
                                </div>
                              )}
                            </div>

                            {task.subtasks && task.subtasks.length > 0 && (
                              <div className="text-xs text-gray-500">
                                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
                              </div>
                            )}
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No tasks in {column.label.toLowerCase()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4
                        className="font-medium text-gray-900 cursor-pointer hover:text-purple-600"
                        onClick={() => navigate(`/tasks/${task._id}`)}
                      >
                        {task.title}
                      </h4>
                      <Badge color={getPriorityColor(task.priority)} size="sm">
                        {task.priority}
                      </Badge>
                      <Badge color={getStatusColor(task.status)} size="sm">
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Due: {formatDate(task.dueDate)}
                      </div>
                      {task.assignedTo && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {task.assignedTo.name}
                        </div>
                      )}
                      {task.category && (
                        <Badge color="gray" size="sm">
                          {task.category.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={() => navigate(`/tasks/${task._id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit}
                      onClick={() => navigate(`/tasks/${task._id}/edit`)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        <EmptyState
          icon={CheckSquare}
          title="No Tasks Found"
          description={
            searchTerm || filters.priority || filters.status || filters.category
              ? "No tasks match your search criteria. Try adjusting your filters."
              : "Get started by creating your first task."
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

export default Tasks;