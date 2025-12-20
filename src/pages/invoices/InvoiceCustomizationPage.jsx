import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Save,
  Layout,
  Palette,
  Type,
  Image as ImageIcon,
  Table as TableIcon,
  Grid,
  Eye,
  Layers,
  DollarSign,
  ArrowLeft,
  Move,
} from "lucide-react";
import { HexColorPicker } from "react-colorful";

// Services & API
import { invoiceService } from "../../api/index";
import { useToast } from "../../hooks/useToast";

// Components
import Button from "../../components/common/Button";
import OrbitLoader from "../../components/common/LoadingSpinner";
import Input from "../../components/common/Input";
import LiveInvoicePreview from "./LiveInvoicePreview";

// ============================================
// 0. DEFAULTS & UTILITIES
// ============================================

const DEFAULT_SETTINGS = {
  branding: {
    logo: { url: "", width: 150, height: 60 },
    colors: {
      primary: "#F18237",
      secondary: "#374151",
      text: "#1F2937",
      background: "#FFFFFF",
    },
    fonts: { body: "Helvetica", size: 10 },
    watermark: { enabled: false, url: "" },
  },
  layout: {
    template: "modern",
    density: "standard",
    borderRadius: 4,
    sections: [
      { id: "header", label: "En-tête", visible: true, order: 1 },
      { id: "details", label: "Détails (De/À)", visible: true, order: 2 },
      { id: "items", label: "Tableau Articles", visible: true, order: 3 },
      { id: "totals", label: "Totaux", visible: true, order: 4 },
      { id: "footer", label: "Pied de page", visible: true, order: 5 },
    ],
  },
  table: {
    headerColor: "#F18237",
    striped: false,
    rounded: true,
    columns: {
      description: true,
      quantity: true,
      rate: true,
      discount: false,
      tax: false,
      total: true,
    },
  },
  labels: {
    invoiceTitle: "FACTURE",
    from: "De",
    to: "À",
    item: "Description",
    quantity: "Qté",
    rate: "Prix",
    total: "Total",
    paymentInstructions: "Instructions de paiement",
  },
  paymentTerms: {
    bankDetails: "",
    terms: "",
  },
};

// Robust Deep Merge
const deepMerge = (target, source) => {
  if (!source) return target;
  const output = { ...target };

  Object.keys(target).forEach((key) => {
    if (source[key] === undefined) return;
    if (
      typeof target[key] === "object" &&
      target[key] !== null &&
      !Array.isArray(target[key])
    ) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  });

  Object.keys(source).forEach((key) => {
    if (output[key] === undefined) output[key] = source[key];
  });

  return output;
};

// ============================================
// 1. SUB-COMPONENTS
// ============================================

