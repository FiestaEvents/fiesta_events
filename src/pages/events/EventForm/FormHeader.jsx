import React from "react";
import {
  Calendar,
  Users,
  DollarSign,
  CreditCard,
  FileText,
  Check,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const FormHeader = ({ currentStep, totalSteps, isEditMode, onStepClick }) => {
  const { t } = useTranslation();

  const steps = [
    { id: 1, title: t("eventForm.steps.eventDetails"), icon: Calendar },
    { id: 2, title: t("eventForm.steps.clientSelection"), icon: Users },
    { id: 3, title: t("eventForm.steps.venuePricing"), icon: DollarSign },
    { id: 4, title: t("eventForm.steps.payment"), icon: CreditCard },
    { id: 5, title: t("eventForm.steps.review"), icon: FileText },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm transition-colors duration-200">
      <div className="w-full px-4">
        {/* Title Row */}
        <div className="py-4 border-b border-gray-50 dark:border-gray-700/50 mb-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {isEditMode
              ? t("eventForm.header.editEvent")
              : t("eventForm.header.createNewEvent")}
          </h2>
        </div>

        {/* Visual Stepper */}
        <div className="py-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between relative min-w-[320px]">
            {/* Background Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full z-0"></div>

            {/* Progress Line */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-orange-500 rounded-full z-0 transition-all duration-500 ease-in-out"
              style={{
                width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
              }}
            ></div>

            {steps.map((step, index) => {
              const stepIdx = index + 1;
              const isComplete = stepIdx < currentStep;
              const isCurrent = stepIdx === currentStep;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className="relative z-10 flex flex-col items-center group cursor-pointer"
                  onClick={() => isComplete && onStepClick(stepIdx)}
                >
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                      ${
                        isComplete
                          ? "bg-orange-500 border-orange-500 text-white"
                          : isCurrent
                            ? "bg-white dark:bg-gray-800 border-orange-500 text-orange-600 shadow-md ring-4 ring-orange-50 dark:ring-orange-900/20"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-400"
                      }
                    `}
                  >
                    {isComplete ? (
                      <Check size={18} strokeWidth={3} />
                    ) : (
                      <Icon size={18} />
                    )}
                  </div>

                  <span
                    className={`
                    mt-2 text-[10px] uppercase font-bold tracking-wider transition-colors duration-300
                    ${isCurrent ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}
                  `}
                  >
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
