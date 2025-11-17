import React from 'react';
import { Paperclip, Download } from 'lucide-react';
import Button from '../../../components/common/Button';
import EmptyState from '../../../components/common/EmptyState';

const AttachmentsTab = ({ task, formatShortDate }) => {
  const handleDownload = (attachment) => {
    // Implement download logic here
    console.log('Downloading attachment:', attachment);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Attachments ({task.attachments?.length || 0})
      </h3>
      
      {task.attachments?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {task.attachments.map((attachment, index) => (
            <div
              key={attachment._id || index}
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex-shrink-0">
                <Paperclip className="w-8 h-8 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {attachment.fileName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {attachment.fileSize && formatFileSize(attachment.fileSize)}
                  {attachment.fileSize && " • "}
                  {formatShortDate(attachment.uploadDate)}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                icon={Download}
                onClick={() => handleDownload(attachment)}
              >
                Download
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Paperclip}
          title="No attachments"
          description="Upload files to keep them organized with this task."
          size="lg"
        />
      )}
    </div>
  );
};

export default AttachmentsTab;