const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all w-full text-left ${
      active
        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 shadow-sm ring-1 ring-orange-200 dark:ring-orange-800"
        : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
    }`}
  >
    <Icon size={18} className="shrink-0" />
    <span>{label}</span>
  </button>
);

const ColorPicker = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popover = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popover.current && !popover.current.contains(e.target))
        setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative">
      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:scale-105 transition-transform"
          style={{ backgroundColor: value || "#fff" }}
          onClick={() => setIsOpen(!isOpen)}
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      {isOpen && (
        <div
          ref={popover}
          className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-xl border border-gray-200"
        >
          <HexColorPicker color={value || "#fff"} onChange={onChange} />
        </div>
      )}
    </div>
  );
};

const RangeSlider = ({
  label,
  icon: Icon,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center text-sm font-medium text-gray-700 dark:text-gray-300">
      <div className="flex items-center gap-2">
        <Icon size={16} /> <span>{label}</span>
      </div>
      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">
        {value}
        {suffix}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value || min}
      onChange={onChange}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
    />
  </div>
);

const ModernSwitch = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </span>
    <div
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-orange-500" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
      <input
        type="checkbox"
        checked={checked || false}
        onChange={onChange}
        className="hidden"
      />
    </div>
  </label>
);

// ============================================
// 2. CUSTOM HOOK (LOGIC)
// ============================================
const useInvoiceSettings = (t, showSuccess, showError) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await invoiceService.getSettings();
      const rawData = res.data || res || {};
      const mergedSettings = deepMerge(DEFAULT_SETTINGS, rawData);

      if (
        !mergedSettings.layout.sections ||
        mergedSettings.layout.sections.length === 0
      ) {
        mergedSettings.layout.sections = DEFAULT_SETTINGS.layout.sections;
      }

      setSettings(mergedSettings);
    } catch (err) {
      console.error(err);
      showError(t("invoiceCustomization.toasts.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t, showError]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = useCallback((path, value) => {
    setSettings((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let current = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const reorderSections = useCallback((newVisibleOrder) => {
    setSettings((prev) => {
      const orderMap = {};
      newVisibleOrder.forEach((item, index) => {
        orderMap[item.id] = index + 1;
      });
      const updatedSections = (
        prev.layout.sections || DEFAULT_SETTINGS.layout.sections
      ).map((section) => {
        if (orderMap[section.id] !== undefined) {
          return { ...section, order: orderMap[section.id] };
        }
        return section;
      });
      return { ...prev, layout: { ...prev.layout, sections: updatedSections } };
    });
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await invoiceService.updateSettings(settings);
      showSuccess(t("invoiceCustomization.toasts.saveSuccess"));
    } catch (err) {
      showError(t("invoiceCustomization.toasts.saveError"));
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    loading,
    saving,
    updateSetting,
    saveSettings,
    reorderSections,
  };
};

// ============================================
// 3. MAIN COMPONENT
// ============================================
const InvoiceCustomizationPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState("branding");
  const isRTL = i18n.dir() === "rtl";

  const {
    settings,
    loading,
    saving,
    updateSetting,
    saveSettings,
    reorderSections,
  } = useInvoiceSettings(t, showSuccess, showError);

  const previewData = {
    invoiceNumber: "INV-001",
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 15).toISOString(),
    recipient: {
      name: "Client Test",
      email: "client@test.com",
      phone: "+216 20 000 000",
    },
    items: [
      { description: "Location Salle", quantity: 1, rate: 1500, amount: 1500 },
      { description: "Traiteur", quantity: 50, rate: 25, amount: 1250 },
    ],
    taxRate: 19,
    discount: 0,
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) =>
        updateSetting("branding.logo.url", ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <OrbitLoader />
      </div>
    );
  if (!settings) return null;

  return (
    <div
      className="flex h-full bg-white dark:bg-gray-900 overflow-hidden font-sans"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* --- LEFT SIDEBAR: CONTROLS --- */}
      <div
        className={`flex-1 flex flex-col h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 shadow-xl max-w-2xl lg:max-w-xl ${isRTL ? "border-l border-r-0" : ""}`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/invoices")}
              className="p-2 h-auto"
            >
              <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
            </Button>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-lg">
                {t("invoiceCustomization.title")}
              </h1>
            </div>
          </div>
          <Button
            variant="primary"
            icon={Save}
            onClick={saveSettings}
            loading={saving}
          >
            {t("common.save")}
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Tabs */}
          <div
            className={`w-20 md:w-64 overflow-y-auto p-4 bg-white dark:bg-gray-800/50 shrink-0 ${isRTL ? "border-l" : "border-r"} border-gray-100 dark:border-gray-700`}
          >
            <div className="space-y-1">
              {[
                {
                  id: "branding",
                  label: t("invoiceCustomization.tabs.branding"),
                  icon: Palette,
                },
                {
                  id: "layout",
                  label: t("invoiceCustomization.tabs.layout"),
                  icon: Layers,
                },
                {
                  id: "table",
                  label: t("invoiceCustomization.tabs.table"),
                  icon: TableIcon,
                },
                {
                  id: "style",
                  label: t("invoiceCustomization.tabs.style"),
                  icon: Layout,
                },
                {
                  id: "text",
                  label: t("invoiceCustomization.tabs.text"),
                  icon: Type,
                },
              ].map((tab) => (
                <TabButton
                  key={tab.id}
                  active={activeTab === tab.id}
                  icon={tab.icon}
                  label={<span className="hidden md:inline">{tab.label}</span>}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === "branding" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    {t("invoiceCustomization.branding.logo")}
                  </label>
                  <div className="relative h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-orange-50 transition-colors flex flex-col items-center justify-center group overflow-hidden">
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={handleLogoUpload}
                      accept="image/*"
                    />
                    {settings?.branding?.logo?.url ? (
                      <img
                        src={settings.branding.logo.url}
                        className="h-full object-contain p-2"
                        alt="Logo"
                      />
                    ) : (
                      <div className="text-gray-400 flex flex-col items-center">
                        <ImageIcon size={24} />
                        <span className="text-xs mt-2">
                          {t("invoiceCustomization.branding.uploadLogo")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <ColorPicker
                    label={t("invoiceCustomization.branding.primaryColor")}
                    value={settings?.branding?.colors?.primary}
                    onChange={(v) =>
                      updateSetting("branding.colors.primary", v)
                    }
                  />
                  <ColorPicker
                    label={t("invoiceCustomization.branding.secondaryColor")}
                    value={settings?.branding?.colors?.secondary}
                    onChange={(v) =>
                      updateSetting("branding.colors.secondary", v)
                    }
                  />
                </div>
              </div>
            )}

            {activeTab === "layout" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-lg flex gap-2">
                  <Move size={16} />{" "}
                  <span>{t("invoiceCustomization.layout.dragDropHint")}</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {t("invoiceCustomization.layout.visibleElements")}
                  </h3>
                  {settings.layout.sections
                    .sort((a, b) => a.order - b.order)
                    .map((section, idx) => (
                      <ModernSwitch
                        key={section.id || idx}
                        label={t(
                          `invoiceCustomization.sections.${section.id}`,
                          section.label
                        )}
                        checked={section.visible}
                        onChange={() => {
                          const newSections = [...settings.layout.sections];
                          const originalIdx = newSections.findIndex(
                            (s) => s.id === section.id
                          );
                          if (originalIdx >= 0) {
                            newSections[originalIdx].visible =
                              !newSections[originalIdx].visible;
                            updateSetting("layout.sections", newSections);
                          }
                        }}
                      />
                    ))}
                </div>
              </div>
            )}

            {activeTab === "table" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-4">
                  <ColorPicker
                    label={t("invoiceCustomization.table.headerColor")}
                    value={settings.table.headerColor}
                    onChange={(v) => updateSetting("table.headerColor", v)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <ModernSwitch
                      label={t("invoiceCustomization.table.striped")}
                      checked={settings.table.striped}
                      onChange={(e) =>
                        updateSetting("table.striped", e.target.checked)
                      }
                    />
                    <ModernSwitch
                      label={t("invoiceCustomization.table.rounded")}
                      checked={settings.table.rounded}
                      onChange={(e) =>
                        updateSetting("table.rounded", e.target.checked)
                      }
                    />
                  </div>
                </div>
                <hr className="border-gray-100 dark:border-gray-700" />
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-500 uppercase">
                    {t("invoiceCustomization.table.columns")}
                  </h3>
                  {Object.entries(settings.table.columns).map(([key, val]) => (
                    <ModernSwitch
                      key={key}
                      label={t(`invoiceCustomization.columns.${key}`, key)}
                      checked={val}
                      onChange={(e) =>
                        updateSetting(`table.columns.${key}`, e.target.checked)
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "style" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <RangeSlider
                  label={t("invoiceCustomization.style.fontSize")}
                  icon={Type}
                  value={settings.branding.fonts.size}
                  min={8}
                  max={14}
                  step={1}
                  suffix="px"
                  onChange={(e) =>
                    updateSetting(
                      "branding.fonts.size",
                      parseInt(e.target.value)
                    )
                  }
                />
                <RangeSlider
                  label={t("invoiceCustomization.style.borderRadius")}
                  icon={Grid}
                  value={settings.layout.borderRadius}
                  min={0}
                  max={20}
                  step={2}
                  suffix="px"
                  onChange={(e) =>
                    updateSetting(
                      "layout.borderRadius",
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>
            )}

            {activeTab === "text" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 gap-4">
                  {["invoiceTitle", "from", "to", "item", "total"].map(
                    (field) => (
                      <Input
                        key={field}
                        label={t(
                          `invoiceCustomization.labels.${field}`,
                          field.toUpperCase()
                        )}
                        value={settings.labels[field]}
                        onChange={(e) =>
                          updateSetting(`labels.${field}`, e.target.value)
                        }
                      />
                    )
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                    <DollarSign size={14} />{" "}
                    {t("invoiceCustomization.text.paymentInstructions")}
                  </label>
                  <textarea
                    rows={4}
                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500"
                    value={settings.paymentTerms?.bankDetails || ""}
                    onChange={(e) =>
                      updateSetting("paymentTerms.bankDetails", e.target.value)
                    }
                    placeholder={t(
                      "invoiceCustomization.text.paymentPlaceholder"
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDEBAR: LIVE PREVIEW --- */}
      <div
        className={`hidden lg:flex flex-1 bg-gray-900 flex-col overflow-hidden ${isRTL ? "border-r" : "border-l"} border-gray-700`}
      >
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-700 bg-gray-900 shrink-0">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />{" "}
            {t("invoiceCustomization.livePreview")}
          </span>
          <div className="text-gray-500 text-xs flex items-center gap-2">
            <Eye size={14} /> {t("invoiceCustomization.interactiveMode")}
          </div>
        </div>

        <div className="flex-1 w-full h-full bg-gray-800 p-8 overflow-auto">
          <LiveInvoicePreview
            settings={settings}
            data={previewData}
            onEditSection={(section) => setActiveTab(section)}
            onReorder={reorderSections}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceCustomizationPage;
