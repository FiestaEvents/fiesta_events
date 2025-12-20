import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileSignature, 
  Receipt, 
  ArrowRight, 
  Palette, 
  Scale, 
  Settings,
  CheckCircle2
} from "lucide-react";
import { useTranslation } from "react-i18next";

const DocumentsSettings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

// Reusable Option Card Component
const SettingOptionCard = ({ icon: Icon, title, description, features, onClick, colorClass }) => (
  <div 
    onClick={onClick}
    className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 cursor-pointer overflow-hidden"
  >
    {/* Hover Gradient Effect */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-gray-50 dark:to-gray-700 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-500" />

    <div className="relative z-10">
      {/* Icon Header */}
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon size={32} className={colorClass.replace("bg-", "text-")} />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 transition-colors">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed min-h-[40px]">
        {description}
      </p>

      {/* Feature List */}
      <ul className="space-y-2 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <CheckCircle2 size={14} className="text-green-500" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Call to Action */}
      <div className="flex items-center gap-2 text-sm font-bold text-orange-600 group-hover:translate-x-2 transition-transform duration-300">
        {t("documents.hub.configureNow", "Configure Now")} <ArrowRight size={16} />
      </div>
    </div>
  </div>
);


  return (
    <div className="min-h-full bg-white rounded-lg dark:bg-gray-900 p-6 font-sans hide-scrollbar">
      <div className="max-w-5xl mx-auto py-12">
        
        {/* Page Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {t("documents.hub.title", "Document Configuration")}
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            {t("documents.hub.subtitle", "Customize the design, structure, and legal terms for your generated documents. Choose a module to start.")}
          </p>
        </div>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1. CONTRACTS OPTION */}
          <SettingOptionCard 
            icon={FileSignature}
            title={t("documents.hub.contracts.title", "Contract Settings")}
            description={t("documents.hub.contracts.desc", "Manage legal agreements, clauses, and digital signature workflows.")}
            colorClass="bg-blue-500 text-blue-600"
            onClick={() => navigate("/contracts/settings")}
            features={[
              t("documents.hub.contracts.feat1", "Custom Branding & Colors"),
              t("documents.hub.contracts.feat2", "Legal Clauses & Jurisdiction"),
              t("documents.hub.contracts.feat3", "Numbering Structure (CTR-...)")
            ]}
          />

          {/* 2. INVOICES OPTION */}
          <SettingOptionCard 
            icon={Receipt}
            title={t("documents.hub.invoices.title", "Invoice Settings")}
            description={t("documents.hub.invoices.desc", "Configure billing layouts, tax rates, and payment terms.")}
            colorClass="bg-emerald-500 text-emerald-600"
            onClick={() => navigate("/invoices/settings")}
            features={[
              t("documents.hub.invoices.feat1", "Tax Rates & Currency"),
              t("documents.hub.invoices.feat2", "Bank Details & Footer"),
              t("documents.hub.invoices.feat3", "Numbering Structure (INV-...)")
            ]}
          />

        </div>

      </div>
    </div>
  );
};

export default DocumentsSettings;