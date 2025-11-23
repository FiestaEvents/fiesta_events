import React from "react";
import { History, Trash2, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

// ✅ Generic Components
import Button from "../../../../components/common/Button";

const DraftRestoreModal = ({ draftData, onRestore, onDiscard }) => {
  const { t } = useTranslation();
  
  // ✅ Format date to match app standard (DD/MM/YYYY HH:mm)
  const formattedDate = new Date(draftData.timestamp).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 sm:p-8 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
        
        {/* Icon & Content */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500 rounded-full flex items-center justify-center mb-5 ring-8 ring-orange-50/50 dark:ring-orange-900/10">
            <History size={32} strokeWidth={1.5} />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('eventForm.components.draftModal.title', 'Unsaved Draft Found')}
          </h3>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            {t('eventForm.components.draftModal.description', 'You have an unsaved event from:')}
            <br />
            <span className="font-semibold text-gray-900 dark:text-white mt-1 inline-block bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
              {formattedDate}
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            onClick={onDiscard} 
            icon={Trash2}
            className="w-full justify-center border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:border-gray-600 dark:hover:bg-red-900/20"
          >
            {t('eventForm.components.draftModal.discard', 'Discard')}
          </Button>
          
          <Button 
            variant="primary" 
            onClick={onRestore} 
            icon={RotateCcw}
            className="w-full justify-center"
          >
            {t('eventForm.components.draftModal.restore', 'Restore')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DraftRestoreModal;