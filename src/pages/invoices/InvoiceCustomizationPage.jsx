import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Save,
  Layout,
  Palette,
  Type,
  Image as ImageIcon,
  RotateCcw,
  Table as TableIcon,
  Grid,
  Move,
  ZoomIn,
  ZoomOut,
  Layers,
  DollarSign,
  ArrowLeft,
  Eye,
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
// HELPER: TAB BUTTON
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

// ============================================
// HELPER: COLOR PICKER (React-Colorful)
// ============================================
const ColorPicker = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popover = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popover.current && !popover.current.contains(event.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <div
          className="relative w-10 h-10 rounded-lg border border-gray-200 shadow-sm cursor-pointer transition-transform hover:scale-105"
          style={{ backgroundColor: value }}
          onClick={() => setIsOpen(!isOpen)}
        />
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">
            #
          </span>
          <input
            type="text"
            value={value.replace("#", "")}
            onChange={(e) => onChange(`#${e.target.value}`)}
            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            maxLength={6}
          />
        </div>
      </div>
      {isOpen && (
        <div
          ref={popover}
          className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <HexColorPicker color={value} onChange={onChange} />
        </div>
      )}
    </div>
  );
};

// ============================================
// HELPER: RANGE SLIDER
// ============================================
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
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium text-sm">
        <Icon size={16} />
        <span>{label}</span>
      </div>
      <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded font-mono">
        {value}
        {suffix}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500 dark:bg-gray-700"
    />
  </div>
);

// ============================================
// HELPER: MODERN SWITCH
// ============================================
const ModernSwitch = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </span>
    <div
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-orange-500" : "bg-gray-300 dark:bg-gray-600"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
    </div>
  </label>
);

// ============================================
// DEFAULT CONFIGURATION
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
    fonts: { body: "Helvetica", heading: "Helvetica", size: 10 },
    watermark: { enabled: false, url: "" },
  },
  layout: {
    borderRadius: 4,
    density: "standard",
    sections: [
      { id: "header", label: "En-tête (Logo)", visible: true, order: 1 },
      { id: "details", label: "Détails (De/À)", visible: true, order: 2 },
      { id: "items", label: "Tableau des articles", visible: true, order: 3 },
      { id: "totals", label: "Totaux & Taxes", visible: true, order: 4 },
      { id: "footer", label: "Pied de page (Termes)", visible: true, order: 5 },
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
      tax: false,
      discount: false,
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
  },
  companyInfo: { displayName: "My Venue" },
  currency: { symbol: "DT", position: "after", code: "TND" },
  paymentTerms: { bankDetails: "" },
};

// ============================================
// MAIN COMPONENT
// ============================================
const InvoiceSettingsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("branding");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Mock Data for Live Preview
  const previewData = {
    invoiceNumber: "INV-2025-001",
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 15).toISOString(),
    recipient: {
      name: "Client Exemple",
      email: "client@example.com",
      phone: "+216 20 000 000",
    },
    items: [
      {
        description: "Location Salle de Conférence",
        quantity: 1,
        rate: 1500,
        amount: 1500,
      },
      {
        description: "Pause Café (Matin)",
        quantity: 50,
        rate: 12,
        amount: 600,
      },
      { description: "Déjeuner Buffet", quantity: 50, rate: 45, amount: 2250 },
    ],
    taxRate: 19,
    discount: 0,
  };

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getSettings();
      const data = response.data || response || {};

      // Deep merge with defaults to handle missing fields in DB
      setSettings((prev) => ({
        ...prev,
        ...data,
        branding: { ...prev.branding, ...(data.branding || {}) },
        layout: { ...prev.layout, ...(data.layout || {}) },
        table: {
          ...prev.table,
          ...(data.table || {}),
          columns: { ...prev.table.columns, ...(data.table?.columns || {}) },
        },
        labels: { ...prev.labels, ...(data.labels || {}) },
        paymentTerms: { ...prev.paymentTerms, ...(data.paymentTerms || {}) },
      }));
    } catch (error) {
      console.error("Fetch error:", error);
      showError(
        t("invoiceCustomization.toasts.loadError", "Failed to load settings.")
      );
    } finally {
      setLoading(false);
    }
  }, [showError, t]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Update Helper
  const updateSetting = (path, value) => {
    setSettings((prev) => {
      const newSettings = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let current = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  // File Upload (Base64)
  const handleFileUpload = (e, fieldPath) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      updateSetting(fieldPath, e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Save
  const handleSave = async () => {
    setSaving(true);
    try {
      await invoiceService.updateSettings(settings);
      showSuccess(
        t("invoiceCustomization.toasts.saveSuccess", "Design enregistré !")
      );
    } catch (error) {
      showError(
        t(
          "invoiceCustomization.toasts.saveError",
          "Erreur lors de l'enregistrement."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // Reorder Sections
  const moveSection = (index, direction) => {
    const sections = [...settings.layout.sections];
    if (direction === "up" && index > 0) {
      [sections[index], sections[index - 1]] = [
        sections[index - 1],
        sections[index],
      ];
    } else if (direction === "down" && index < sections.length - 1) {
      [sections[index], sections[index + 1]] = [
        sections[index + 1],
        sections[index],
      ];
    }
    sections.forEach((s, i) => (s.order = i + 1));
    updateSetting("layout.sections", sections);
  };

  // ✅ INTERACTIVE PREVIEW HANDLER
  // Allows clicking the PDF preview to switch sidebar tabs
  const handlePreviewEdit = (sectionId) => {
    if (sectionId) setActiveTab(sectionId);
  };

  if (loading)
    return (
      <div className="flex h-screen justify-center items-center">
        <OrbitLoader/>
      </div>
    );

  const TABS = [
    {
      id: "branding",
      label: t("invoiceCustomization.tabs.brand", "Branding"),
      icon: Palette,
    },
    {
      id: "layout",
      label: t("invoiceCustomization.tabs.layout", "Mise en page"),
      icon: Layers,
    },
    {
      id: "table",
      label: t("invoiceCustomization.tabs.table", "Tableau"),
      icon: TableIcon,
    },
    {
      id: "style",
      label: t("invoiceCustomization.tabs.style", "Style"),
      icon: Layout,
    },
    {
      id: "text",
      label: t("invoiceCustomization.tabs.content", "Textes"),
      icon: Type,
    },
  ];

  const isRTL = i18n.dir() === "rtl";

  return (
    <div
      className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* LEFT SIDEBAR (CONTROLS) */}
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 shadow-xl max-w-3xl ${isRTL ? "border-l border-r-0" : ""}`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0 bg-white dark:bg-gray-800">
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
                {t("invoiceCustomization.title", "Design Facture")}
              </h1>
              <p className="text-xs text-gray-500">
                {t("invoiceCustomization.subtitle", "Configuration")}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            icon={Save}
            onClick={handleSave}
            loading={saving}
          >
            {t("common.save", "Save")}
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Tabs Sidebar */}
          <div
            className={`w-64 overflow-y-auto p-4 bg-gray-50/50 dark:bg-gray-800/50 shrink-0 ${isRTL ? "border-l" : "border-r"} border-gray-100 dark:border-gray-700`}
          >
            <div className="space-y-1">
              {TABS.map((tab) => (
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

          {/* Form Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {/* BRANDING */}
            {activeTab === "branding" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Palette className="text-orange-500" /> Branding
                </h2>
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Logo
                  </label>
                  <div className="relative h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all flex flex-col items-center justify-center overflow-hidden group">
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={(e) => handleFileUpload(e, "branding.logo.url")}
                      accept="image/*"
                    />
                    {settings.branding.logo.url ? (
                      <img
                        src={settings.branding.logo.url}
                        className="h-full object-contain p-2"
                        alt="Logo"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400 group-hover:text-orange-500">
                        <ImageIcon size={24} />
                        <span className="text-xs font-medium mt-2">
                          Uploader un logo
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ColorPicker
                      label="Couleur Primaire"
                      value={settings.branding.colors.primary}
                      onChange={(v) =>
                        updateSetting("branding.colors.primary", v)
                      }
                    />
                    <ColorPicker
                      label="Couleur Secondaire"
                      value={settings.branding.colors.secondary}
                      onChange={(v) =>
                        updateSetting("branding.colors.secondary", v)
                      }
                    />
                    <ColorPicker
                      label="Couleur Texte"
                      value={settings.branding.colors.text}
                      onChange={(v) => updateSetting("branding.colors.text", v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* LAYOUT */}
            {activeTab === "layout" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Layers className="text-orange-500" /> Sections
                </h2>
                <div className="space-y-3">
                  {settings.layout.sections
                    .sort((a, b) => a.order - b.order)
                    .map((section, index) => (
                      <div
                        key={section.id}
                        className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
                      >
                        <input
                          type="checkbox"
                          checked={section.visible}
                          onChange={() => {
                            const newSections = [...settings.layout.sections];
                            newSections[index].visible =
                              !newSections[index].visible;
                            updateSetting("layout.sections", newSections);
                          }}
                          className="w-5 h-5 text-orange-600 rounded accent-orange-500"
                        />
                        <span className="flex-1 text-sm font-medium text-gray-700 dark:text-white">
                          {section.label}
                        </span>
                        <div className="flex flex-col gap-1">
                          <button
                            disabled={index === 0}
                            onClick={() => moveSection(index, "up")}
                            className="text-gray-400 hover:text-orange-500 disabled:opacity-30"
                          >
                            <Move size={12} className="rotate-180" />
                          </button>
                          <button
                            disabled={
                              index === settings.layout.sections.length - 1
                            }
                            onClick={() => moveSection(index, "down")}
                            className="text-gray-400 hover:text-orange-500 disabled:opacity-30"
                          >
                            <Move size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* TABLE */}
            {activeTab === "table" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TableIcon className="text-orange-500" /> Tableau
                </h2>
                <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                  <ColorPicker
                    label="Fond En-tête"
                    value={
                      settings.table.headerColor ||
                      settings.branding.colors.primary
                    }
                    onChange={(v) => updateSetting("table.headerColor", v)}
                  />
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <ModernSwitch
                      label="Lignes alternées"
                      checked={settings.table.striped}
                      onChange={(e) =>
                        updateSetting("table.striped", e.target.checked)
                      }
                    />
                    <ModernSwitch
                      label="Bords arrondis"
                      checked={settings.table.rounded}
                      onChange={(e) =>
                        updateSetting("table.rounded", e.target.checked)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Colonnes Visibles
                  </label>
                  {Object.entries(settings.table.columns).map(([key, val]) => (
                    <ModernSwitch
                      key={key}
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      checked={val}
                      onChange={(e) =>
                        updateSetting(`table.columns.${key}`, e.target.checked)
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* STYLE */}
            {activeTab === "style" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Layout className="text-orange-500" /> Apparence
                </h2>
                <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
                  <RangeSlider
                    label="Taille Police"
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
                  <div className="h-px bg-gray-100 dark:bg-gray-700"></div>
                  <RangeSlider
                    label="Arrondi"
                    icon={Grid}
                    value={settings.layout.borderRadius}
                    min={0}
                    max={24}
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
              </div>
            )}

            {/* TEXT & LABELS */}
            {activeTab === "text" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Type className="text-orange-500" /> Textes & Labels
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {["invoiceTitle", "from", "to", "item", "total"].map(
                    (label) => (
                      <Input
                        key={label}
                        label={label.toUpperCase()}
                        value={settings.labels[label]}
                        onChange={(e) =>
                          updateSetting(`labels.${label}`, e.target.value)
                        }
                      />
                    )
                  )}
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                    <DollarSign size={14} /> Instructions de Paiement
                  </label>
                  <textarea
                    rows={4}
                    value={settings.paymentTerms.bankDetails}
                    onChange={(e) =>
                      updateSetting("paymentTerms.bankDetails", e.target.value)
                    }
                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    placeholder="RIB, IBAN, etc."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: PDF PREVIEW */}
      <div
        className={`hidden lg:flex flex-1 bg-gray-900 flex-col overflow-hidden ${isRTL ? "border-r" : "border-l"} border-gray-700`}
      >
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-700 bg-gray-900 shrink-0">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Aperçu en direct
          </span>
          <div className="text-gray-500 text-xs flex items-center gap-2">
            <Eye size={14} /> Live Preview
          </div>
        </div>

        {/* 
           Using PDF-based Live Preview instead of HTML for 100% consistency.
           The onEditSection prop enables "Click-to-edit" feature.
        */}
        <div className="flex-1 w-full h-full bg-gray-800 p-8">
          <LiveInvoicePreview
            settings={settings}
            data={previewData}
            onEditSection={handlePreviewEdit} // ✅ Pass interactive handler
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceSettingsPage;
