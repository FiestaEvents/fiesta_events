import React from 'react';
import { MessageSquare } from 'lucide-react';
import Badge from '../../../components/common/Badge';
import EmptyState from '../../../components/common/EmptyState';

const CommentsTab = ({ task, formatDateTime }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Comments ({task.comments?.length || 0})
      </h3>
      
      {task.comments?.length > 0 ? (
        <div className="space-y-4">
          {task.comments.map((comment, index) => (
            <div key={comment._id || index} className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {comment.author?.name?.charAt(0) || "U"}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {comment.author?.name || "Unknown User"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDateTime(comment.createdAt)}
                  </span>
                  {comment.isEdited && (
                    <Badge variant="gray" size="sm">edited</Badge>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {comment.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No comments yet"
          description="Be the first to comment on this task."
          size="lg"
        />
      )}
    </div>
  );
};

export default CommentsTab;