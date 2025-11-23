import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Paperclip, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  File, 
  CloudDownload
} from 'lucide-react';

// ✅ Generic Components
import Button from '../../../components/common/Button';

const AttachmentsTab = ({ task, formatShortDate }) => {
  const { t } = useTranslation();

  const handleDownload = (attachment) => {
    // UI-only placeholder
    console.log('Download clicked:', attachment);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop().toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <ImageIcon className="w-6 h-6 text-purple-500" />;
    }
    if (['pdf', 'doc', 'docx', 'txt', 'xls'].includes(ext)) {
      return <FileText className="w-6 h-6 text-blue-500" />;
    }
    return <File className="w-6 h-6 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      
      {/* --- Header --- */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Paperclip className="w-5 h-5 text-indigo-500" />
        {t('tasks.detail.attachments.title')}
        <span className="text-gray-400 font-normal text-sm ml-1">
          ({task.attachments?.length || 0})
        </span>
      </h3>
      
      {task.attachments?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {task.attachments.map((attachment, index) => (
            <div
              key={attachment._id || index}
              className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900 transition-all"
            >
              {/* File Icon */}
              <div className="flex-shrink-0 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors">
                {getFileIcon(attachment.fileName)}
              </div>

              {/* Metadata */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate" title={attachment.fileName}>
                  {attachment.fileName}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{attachment.fileSize && formatFileSize(attachment.fileSize)}</span>
                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <span>{formatShortDate(attachment.uploadDate)}</span>
                </div>
              </div>

              {/* Action */}
              <Button 
                variant="ghost" 
                size="sm" 
                icon={Download}
                onClick={() => handleDownload(attachment)}
                className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              />
            </div>
          ))}
        </div>
      ) : (
        /* --- Standard Empty State --- */
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4 text-indigo-400 dark:text-indigo-300">
            <CloudDownload className="w-8 h-8" />
          </div>
          <h4 className="text-gray-900 dark:text-white font-medium mb-1">
            {t('tasks.detail.attachments.noAttachments')}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
            {t('tasks.detail.attachments.noAttachmentsDescription', 'No files have been attached to this task yet.')}
          </p>
        </div>
      )}
    </div>
  );
};

export default AttachmentsTab;