// src/components/events/EventForm/components/DraftRestoreModal.jsx
import React from "react";
import { History, Check, Trash2, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "../../../../components/common/Button";
import Badge from "../../../../components/common/Badge";

const DraftRestoreModal = ({ draftData, onRestore, onDiscard }) => {
  const { t } = useTranslation();
  
  if (!draftData) return null;

  const { timestamp, savedData } = draftData;
  const draftAge = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(draftAge / (1000 * 60 * 60));
  const minutes = Math.floor((draftAge % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75"></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-300">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center animate-pulse">
              <History className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('eventForm.components.draftModal.title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('eventForm.components.draftModal.description', {
                time: hours > 0 
                  ? t('eventForm.components.draftModal.hoursAgo', { count: hours })
                  : t('eventForm.components.draftModal.minutesAgo', { count: minutes })
              })}
            </p>

            {/* Draft Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-left mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('eventForm.components.draftModal.eventTitle')}:
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {savedData.title || t('eventForm.components.draftModal.untitled')}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('eventForm.components.draftModal.eventType')}:
                </span>
                <Badge className="capitalize">
                  {savedData.type || t('eventForm.step5.notAvailable')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('eventForm.components.draftModal.lastSaved')}:
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800 dark:text-yellow-300 text-left">
                {t('eventForm.components.draftModal.warning')}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              icon={Trash2}
              onClick={onDiscard}
              className="w-full hover:bg-red-50 hover:border-red-300 hover:text-red-600"
            >
              {t('eventForm.components.draftModal.discard')}
            </Button>
            <Button variant="primary" icon={Check} onClick={onRestore} className="w-full">
              {t('eventForm.components.draftModal.restore')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftRestoreModal;