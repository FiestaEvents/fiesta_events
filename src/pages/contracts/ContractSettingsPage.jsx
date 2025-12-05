import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Palette,
  Type,
  Building2,
  Shield,
  Plus,
  Trash2,
  GripVertical,
  Receipt,
  Scale,
  Eye,
  Layout,
  Hash,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { HexColorPicker } from "react-colorful";

// Services
import { contractService } from "../../api/index";

// Components
import Button from "../../components/common/Button";
import OrbitLoader from "../../components/common/LoadingSpinner";
import LiveContractPreview from "./LiveContractPreview";

// Hooks
import { useToast } from "../../hooks/useToast";

// ==========================================
// 1. SUB-COMPONENTS
// ==========================================

const SectionCard = ({ title, icon: Icon, children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6 ${className}`}
  >
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-2">
      {Icon && <Icon size={18} className="text-orange-600" />}
      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
        {title}
      </h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all w-full text-left mb-1 ${
      active
        ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-800"
        : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
    }`}
  >
    <Icon
      size={18}
      className={`shrink-0 ${active ? "text-orange-600" : "text-gray-400"}`}
    />
    <span>{label}</span>
  </button>
);

const StyledInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className = "",
  dir = "ltr",
  step,
}) => (
  <div className={className}>
    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    <input
      type={type}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      dir={dir}
      step={step}
      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 outline-none transition-all placeholder:text-gray-400"
    />
  </div>
);

