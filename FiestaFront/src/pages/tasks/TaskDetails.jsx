import React from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const TaskDetails = ({ task, onEdit }) => {
  if (!task) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {task.title || 'Untitled Task'}
        </h2>
        <Badge color={task.status === 'completed' ? 'green' : 'gray'}>
          {task.status || 'pending'}
        </Badge>
      </div>

      <div className="space-y-2 text-gray-700 dark:text-gray-300">
        <p><span className="font-medium">Assignee:</span> {task.assignedTo || '-'}</p>
        <p><span className="font-medium">Due Date:</span> {task.dueDate ? new Date(task.dueDate).toLocaleString() : '-'}</p>
        <p><span className="font-medium">Priority:</span> {task.priority || 'low'}</p>
        <p><span className="font-medium">Description:</span> {task.description || 'No description provided.'}</p>
      </div>

      <div className="flex justify-end mt-4">
        <Button onClick={onEdit}>Edit Task</Button>
      </div>
    </div>
  );
};

export default TaskDetails;
