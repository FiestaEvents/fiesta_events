import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, User } from 'lucide-react';

// ✅ Generic Components
import Badge from '../../../components/common/Badge';

const CommentsTab = ({ task, formatDateTime }) => {
  const { t } = useTranslation();

  return (
    <div>
      {/* --- Header --- */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-500" />
        {t('tasks.detail.comments.title')} 
        <span className="text-gray-400 font-normal text-sm ml-1">
          ({task.comments?.length || 0})
        </span>
      </h3>
      
      {task.comments?.length > 0 ? (
        <div className="space-y-6">
          {task.comments.map((comment, index) => (
            <div key={comment._id || index} className="flex gap-4 group">
              
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white dark:ring-gray-800">
                  {comment.author?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                </div>
              </div>

              {/* Content Bubble */}
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700">
                  
                  {/* Meta Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        {comment.author?.name || t('tasks.detail.comments.unknownUser')}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        • {formatDateTime(comment.createdAt)}
                      </span>
                    </div>
                    
                    {comment.isEdited && (
                      <Badge variant="secondary" size="sm" className="text-[10px] px-1.5 h-5">
                        {t('tasks.detail.comments.edited')}
                      </Badge>
                    )}
                  </div>

                  {/* Text */}
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                    {comment.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* --- Standard Empty State --- */
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 text-blue-400 dark:text-blue-300">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h4 className="text-gray-900 dark:text-white font-medium mb-1">
            {t('tasks.detail.comments.noComments')}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
            {t('tasks.detail.comments.noCommentsDescription', 'No comments have been added to this task yet.')}
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentsTab;