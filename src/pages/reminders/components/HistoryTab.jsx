import React from 'react';
import { Clock } from 'lucide-react';

const HistoryTab = ({ reminder, formatDate }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Activity History
      </h3>

      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">
          Activity history will be implemented in the next phase
        </p>
      </div>
    </div>
  );
};

export default HistoryTab;