const ColorPicker = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith("#")) val = "#" + val;
    onChange(val);
  };

  return (
    <div className="relative">
      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-sm shrink-0 ring-2 ring-transparent hover:ring-orange-200 dark:hover:ring-orange-800 transition-all cursor-pointer focus:outline-none focus:ring-orange-400"
          style={{ backgroundColor: value || "#ffffff" }}
          aria-label={`Select ${label} color`}
        />
        <input
          type="text"
          value={value || ""}
          onChange={handleInputChange}
          placeholder="#000000"
          className="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono uppercase bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
        />
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 mt-2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200"
        >
          <HexColorPicker color={value || "#ffffff"} onChange={onChange} />
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Presets
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "#F18237",
                "#EF4444",
                "#F59E0B",
                "#10B981",
                "#3B82F6",
                "#8B5CF6",
                "#EC4899",
                "#1F2937",
                "#374151",
                "#6B7280",
                "#9CA3AF",
                "#FFFFFF",
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    onChange(preset);
                    setIsOpen(false);
                  }}
                  className={`w-6 h-6 rounded-md border-2 transition-transform hover:scale-110 ${
                    value === preset
                      ? "border-orange-500 ring-2 ring-orange-200"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                  style={{ backgroundColor: preset }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. DEFAULT SETTINGS & UTILS
// ==========================================

const DEFAULT_SETTINGS = {
  companyInfo: {
    legalName: "",
    displayName: "",
    matriculeFiscale: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    rib: "",
    bankName: "",
    legalRepresentative: "",
  },
  branding: {
    logo: { url: "", width: 150, height: 50 },
    colors: {
      primary: "#F18237",
      secondary: "#374151",
      accent: "#3B82F6",
      text: "#1F2937",
      background: "#FFFFFF",
    },
    fonts: { heading: "Helvetica-Bold", body: "Helvetica", size: 11 },
    watermark: { enabled: false, text: "", opacity: 0.1 },
  },
  layout: {
    template: "professional",
    paperSize: "A4",
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    headerHeight: 80,
    footerHeight: 60,
    showPageNumbers: true,
    showDate: true,
  },
  blockOrder: [
    "header",
    "parties",
    "scope",
    "financials",
    "clauses",
    "signatures",
    "footer",
  ],
  financialDefaults: {
    currency: "TND",
    defaultVatRate: 19,
    defaultStampDuty: 1.0,
    depositPercentage: 30,
    depositRequired: true,
    securityDepositAmount: 1000,
    paymentMethods: ["Virement", "Chèque", "Espèces"],
    lateFeePercentage: 0,
  },
  defaultSections: [],
  defaultCancellationPolicy: {
    enabled: true,
    tiers: [],
  },
  labels: {
    contractTitle: "CONTRAT DE PRESTATION",
    partiesTitle: "ENTRE LES SOUSSIGNÉS",
    serviceProvider: "Le Prestataire",
    clientLabel: "Le Client",
    partnerLabel: "Le Partenaire",
    servicesTitle: "OBJET DU CONTRAT",
    paymentTitle: "MODALITÉS DE PAIEMENT",
    signaturesTitle: "SIGNATURES",
    dateLabel: "Fait à Tunis, le",
    signatureLabel: "Lu et approuvé",
  },
  structure: {
    prefix: "CTR",
    separator: "-",
    includeYear: true,
    yearFormat: "YYYY",
    sequenceDigits: 4,
    resetSequenceYearly: true,
  },
  signatureSettings: {
    requireBothParties: true,
    allowElectronicSignature: true,
    signatureExpiryDays: 7,
    autoArchiveAfter: 365,
  },
  emailTemplates: {
    sendContract: { subject: "Contrat à signer - {{eventTitle}}", body: "" },
    reminder: { subject: "Rappel : Contrat en attente", body: "" },
    signed: { subject: "Contrat signé - {{contractNumber}}", body: "" },
  },
};

const extractSettingsFromResponse = (response) => {
  if (
    response?.message?.settings &&
    typeof response.message.settings === "object"
  ) {
    return response.message.settings;
  }
  if (response?.data?.settings && typeof response.data.settings === "object") {
    return response.data.settings;
  }
  if (response?.settings && typeof response.settings === "object") {
    return response.settings;
  }
  if (
    response?.data?.data?.settings &&
    typeof response.data.data.settings === "object"
  ) {
    return response.data.data.settings;
  }
  return {};
};

const isObject = (item) =>
  item && typeof item === "object" && !Array.isArray(item);

const deepMerge = (target, source) => {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = deepMerge(target[key], source[key]);
      } else if (source[key] !== undefined && source[key] !== null) {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};

// ==========================================
// 3. MAIN PAGE COMPONENT
// ==========================================

const ContractSettingsPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { showSuccess, showError, apiError } = useToast();

  const [activeTab, setActiveTab] = useState("company");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  // --- FETCH SETTINGS ---
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contractService.getSettings();
      const dbSettings = extractSettingsFromResponse(response);

      if (!dbSettings || Object.keys(dbSettings).length === 0) {
        setSettings(DEFAULT_SETTINGS);
        return;
      }

      const mergedSettings = {
        companyInfo: deepMerge(
          DEFAULT_SETTINGS.companyInfo,
          dbSettings.companyInfo || {}
        ),
        branding: deepMerge(
          DEFAULT_SETTINGS.branding,
          dbSettings.branding || {}
        ),
        layout: deepMerge(DEFAULT_SETTINGS.layout, dbSettings.layout || {}),
        financialDefaults: deepMerge(
          DEFAULT_SETTINGS.financialDefaults,
          dbSettings.financialDefaults || {}
        ),
        defaultSections:
          Array.isArray(dbSettings.defaultSections) &&
          dbSettings.defaultSections.length > 0
            ? dbSettings.defaultSections
            : DEFAULT_SETTINGS.defaultSections,
        defaultCancellationPolicy: {
          enabled:
            dbSettings.defaultCancellationPolicy?.enabled ??
            DEFAULT_SETTINGS.defaultCancellationPolicy.enabled,
          tiers:
            Array.isArray(dbSettings.defaultCancellationPolicy?.tiers) &&
            dbSettings.defaultCancellationPolicy.tiers.length > 0
              ? dbSettings.defaultCancellationPolicy.tiers
              : DEFAULT_SETTINGS.defaultCancellationPolicy.tiers,
        },
        labels: deepMerge(DEFAULT_SETTINGS.labels, dbSettings.labels || {}),
        structure: deepMerge(
          DEFAULT_SETTINGS.structure,
          dbSettings.structure || {}
        ),
        signatureSettings: deepMerge(
          DEFAULT_SETTINGS.signatureSettings,
          dbSettings.signatureSettings || {}
        ),
        emailTemplates: deepMerge(
          DEFAULT_SETTINGS.emailTemplates,
          dbSettings.emailTemplates || {}
        ),
      };

      setSettings(mergedSettings);
      setHasChanges(false);
    } catch (err) {
      console.error("Error fetching settings:", err);
      apiError(err, t("contracts.settings.messages.loadError"));
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, [t, apiError]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // --- UPDATE HELPER ---
  const updateSettings = useCallback((path, value) => {
    setSettings((prev) => {
      const keys = path.split(".");
      const newSettings = JSON.parse(JSON.stringify(prev));
      let current = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
    setHasChanges(true);
  }, []);

  const handleLayoutReorder = useCallback(
    (newOrder) => {
      updateSettings("layout.blockOrder", newOrder);
    },
    [updateSettings]
  );

  // --- SAVE ---
  const handleSave = async () => {
    try {
      setSaving(true);
      const cleanSettings = {
        companyInfo: settings.companyInfo,
        branding: settings.branding,
        layout: settings.layout,
        financialDefaults: settings.financialDefaults,
        defaultSections: settings.defaultSections,
        defaultCancellationPolicy: settings.defaultCancellationPolicy,
        labels: settings.labels,
        structure: settings.structure,
        signatureSettings: settings.signatureSettings,
        emailTemplates: settings.emailTemplates,
      };

      await contractService.updateSettings(cleanSettings);
      showSuccess(t("contracts.settings.messages.saveSuccess"));
      setHasChanges(false);
    } catch (err) {
      apiError(err, t("contracts.settings.messages.saveError"));
    } finally {
      setSaving(false);
    }
  };

  // --- PREVIEW ID ---
  const getPreviewId = useCallback(() => {
    const s = settings.structure || DEFAULT_SETTINGS.structure;
    const date = new Date();
    const year =
      s.yearFormat === "YY"
        ? date.getFullYear().toString().slice(-2)
        : date.getFullYear();
    const sequence = "1".padStart(s.sequenceDigits || 4, "0");
    let id = s.prefix || "CTR";
    if (s.separator) id += s.separator;
    if (s.includeYear) {
      id += year;
      if (s.separator) id += s.separator;
    }
    id += sequence;
    return id;
  }, [settings.structure]);

  // --- PREVIEW HANDLER (FIXED) ---
  const handlePreviewEdit = useCallback((sectionId) => {
    if (sectionId) {
      setActiveTab(sectionId);
    }
  }, []);

  // --- SECTIONS HELPERS ---
  const addSection = useCallback(() => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: "",
      content: "",
      type: "custom",
      order: (settings.defaultSections?.length || 0) + 1,
      isRequired: false,
      isDefault: true,
    };
    updateSettings("defaultSections", [
      ...(settings.defaultSections || []),
      newSection,
    ]);
  }, [settings.defaultSections, updateSettings]);

  const updateSection = useCallback(
    (index, field, value) => {
      const sections = [...(settings.defaultSections || [])];
      sections[index] = { ...sections[index], [field]: value };
      updateSettings("defaultSections", sections);
    },
    [settings.defaultSections, updateSettings]
  );

  const removeSection = useCallback(
    (index) => {
      updateSettings(
        "defaultSections",
        settings.defaultSections.filter((_, i) => i !== index)
      );
    },
    [settings.defaultSections, updateSettings]
  );

  const onDragEnd = useCallback(
    (result) => {
      if (!result.destination) return;
      const items = Array.from(settings.defaultSections);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      const reordered = items.map((item, idx) => ({ ...item, order: idx + 1 }));
      updateSettings("defaultSections", reordered);
    },
    [settings.defaultSections, updateSettings]
  );

  // --- CANCELLATION HELPERS ---
  const addCancellationTier = useCallback(() => {
    const tiers = [...(settings.defaultCancellationPolicy?.tiers || [])];
    tiers.push({ daysBeforeEvent: 30, penaltyPercentage: 50, description: "" });
    updateSettings("defaultCancellationPolicy.tiers", tiers);
  }, [settings.defaultCancellationPolicy?.tiers, updateSettings]);

  const updateCancellationTier = useCallback(
    (index, field, value) => {
      const tiers = [...(settings.defaultCancellationPolicy?.tiers || [])];
      tiers[index] = { ...tiers[index], [field]: value };
      updateSettings("defaultCancellationPolicy.tiers", tiers);
    },
    [settings.defaultCancellationPolicy?.tiers, updateSettings]
  );

  const removeCancellationTier = useCallback(
    (index) => {
      updateSettings(
        "defaultCancellationPolicy.tiers",
        settings.defaultCancellationPolicy.tiers.filter((_, i) => i !== index)
      );
    },
    [settings.defaultCancellationPolicy?.tiers, updateSettings]
  );

  // --- MOCK DATA FOR PREVIEW ---
  const previewData = {
    contractNumber: getPreviewId(),
    title: "Mariage Mr & Mme X",
    contractType: "client",
    party: {
      name: "Client Exemple",
      type: "individual",
      identifier: "00000000",
      address: "123 Rue de l'Exemple",
      representative: "Mr. Foulen",
    },
    logistics: {
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      checkInTime: "10:00",
      checkOutTime: "00:00",
    },
    financials: {
      amountHT: 1000,
      vatRate: settings.financialDefaults?.defaultVatRate || 19,
      taxAmount:
        (1000 * (settings.financialDefaults?.defaultVatRate || 19)) / 100,
      stampDuty: settings.financialDefaults?.defaultStampDuty || 1.0,
      totalTTC: 1200, // Approximate
    },
    paymentTerms: {
      depositAmount:
        (1000 * (settings.financialDefaults?.depositPercentage || 30)) / 100,
    },
    legal: { jurisdiction: "Tribunal de Tunis", specialConditions: "..." },
    services: [
      { description: "Location Salle", quantity: 1, rate: 800, amount: 800 },
      { description: "Traiteur", quantity: 20, rate: 10, amount: 200 },
    ],
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <OrbitLoader />
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            {t("contracts.settings.loading")}
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "company",
      label: t("contracts.settings.tabs.company"),
      icon: Building2,
    },
    {
      id: "structure",
      label: t("contracts.settings.tabs.structure"),
      icon: Hash,
    },
    {
      id: "branding",
      label: t("contracts.settings.tabs.branding"),
      icon: Palette,
    },
    {
      id: "financials",
      label: t("contracts.settings.tabs.financials"),
      icon: Receipt,
    },
    { id: "layout", label: t("contracts.settings.tabs.layout"), icon: Layout },
    {
      id: "sections",
      label: t("contracts.settings.tabs.clauses"),
      icon: Scale,
    },
    {
      id: "cancellation",
      label: t("contracts.settings.tabs.cancellation"),
      icon: Shield,
    },
    { id: "labels", label: t("contracts.settings.tabs.labels"), icon: Type },
  ];

  const isRTL = i18n.dir() === "rtl";

  return (
    <div
      className="flex h-full bg-white dark:bg-gray-900 overflow-hidden font-sans"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* LEFT COLUMN: SETTINGS */}
      <div
        className={`flex-1 flex flex-col h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 shadow-xl max-w-3xl ${isRTL ? "border-l border-r-0" : ""}`}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0 bg-white dark:bg-gray-800 z-20">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/contracts")}>
              <ArrowLeft size={20} className={isRTL ? "rotate-180" : ""} />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                {t("contracts.settings.title")}
              </h1>
              <p className="text-xs text-gray-500">
                {hasChanges && <span className="text-orange-500 mr-2">●</span>}
                {t("contracts.settings.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={fetchSettings} disabled={loading}>
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </Button>
            <Button
              variant="primary"
              icon={Save}
              onClick={handleSave}
              loading={saving}
              disabled={!hasChanges}
            >
              {t("contracts.settings.save")}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div
            className={`w-64 overflow-y-auto p-4 bg-white dark:bg-gray-900/50 shrink-0 ${isRTL ? "border-l" : "border-r"} border-gray-200 dark:border-gray-700`}
          >
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                icon={tab.icon}
                label={tab.label}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-8 relative">
            {activeTab === "company" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <SectionCard
                  title={t("contracts.settings.company.title")}
                  icon={Building2}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StyledInput
                      label={t("contracts.settings.company.legalName")}
                      value={settings.companyInfo?.legalName}
                      onChange={(e) =>
                        updateSettings("companyInfo.legalName", e.target.value)
                      }
                    />
                    <StyledInput
                      label={t("contracts.settings.company.displayName")}
                      value={settings.companyInfo?.displayName}
                      onChange={(e) =>
                        updateSettings(
                          "companyInfo.displayName",
                          e.target.value
                        )
                      }
                    />
                    <StyledInput
                      label={t("contracts.settings.company.matriculeFiscale")}
                      value={settings.companyInfo?.matriculeFiscale}
                      onChange={(e) =>
                        updateSettings(
                          "companyInfo.matriculeFiscale",
                          e.target.value
                        )
                      }
                    />
                    <StyledInput
                      label={t("contracts.settings.company.representative")}
                      value={settings.companyInfo?.legalRepresentative}
                      onChange={(e) =>
                        updateSettings(
                          "companyInfo.legalRepresentative",
                          e.target.value
                        )
                      }
                    />
                    <StyledInput
                      label={t("contracts.settings.company.phone")}
                      value={settings.companyInfo?.phone}
                      onChange={(e) =>
                        updateSettings("companyInfo.phone", e.target.value)
                      }
                    />
                    <StyledInput
                      label={t("contracts.settings.company.email")}
                      value={settings.companyInfo?.email}
                      onChange={(e) =>
                        updateSettings("companyInfo.email", e.target.value)
                      }
                    />
                    <StyledInput
                      label={t("contracts.settings.company.address")}
                      value={settings.companyInfo?.address}
                      onChange={(e) =>
                        updateSettings("companyInfo.address", e.target.value)
                      }
                      className="col-span-2"
                    />
                    <StyledInput
                      label="RIB / IBAN"
                      value={settings.companyInfo?.rib}
                      onChange={(e) =>
                        updateSettings("companyInfo.rib", e.target.value)
                      }
                    />
                    <StyledInput
                      label={t("contracts.settings.company.bankName")}
                      value={settings.companyInfo?.bankName}
                      onChange={(e) =>
                        updateSettings("companyInfo.bankName", e.target.value)
                      }
                    />
                  </div>
                </SectionCard>
              </div>
            )}

            {activeTab === "structure" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-slate-900 text-white rounded-xl p-8 flex flex-col items-center justify-center shadow-lg border border-slate-700">
                  <p className="text-xs uppercase text-slate-400 tracking-widest font-bold mb-3">
                    {t("contracts.settings.structure.preview")}
                  </p>
                  <div className="text-4xl font-mono font-bold text-orange-400 tracking-wider">
                    {getPreviewId()}
                  </div>
                </div>

                <SectionCard
                  title={t("contracts.settings.structure.title")}
                  icon={Hash}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StyledInput
                      label={t("contracts.settings.structure.prefix")}
                      value={settings.structure?.prefix}
                      onChange={(e) =>
                        updateSettings("structure.prefix", e.target.value)
                      }
                    />
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        {t("contracts.settings.structure.separator")}
                      </label>
                      <select
                        value={settings.structure?.separator || "-"}
                        onChange={(e) =>
                          updateSettings("structure.separator", e.target.value)
                        }
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white outline-none"
                      >
                        <option value="-">- (Dash)</option>
                        <option value="/">/ (Slash)</option>
                        <option value="_">_ (Underscore)</option>
                        <option value="">(None)</option>
                      </select>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {t("contracts.settings.structure.includeYear")}
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.structure?.includeYear ?? true}
                        onChange={(e) =>
                          updateSettings(
                            "structure.includeYear",
                            e.target.checked
                          )
                        }
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-600"
                      />
                    </div>
                    <div
                      className={
                        !settings.structure?.includeYear
                          ? "opacity-50 pointer-events-none"
                          : ""
                      }
                    >
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        {t("contracts.settings.structure.yearFormat")}
                      </label>
                      <select
                        value={settings.structure?.yearFormat || "YYYY"}
                        onChange={(e) =>
                          updateSettings("structure.yearFormat", e.target.value)
                        }
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white outline-none"
                      >
                        <option value="YYYY">YYYY (2025)</option>
                        <option value="YY">YY (25)</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <StyledInput
                        label={t("contracts.settings.structure.sequenceDigits")}
                        type="number"
                        value={settings.structure?.sequenceDigits}
                        onChange={(e) =>
                          updateSettings(
                            "structure.sequenceDigits",
                            parseInt(e.target.value) || 4
                          )
                        }
                      />
                    </div>
                    <div className="col-span-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {t("contracts.settings.structure.resetYearly")}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {t("contracts.settings.structure.resetYearlyHelp")}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={
                          settings.structure?.resetSequenceYearly ?? true
                        }
                        onChange={(e) =>
                          updateSettings(
                            "structure.resetSequenceYearly",
                            e.target.checked
                          )
                        }
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-600"
                      />
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {activeTab === "branding" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <SectionCard
                  title={t("contracts.settings.branding.title")}
                  icon={Palette}
                >
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-8">
                    <ColorPicker
                      label={t("contracts.settings.branding.primary")}
                      value={settings.branding?.colors?.primary}
                      onChange={(v) =>
                        updateSettings("branding.colors.primary", v)
                      }
                    />
                    <ColorPicker
                      label={t("contracts.settings.branding.secondary")}
                      value={settings.branding?.colors?.secondary}
                      onChange={(v) =>
                        updateSettings("branding.colors.secondary", v)
                      }
                    />
                    <ColorPicker
                      label={t("contracts.settings.branding.text")}
                      value={settings.branding?.colors?.text}
                      onChange={(v) =>
                        updateSettings("branding.colors.text", v)
                      }
                    />
                    <ColorPicker
                      label={t("contracts.settings.branding.accent")}
                      value={settings.branding?.colors?.accent}
                      onChange={(v) =>
                        updateSettings("branding.colors.accent", v)
                      }
                    />
                  </div>
                  <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                    <StyledInput
                      label={t("contracts.settings.branding.logoUrl")}
                      value={settings.branding?.logo?.url}
                      onChange={(e) =>
                        updateSettings("branding.logo.url", e.target.value)
                      }
                      dir="ltr"
                    />
                  </div>
                </SectionCard>
              </div>
            )}

            {activeTab === "financials" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <SectionCard
                  title={t("contracts.settings.financials.title")}
                  icon={Receipt}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StyledInput
                      label={t("contracts.settings.financials.vatRate")}
                      type="number"
                      value={settings.financialDefaults?.defaultVatRate}
                      onChange={(e) =>
                        updateSettings(
                          "financialDefaults.defaultVatRate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <StyledInput
                      label={t("contracts.settings.financials.stampDuty")}
                      type="number"
                      step="0.001"
                      value={settings.financialDefaults?.defaultStampDuty}
                      onChange={(e) =>
                        updateSettings(
                          "financialDefaults.defaultStampDuty",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <StyledInput
                      label={t(
                        "contracts.settings.financials.depositPercentage"
                      )}
                      type="number"
                      value={settings.financialDefaults?.depositPercentage}
                      onChange={(e) =>
                        updateSettings(
                          "financialDefaults.depositPercentage",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <StyledInput
                      label={t("contracts.settings.financials.securityDeposit")}
                      type="number"
                      value={settings.financialDefaults?.securityDepositAmount}
                      onChange={(e) =>
                        updateSettings(
                          "financialDefaults.securityDepositAmount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <StyledInput
                      label={t("contracts.settings.financials.lateFee")}
                      type="number"
                      value={settings.financialDefaults?.lateFeePercentage}
                      onChange={(e) =>
                        updateSettings(
                          "financialDefaults.lateFeePercentage",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        {t("contracts.settings.financials.currency")}
                      </label>
                      <select
                        value={settings.financialDefaults?.currency || "TND"}
                        onChange={(e) =>
                          updateSettings(
                            "financialDefaults.currency",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none"
                      >
                        <option value="TND">TND - Dinar Tunisien</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="USD">USD - Dollar US</option>
                      </select>
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {activeTab === "layout" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <SectionCard
                  title={t("contracts.settings.layout.title")}
                  icon={Layout}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {t("contracts.settings.layout.showPageNumbers")}
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.layout?.showPageNumbers ?? true}
                        onChange={(e) =>
                          updateSettings(
                            "layout.showPageNumbers",
                            e.target.checked
                          )
                        }
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-600"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {t("contracts.settings.layout.showDate")}
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.layout?.showDate ?? true}
                        onChange={(e) =>
                          updateSettings("layout.showDate", e.target.checked)
                        }
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-600"
                      />
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {activeTab === "sections" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Scale className="text-orange-600" />{" "}
                    {t("contracts.settings.clauses.title")}
                  </h2>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Plus}
                    onClick={addSection}
                  >
                    {t("contracts.settings.clauses.add")}
                  </Button>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="clauses">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {settings.defaultSections?.map((section, idx) => (
                          <Draggable
                            key={section.id}
                            draggableId={section.id}
                            index={idx}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`bg-white dark:bg-gray-800 rounded-xl border ${snapshot.isDragging ? "border-orange-500 shadow-xl" : "border-gray-200 dark:border-gray-700"} p-5`}
                                style={{ ...provided.draggableProps.style }}
                              >
                                <div className="flex items-start gap-4">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="pt-3 text-gray-300 cursor-grab active:cursor-grabbing hover:text-orange-500"
                                  >
                                    <GripVertical size={20} />
                                  </div>
                                  <div className="flex-1 space-y-4">
                                    <div className="flex flex-col md:flex-row gap-4">
                                      <input
                                        type="text"
                                        value={section.title || ""}
                                        onChange={(e) =>
                                          updateSection(
                                            idx,
                                            "title",
                                            e.target.value
                                          )
                                        }
                                        className="flex-1 font-bold text-lg bg-transparent border-b border-transparent hover:border-gray-300 focus:border-orange-500 outline-none py-1 text-gray-900 dark:text-white"
                                        placeholder={t(
                                          "contracts.settings.clauses.articleTitle"
                                        )}
                                      />
                                      <label className="flex items-center gap-2 text-xs font-bold uppercase bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={section.isRequired || false}
                                          onChange={(e) =>
                                            updateSection(
                                              idx,
                                              "isRequired",
                                              e.target.checked
                                            )
                                          }
                                          className="rounded text-orange-600 focus:ring-orange-600"
                                        />
                                        <span className="text-gray-600 dark:text-gray-300">
                                          {t(
                                            "contracts.settings.clauses.required"
                                          )}
                                        </span>
                                      </label>
                                    </div>
                                    <textarea
                                      value={section.content || ""}
                                      onChange={(e) =>
                                        updateSection(
                                          idx,
                                          "content",
                                          e.target.value
                                        )
                                      }
                                      rows={4}
                                      className="w-full text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 resize-y dark:text-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                                      placeholder={t(
                                        "contracts.settings.clauses.content"
                                      )}
                                    />
                                  </div>
                                  <button
                                    onClick={() => removeSection(idx)}
                                    className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                {(!settings.defaultSections ||
                  settings.defaultSections.length === 0) && (
                  <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
                    {t("contracts.settings.clauses.empty")}
                  </div>
                )}
              </div>
            )}

            {activeTab === "cancellation" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <SectionCard
                  title={t("contracts.settings.cancellation.title")}
                  icon={Shield}
                >
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {t("contracts.settings.cancellation.enabled")}
                    </span>
                    <input
                      type="checkbox"
                      checked={
                        settings.defaultCancellationPolicy?.enabled ?? true
                      }
                      onChange={(e) =>
                        updateSettings(
                          "defaultCancellationPolicy.enabled",
                          e.target.checked
                        )
                      }
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-600"
                    />
                  </div>
                  <div className="flex justify-end mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Plus}
                      onClick={addCancellationTier}
                    >
                      {t("contracts.settings.cancellation.add")}
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {settings.defaultCancellationPolicy?.tiers?.map(
                      (tier, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StyledInput
                              label={t(
                                "contracts.settings.cancellation.daysBeforeEvent"
                              )}
                              type="number"
                              value={tier.daysBeforeEvent}
                              onChange={(e) =>
                                updateCancellationTier(
                                  idx,
                                  "daysBeforeEvent",
                                  parseInt(e.target.value) || 0
                                )
                              }
                            />
                            <StyledInput
                              label={t(
                                "contracts.settings.cancellation.penaltyPercentage"
                              )}
                              type="number"
                              value={tier.penaltyPercentage}
                              onChange={(e) =>
                                updateCancellationTier(
                                  idx,
                                  "penaltyPercentage",
                                  parseInt(e.target.value) || 0
                                )
                              }
                            />
                            <StyledInput
                              label={t(
                                "contracts.settings.cancellation.description"
                              )}
                              value={tier.description || ""}
                              onChange={(e) =>
                                updateCancellationTier(
                                  idx,
                                  "description",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <button
                            onClick={() => removeCancellationTier(idx)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg mt-5"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )
                    )}
                    {(!settings.defaultCancellationPolicy?.tiers ||
                      settings.defaultCancellationPolicy.tiers.length ===
                        0) && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        {t("contracts.settings.cancellation.empty")}
                      </div>
                    )}
                  </div>
                </SectionCard>
              </div>
            )}

            {activeTab === "labels" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <SectionCard
                  title={t("contracts.settings.labels.title")}
                  icon={Type}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.keys(settings.labels || {}).map((key) => (
                      <StyledInput
                        key={key}
                        label={t(`contracts.settings.labels.${key}`) || key}
                        value={settings.labels?.[key] || ""}
                        onChange={(e) =>
                          updateSettings(`labels.${key}`, e.target.value)
                        }
                      />
                    ))}
                  </div>
                </SectionCard>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: PREVIEW */}
      <div
        className={`hidden lg:flex flex-1 bg-gray-900 flex-col overflow-hidden ${isRTL ? "border-r" : "border-l"} border-gray-700`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-gray-900 shrink-0 shadow-lg z-20">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            {t("contracts.settings.preview.title")}
          </span>
          <div className="text-gray-500 text-xs flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full">
            <Eye size={12} /> {t("contracts.settings.preview.clickToEdit")}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-10 flex justify-center items-start bg-gray-800/50 backdrop-blur-sm">
          <div className="origin-top transform scale-[0.65] xl:scale-[0.75] shadow-2xl transition-all duration-300 ease-out ring-1 ring-white/10">
            <LiveContractPreview
              settings={settings}
              data={{
                ...previewData,
                contractNumber: getPreviewId(),
                financials: {
                  ...previewData.financials,
                  vatRate: settings.financialDefaults?.defaultVatRate || 19,
                  stampDuty:
                    settings.financialDefaults?.defaultStampDuty || 1.0,
                },
              }}
              onEditSection={handlePreviewEdit}
              onReorder={handleLayoutReorder}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractSettingsPage;
