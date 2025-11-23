import React from "react";
import { Check, Calendar, UserPlus, Building, CreditCard, FileText } from "lucide-react";
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

  const stepConfigs = {
    1: { title: t('eventForm.steps.eventDetails'), icon: Calendar },
    2: { title: t('eventForm.steps.clientSelection'), icon: UserPlus },
    3: { title: t('eventForm.steps.venuePricing'), icon: Building },
    4: { title: t('eventForm.steps.payment'), icon: CreditCard },
    5: { title: t('eventForm.steps.review'), icon: FileText },
  };

  // Safety check: Ensure currentStep is valid
  const currentStepConfig = stepConfigs[currentStep] || stepConfigs[1];

  return (
    <div className="bg-white dark:bg-gray-800 px-8 py-6 border-b border-gray-100 dark:border-gray-700">
      
      {/* Top Section: Title & Badges */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {isEditMode 
              ? t('eventForm.header.editEvent') 
              : t('eventForm.header.createNewEvent')}
          </h2>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('eventForm.header.stepProgress', { 
              current: currentStep, 
              total: totalSteps, 
              title: currentStepConfig.title 
            })}
          </p>
        </div>
        
        {/* Context Badges */}
        {(prefillClient || prefillPartner) && (
          <div className="flex flex-wrap gap-2">
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

      {/* Stepper Visual */}
      <div className="relative mx-4">
        {/* Progress Line Background */}
        <div className="absolute left-0 top-5 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-0 rounded-full"></div>
        
        {/* Progress Line Active */}
        <div 
          className="absolute left-0 top-5 h-0.5 bg-orange-600 dark:bg-orange-500 -z-0 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>

        {/* Steps */}
        <div className="flex justify-between items-start relative z-10">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
            const config = stepConfigs[step];
            const isActive = step === currentStep;
            const isComplete = step < currentStep;
            const Icon = config.icon;

            return (
              <div 
                key={step} 
                className={`flex flex-col items-center group ${isComplete ? "cursor-pointer" : "cursor-default"}`} 
                onClick={() => isComplete && onStepClick && onStepClick(step)}
              >
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isActive 
                      ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-500/20 scale-110' 
                      : isComplete 
                        ? 'bg-green-500 border-green-500 text-white hover:bg-green-600 hover:scale-105' 
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                    }
                  `}
                >
                  {isComplete ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                </div>
                
                <span 
                  className={`
                    absolute top-12 text-xs font-semibold text-center w-24 transition-colors duration-300
                    ${isActive 
                      ? 'text-orange-600 dark:text-orange-400' 
                      : isComplete 
                        ? 'text-gray-700 dark:text-gray-300' 
                        : 'text-gray-400 dark:text-gray-600'
                    }
                  `}
                >
                  {config.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Spacing for absolute positioned labels */}
      <div className="h-6"></div> 
    </div>
  );
};

export default FormHeader;