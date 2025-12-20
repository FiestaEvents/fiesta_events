import React from "react";
import { useTranslation } from "react-i18next";
import { User, Lock, Building2, CheckCircle2, Grid3x3 } from "lucide-react";

export const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group inline-flex items-center gap-2.5 px-5 py-3.5 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200
      ${
        active
          ? "border-orange-500 text-orange-600 dark:text-orange-400"
          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
  >
    <Icon
      size={18}
      className={
        active
          ? "text-orange-500 dark:text-orange-400"
          : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400"
      }
    />
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
  darkMode = false,
}) => {
  const { t } = useTranslation();

  const defaultTabs = [
    {
      id: "personal",
      label: t("venueSettings.tabs.personal") || "Personal",
      icon: User,
    },
    {
      id: "security",
      label: t("venueSettings.tabs.security") || "Security",
      icon: Lock,
    },
    {
      id: "venue",
      label: t("venueSettings.tabs.venue") || "Venue",
      icon: Building2,
    },
    {
      id: "amenities",
      label: t("venueSettings.tabs.amenities") || "Amenities",
      icon: CheckCircle2,
    },
    {
      id: "spaces",
      label: t("venueSettings.tabs.spaces") || "Spaces",
      icon: Grid3x3,
    },
  ];

  const displayTabs = tabs.length > 0 ? tabs : defaultTabs;

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-white"}`}>
      <div
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} border-b sticky top-0 z-20`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
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

          <div className="flex space-x-1 overflow-x-auto scrollbar-hide -mb-px">
            {displayTabs.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                icon={tab.icon}
                label={tab.label}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};

export default SettingsLayout;
