import React from "react";
import { Check, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

// ✅ Generic Components
import Badge from "../../../components/common/Badge";

const FormHeader = ({ 
  currentStep, 
  totalSteps, 
  isEditMode, 
  prefillClient, 
  prefillPartner, 
  onStepClick
}) => {
  const { t } = useTranslation();

  const steps = [
    { id: 1, title: t('eventForm.steps.eventDetails') },
    { id: 2, title: t('eventForm.steps.clientSelection') },
    { id: 3, title: t('eventForm.steps.venuePricing') },
    { id: 4, title: t('eventForm.steps.payment') },
    { id: 5, title: t('eventForm.steps.review') },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-20 transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        
        {/* --- Top Section: Title & Context Badges --- */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {isEditMode 
                ? t('eventForm.header.editEvent') 
                : t('eventForm.header.createNewEvent')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {t('eventForm.header.stepProgress', { 
                current: currentStep, 
                total: totalSteps, 
                title: steps[currentStep - 1]?.title 
              })}
            </p>
          </div>
          
          {(prefillClient || prefillPartner) && (
            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-right-4">
              {prefillClient && (
                <Badge variant="success" icon={<UserPlus size={12} />}>
                  {t('eventForm.header.prefillClient', { name: prefillClient.name })}
                </Badge>
              )}
              {prefillPartner && (
                <Badge variant="info" icon={<UserPlus size={12} />}>
                  {t('eventForm.header.prefillPartner', { name: prefillPartner.name })}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* --- Bottom Section: Modern Stepper --- */}
        {/* FIXED: Better mobile spacing, horizontal scroll on tiny screens */}
        <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
          <div className="flex items-center justify-between relative min-w-[500px] sm:min-w-0 px-2 sm:px-4 md:px-8 lg:px-12">
            {steps.map((step, index) => {
              const stepIdx = index + 1;
              const isComplete = stepIdx < currentStep;
              const isCurrent = stepIdx === currentStep;
              
              return (
                <div key={step.id} className="flex-1 relative flex flex-col items-center group">
                  
                  {index !== 0 && (
                    <div 
                      className={`
                        absolute top-3.5 left-[-50%] right-[50%] h-[2px] -translate-y-1/2 transition-colors duration-500 z-0
                        ${stepIdx <= currentStep ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}
                      `} 
                    />
                  )}

                  <div 
                    onClick={() => isComplete && onStepClick ? onStepClick(stepIdx) : null}
                    className={`
                      relative z-10 flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-all duration-300
                      ${isComplete 
                        ? "bg-white border-orange-500 text-orange-600 cursor-pointer hover:bg-orange-50 dark:bg-gray-800 dark:border-orange-500 dark:text-orange-500" 
                        : isCurrent 
                          ? "bg-orange-600 border-orange-600 text-white shadow-md ring-4 ring-orange-50 dark:ring-orange-900/30 scale-110" 
                          : "bg-white border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-500"
                      }
                    `}
                  >
                    {isComplete ? <Check size={14} strokeWidth={3} /> : stepIdx}
                  </div>
                  
                  {/* FIXED: Better responsive text sizing and visibility */}
                  <span className={`
                    mt-2 text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold hidden sm:block transition-colors duration-300 text-center max-w-[80px] leading-tight
                    ${isCurrent ? 'text-orange-700 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'}
                  `}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FormHeader;