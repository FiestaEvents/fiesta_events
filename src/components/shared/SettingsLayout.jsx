import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";

// Individual Tab Button
export const TabButton = ({ active, icon: Icon, label, onClick, darkMode }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group inline-flex items-center gap-2.5 px-5 py-3.5 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200
      ${
        active
          ? "border-orange-500 text-orange-600 dark:text-orange-400"
          : `border-transparent ${darkMode ? "text-gray-400 hover:text-gray-300 hover:border-gray-700" : "text-gray-500 hover:text-gray-700 hover:border-gray-300"}`
      }`}
  >
    {Icon && (
      <Icon
        size={18}
        className={
          active
            ? "text-orange-500 dark:text-orange-400"
            : `${darkMode ? "text-gray-500 group-hover:text-gray-400" : "text-gray-400 group-hover:text-gray-500"}`
        }
      />
    )}
    {label}
  </button>
);

const SettingsLayout = ({
  children,
  title,
  subtitle,
  tabs = [],
  activeTab,
  setActiveTab,
  darkMode = false, // ✅ Ensure this prop is received
}) => {
  return (
    // ✅ Main Wrapper: Apply Dark Background Here
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Header Section */}
      <div
        className={`border-b sticky top-0 z-20 transition-colors duration-300 ${
          darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title Area */}
          <div className="py-8">
            <h1
              className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              {title}
            </h1>
            <p
              className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              {subtitle}
            </p>
          </div>

          {/* Navigation Tabs */}
          {tabs.length > 0 && (
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide -mb-px">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  active={activeTab === tab.id}
                  icon={tab.icon}
                  label={tab.label}
                  onClick={() => setActiveTab(tab.id)}
                  darkMode={darkMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};

export default SettingsLayout;
