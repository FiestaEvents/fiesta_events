// src/components/events/EventForm/FormHeader.jsx
import React from "react";
import { Check, Calendar, UserPlus, Building, CreditCard, FileText } from "lucide-react";

const stepConfigs = {
  1: { title: "Event Details", icon: Calendar, color: "blue" },
  2: { title: "Client Selection", icon: UserPlus, color: "green" },
  3: { title: "Venue & Pricing", icon: Building, color: "purple" },
  4: { title: "Payment", icon: CreditCard, color: "indigo" },
  5: { title: "Review", icon: FileText, color: "orange" },
};

const FormHeader = ({ 
  currentStep, 
  totalSteps, 
  isEditMode, 
  prefillClient, 
  prefillPartner, 
  returnUrl,
  onStepClick  // New prop for handling step clicks
}) => {
  const currentStepConfig = stepConfigs[currentStep];

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-800/50 px-6 py-6 border-b-2 border-orange-200 dark:border-gray-600">
      <div className="flex flex-col gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
            <currentStepConfig.icon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? "Edit Event" : "Create New Event"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              Step {currentStep} of {totalSteps}: {currentStepConfig.title}
            </p>
          </div>
        </div>

        {/* Context Indicators */}
        {(prefillClient || prefillPartner || returnUrl) && (
          <div className="flex flex-wrap gap-2">
            {prefillClient && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                Client: {prefillClient.name}
              </span>
            )}
            {prefillPartner && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                Partner: {prefillPartner.name}
              </span>
            )}
          </div>
        )}

        {/* Step Indicator - Now clickable for previous steps */}
        <div className="flex items-center justify-center">
          <div className="flex items-center w-full max-w-3xl">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => {
              const config = stepConfigs[step];
              const isActive = step === currentStep;
              const isComplete = step < currentStep;
              const isClickable = step < currentStep; // Can click on previous steps

              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-shrink-0 mx-auto">
                    <button
                      type="button"
                      onClick={() => isClickable && onStepClick && onStepClick(step)}
                      disabled={!isClickable}
                      className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-500 text-white shadow-lg scale-110"
                          : isComplete
                          ? "bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white shadow-md cursor-pointer hover:scale-105 hover:shadow-lg"
                          : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {isComplete ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="font-bold">{step}</span>
                      )}
                      {isActive && (
                        <span className="absolute -inset-1 bg-orange-400 rounded-full animate-ping opacity-20"></span>
                      )}
                    </button>
                    <span
                      className={`text-xs mt-2 font-medium text-center transition-colors whitespace-nowrap ${
                        isActive
                          ? "text-orange-600 dark:text-orange-400"
                          : isComplete
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500"
                      }`}
                    >
                      {config.title}
                    </span>
                  </div>

                  {step < totalSteps && (
                    <div
                      className={`h-1 min-w-10 rounded-full transition-all duration-300 ${
                        isComplete ? "bg-green-500" : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    />
                  )}
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