import React from "react";
import { Check, Calendar, UserPlus, Building, CreditCard, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

const FormHeader = ({ 
  currentStep, 
  totalSteps, 
  isEditMode, 
  prefillClient, 
  prefillPartner, 
  onStepClick
}) => {
  const { t } = useTranslation();

  const stepConfigs = {
    1: { title: t('eventForm.steps.eventDetails'), icon: Calendar, color: "blue" },
    2: { title: t('eventForm.steps.clientSelection'), icon: UserPlus, color: "green" },
    3: { title: t('eventForm.steps.venuePricing'), icon: Building, color: "purple" },
    4: { title: t('eventForm.steps.payment'), icon: CreditCard, color: "indigo" },
    5: { title: t('eventForm.steps.review'), icon: FileText, color: "orange" },
  };

  // Safety check: Ensure currentStep is valid, fallback to step 1
  const currentStepConfig = stepConfigs[currentStep] || stepConfigs[1];

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-800 px-6 py-6 border-b border-orange-200 dark:border-gray-600">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode 
              ? t('eventForm.header.editEvent') 
              : t('eventForm.header.createNewEvent')}
          </h2>
          
          {/* ✅ FIX: Explicitly passing 'title' to the translation interpolation */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {t('eventForm.header.stepProgress', { 
              current: currentStep, 
              total: totalSteps, 
              title: currentStepConfig.title // <--- This replaces {{title}}
            })}
          </p>
        </div>
        
        {/* Badges for Context */}
        <div className="flex gap-2">
          {prefillClient && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium flex items-center gap-1">
              <UserPlus size={12} /> {t('eventForm.header.prefillClient', { name: prefillClient.name })}
            </span>
          )}
          {prefillPartner && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium flex items-center gap-1">
              <UserPlus size={12} /> {t('eventForm.header.prefillPartner', { name: prefillPartner.name })}
            </span>
          )}
        </div>
      </div>

      {/* Stepper Visual */}
      <div className="flex items-center justify-between relative">
        {/* Progress Line Background */}
        <div className="absolute left-0 top-5 w-full h-1 bg-gray-200 dark:bg-gray-600 -z-0 rounded-full"></div>
        
        {/* Progress Line Active */}
        <div 
          className="absolute left-0 top-5 h-1 bg-orange-500 -z-0 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>

        {/* Steps */}
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const config = stepConfigs[step];
          const isActive = step === currentStep;
          const isComplete = step < currentStep;
          const Icon = config.icon;

          return (
            <div 
              key={step} 
              className={`flex flex-col items-center z-10 ${isComplete ? "cursor-pointer" : ""}`} 
              onClick={() => isComplete && onStepClick && onStepClick(step)}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isActive ? 'bg-orange-500 border-orange-500 text-white shadow-lg scale-110' : 
                    isComplete ? 'bg-green-500 border-green-500 text-white hover:bg-green-600' : 
                    'bg-white dark:bg-gray-800 border-gray-300 text-gray-400'}`}
              >
                {isComplete ? <Check size={20} /> : <Icon size={18} />}
              </div>
              <span className={`text-xs font-medium mt-2 ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
                {config.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FormHeader;