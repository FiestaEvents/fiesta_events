import React from "react";
import { History, Trash2, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "../../../../components/common/Button";

const DraftRestoreModal = ({ draftData, onRestore, onDiscard }) => {
  const { t } = useTranslation();
  const date = new Date(draftData.timestamp).toLocaleString();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mb-4">
            <History size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('eventForm.components.draftModal.title') || "Unsaved Draft Found"}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            {t('eventForm.components.draftModal.description') || "We found an unsaved event draft from:"} <br/>
            <span className="font-medium text-gray-700 dark:text-gray-300">{date}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onDiscard} icon={Trash2}>
            {t('eventForm.components.draftModal.discard') || "Discard"}
          </Button>
          <Button variant="primary" className="flex-1" onClick={onRestore} icon={CheckCircle}>
            {t('eventForm.components.draftModal.restore') || "Restore Draft"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DraftRestoreModal;