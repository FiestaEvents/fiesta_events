import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, Palette, Type, Building2,
  Shield, Plus, Trash2, GripVertical, Receipt, Scale, Eye, Layout,
  Hash, Image as ImageIcon, AlertCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";

// Services
import { contractService } from "../../api/index";

// Components
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import LiveContractPreview from "./LiveContractPreview";

// Hooks
import { useToast } from "../../hooks/useToast";

// --- SUB-COMPONENTS ---

const SectionCard = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6 ${className}`}>
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-2">
      {Icon && <Icon size={18} className="text-orange-600" />}
      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
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
    <Icon size={18} className={`shrink-0 ${active ? "text-orange-600" : "text-gray-400"}`} />
    <span>{label}</span>
  </button>
);

const StyledInput = ({ label, value, onChange, type = "text", placeholder, className = "", dir="ltr" }) => (
  <div className={className}>
    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    <input
      type={type}
      value={value ?? ""} // Ensure it's never undefined
      onChange={onChange}
      placeholder={placeholder}
      dir={dir}
      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 outline-none transition-all placeholder:text-gray-400"
    />
  </div>
);

const ColorPicker = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{label}</label>
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 overflow-hidden rounded-lg border border-gray-200 shadow-sm shrink-0 ring-2 ring-transparent hover:ring-orange-200 transition-all cursor-pointer">
        <input
          type="color"
          value={value || "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 m-0 border-none"
        />
      </div>
      <div className="flex-1">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono uppercase bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
        />
      </div>
    </div>
  </div>
);

// --- MAIN PAGE ---

const ContractSettingsPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { showSuccess, apiError } = useToast();

  const [activeTab, setActiveTab] = useState("company");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Default State Structure
  const defaultSettings = {
    companyInfo: { legalName: "", displayName: "", matriculeFiscale: "", address: "", phone: "", email: "", website: "", rib: "", bankName: "", legalRepresentative: "" },
    branding: { colors: { primary: "#F18237", secondary: "#374151", accent: "#3B82F6", text: "#1F2937", background: "#FFFFFF" }, logo: { url: "" } },
    layout: { headerHeight: 80, footerHeight: 60, showPageNumbers: true, showDate: true },
    financialDefaults: { currency: "TND", defaultVatRate: 19, defaultStampDuty: 1.000, depositPercentage: 30, securityDepositAmount: 1000 },
    defaultSections: [],
    defaultCancellationPolicy: { enabled: true, tiers: [] },
    labels: { contractTitle: "CONTRAT", partiesTitle: "ENTRE LES SOUSSIGNÉS", serviceProvider: "Le Prestataire", clientLabel: "Le Client", partnerLabel: "Le Partenaire", servicesTitle: "OBJET", paymentTitle: "MODALITÉS DE PAIEMENT", signaturesTitle: "SIGNATURES" },
    structure: { prefix: "CTR", separator: "-", includeYear: true, yearFormat: "YYYY", sequenceDigits: 4 }
  };

  const [settings, setSettings] = useState(defaultSettings);

  // Helper: Get Deep Value for Preview
  const getPreviewId = () => {
    const s = settings.structure || defaultSettings.structure;
    const date = new Date();
    const year = s.yearFormat === "YY" ? date.getFullYear().toString().slice(-2) : date.getFullYear();
    const sequence = "1".padStart(s.sequenceDigits || 4, "0");
    
    let id = s.prefix;
    if (s.separator) id += s.separator;
    if (s.includeYear) {
        id += year;
        if (s.separator) id += s.separator;
    }
    id += sequence;
    return id;
  };

  // Preview Data Mock
  const previewData = {
    contractNumber: getPreviewId(),
    title: "Mariage Mr & Mme X",
    contractType: "client",
    party: { name: "Client Exemple", type: "individual", identifier: "00000000", address: "123 Rue de l'Exemple" },
    logistics: { startDate: new Date().toISOString(), endDate: new Date().toISOString(), checkInTime: "10:00", checkOutTime: "00:00" },
    financials: { 
      amountHT: 1000, 
      vatRate: settings.financialDefaults?.defaultVatRate || 19, 
      taxAmount: 190, 
      stampDuty: settings.financialDefaults?.defaultStampDuty || 1.000, 
      totalTTC: 1191 
    },
    paymentTerms: { depositAmount: 300 },
    legal: { jurisdiction: "Tribunal de Tunis", specialConditions: "..." },
    services: [{ description: "Location Salle", quantity: 1, rate: 800, amount: 800 }, { description: "Traiteur", quantity: 20, rate: 10, amount: 200 }]
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await contractService.getSettings();
        const dbSettings = res.data?.settings || res.settings || {};

        // Merge DB settings with Defaults to prevent undefined errors
        setSettings(prev => ({
          ...defaultSettings,
          ...dbSettings,
          companyInfo: { ...defaultSettings.companyInfo, ...(dbSettings.companyInfo || {}) },
          branding: { ...defaultSettings.branding, ...(dbSettings.branding || {}), colors: { ...defaultSettings.branding.colors, ...(dbSettings.branding?.colors || {}) } },
          layout: { ...defaultSettings.layout, ...(dbSettings.layout || {}) },
          financialDefaults: { ...defaultSettings.financialDefaults, ...(dbSettings.financialDefaults || {}) },
          defaultSections: dbSettings.defaultSections?.length > 0 ? dbSettings.defaultSections : defaultSettings.defaultSections,
          defaultCancellationPolicy: { ...defaultSettings.defaultCancellationPolicy, ...(dbSettings.defaultCancellationPolicy || {}) },
          labels: { ...defaultSettings.labels, ...(dbSettings.labels || {}) },
          structure: { ...defaultSettings.structure, ...(dbSettings.structure || {}) }
        }));
      } catch (err) {
        apiError(err, t("contracts.settings.messages.loadError"));
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [t]);

  const updateSettings = (path, value) => {
    setSettings(prev => {
      const keys = path.split(".");
      const newSettings = JSON.parse(JSON.stringify(prev)); // Deep clone
      let current = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await contractService.updateSettings(settings);
      showSuccess(t("contracts.settings.messages.saveSuccess"));
    } catch (err) {
      apiError(err, t("contracts.settings.messages.saveError"));
    } finally {
      setSaving(false);
    }
  };

  // Sections Helpers
  const addSection = () => {
    const newSection = { id: `section-${Date.now()}`, title: "", content: "", type: "custom", order: (settings.defaultSections?.length || 0) + 1, isRequired: false, isDefault: true };
    updateSettings("defaultSections", [...(settings.defaultSections || []), newSection]);
  };
  const updateSection = (index, field, value) => {
    const sections = [...(settings.defaultSections || [])];
    sections[index] = { ...sections[index], [field]: value };
    updateSettings("defaultSections", sections);
  };
  const removeSection = (index) => updateSettings("defaultSections", settings.defaultSections.filter((_, i) => i !== index));

  // Cancellation Helpers
  const addCancellationTier = () => {
    const tiers = [...(settings.defaultCancellationPolicy?.tiers || [])];
    tiers.push({ daysBeforeEvent: 30, penaltyPercentage: 50, description: "" });
    updateSettings("defaultCancellationPolicy.tiers", tiers);
  };
  const updateCancellationTier = (index, field, value) => {
    const tiers = [...(settings.defaultCancellationPolicy?.tiers || [])];
    tiers[index] = { ...tiers[index], [field]: value };
    updateSettings("defaultCancellationPolicy.tiers", tiers);
  };
  const removeCancellationTier = (index) => updateSettings("defaultCancellationPolicy.tiers", settings.defaultCancellationPolicy.tiers.filter((_, i) => i !== index));

  if (loading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>;

  const tabs = [
    { id: "company", label: t("contracts.settings.tabs.company"), icon: Building2 },
    { id: "structure", label: "Structure & ID", icon: Hash },
    { id: "branding", label: t("contracts.settings.tabs.branding"), icon: Palette },
    { id: "financials", label: t("contracts.settings.tabs.financials"), icon: Receipt },
    { id: "layout", label: t("contracts.settings.tabs.layout"), icon: Layout },
    { id: "sections", label: t("contracts.settings.tabs.clauses"), icon: Scale },
    { id: "cancellation", label: t("contracts.settings.tabs.cancellation"), icon: Shield },
    { id: "labels", label: t("contracts.settings.tabs.labels"), icon: Type },
  ];

  const isRTL = i18n.dir() === "rtl";

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans" dir={isRTL ? "rtl" : "ltr"}>
      
      {/* --- LEFT COLUMN: SETTINGS FORM --- */}
      <div className={`flex-1 flex flex-col h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 shadow-xl max-w-3xl ${isRTL ? "border-l border-r-0" : ""}`}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0 bg-white dark:bg-gray-800 z-20">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/contracts")}>
              <ArrowLeft size={20} className={isRTL ? "rotate-180" : ""} />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{t("contracts.settings.title")}</h1>
              <p className="text-xs text-gray-500">Global configuration</p>
            </div>
          </div>
          <Button variant="primary" icon={Save} onClick={handleSave} loading={saving}>
            {t("contracts.settings.save")}
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className={`w-64 overflow-y-auto p-4 bg-gray-50/80 dark:bg-gray-900/50 shrink-0 ${isRTL ? "border-l" : "border-r"} border-gray-200 dark:border-gray-700`}>
            {tabs.map(tab => (
              <TabButton key={tab.id} active={activeTab === tab.id} icon={tab.icon} label={tab.label} onClick={() => setActiveTab(tab.id)} />
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 relative">
            
            {/* COMPANY INFO */}
            {activeTab === "company" && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <SectionCard title={t("contracts.settings.company.title")} icon={Building2}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <StyledInput label={t("contracts.settings.company.legalName")} value={settings.companyInfo?.legalName} onChange={(e) => updateSettings("companyInfo.legalName", e.target.value)} placeholder="e.g. SARL Events" />
                      <StyledInput label={t("contracts.settings.company.displayName")} value={settings.companyInfo?.displayName} onChange={(e) => updateSettings("companyInfo.displayName", e.target.value)} placeholder="e.g. My Venue" />
                      <StyledInput label={t("contracts.settings.company.matriculeFiscale")} value={settings.companyInfo?.matriculeFiscale} onChange={(e) => updateSettings("companyInfo.matriculeFiscale", e.target.value)} placeholder="0000000/A/M/000" />
                      <StyledInput label={t("contracts.settings.company.address")} value={settings.companyInfo?.address} onChange={(e) => updateSettings("companyInfo.address", e.target.value)} />
                      <StyledInput label={t("contracts.settings.company.phone")} value={settings.companyInfo?.phone} onChange={(e) => updateSettings("companyInfo.phone", e.target.value)} />
                      <StyledInput label={t("contracts.settings.company.email")} value={settings.companyInfo?.email} onChange={(e) => updateSettings("companyInfo.email", e.target.value)} />
                      <StyledInput label="RIB / IBAN" value={settings.companyInfo?.rib} onChange={(e) => updateSettings("companyInfo.rib", e.target.value)} className="col-span-2" />
                    </div>
                  </SectionCard>
               </div>
            )}

            {/* STRUCTURE & SEQUENCE */}
            {activeTab === "structure" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                
                {/* ID Preview Card */}
                <div className="bg-slate-900 text-white rounded-xl p-8 flex flex-col items-center justify-center shadow-lg border border-slate-700">
                   <p className="text-xs uppercase text-slate-400 tracking-widest font-bold mb-3">Aperçu du Prochain Numéro</p>
                   <div className="text-4xl font-mono font-bold text-orange-400 tracking-wider">
                      {getPreviewId()}
                   </div>
                </div>

                <SectionCard title="Configuration de la Séquence" icon={Hash}>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <StyledInput 
                        label="Préfixe" 
                        value={settings.structure?.prefix} 
                        onChange={(e) => updateSettings("structure.prefix", e.target.value)} 
                        placeholder="CTR"
                      />
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Séparateur</label>
                        <select 
                          value={settings.structure?.separator || "-"} 
                          onChange={(e) => updateSettings("structure.separator", e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-600 outline-none"
                        >
                          <option value="-">- (Tiret)</option>
                          <option value="/">/ (Slash)</option>
                          <option value="_">_ (Underscore)</option>
                          <option value="">(Aucun)</option>
                        </select>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                         <span className="text-sm font-medium text-gray-900 dark:text-white">Inclure l'année</span>
                         <input 
                            type="checkbox" 
                            checked={settings.structure?.includeYear} 
                            onChange={(e) => updateSettings("structure.includeYear", e.target.checked)}
                            className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-600"
                         />
                      </div>

                      <div className={!settings.structure?.includeYear ? "opacity-50 pointer-events-none" : ""}>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Format Année</label>
                        <select 
                          value={settings.structure?.yearFormat || "YYYY"} 
                          onChange={(e) => updateSettings("structure.yearFormat", e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-600 outline-none"
                        >
                          <option value="YYYY">YYYY (2025)</option>
                          <option value="YY">YY (25)</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <StyledInput 
                          label="Nombre de Zéros (Padding)" 
                          type="number"
                          value={settings.structure?.sequenceDigits} 
                          onChange={(e) => updateSettings("structure.sequenceDigits", parseInt(e.target.value))}
                        />
                        <p className="text-xs text-gray-400 mt-2">Exemple: 4 donne "0001", 3 donne "001".</p>
                      </div>
                   </div>
                </SectionCard>
              </div>
            )}

            {/* BRANDING */}
            {activeTab === "branding" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <SectionCard title={t("contracts.settings.branding.title")} icon={Palette}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <ColorPicker label={t("contracts.settings.branding.primary")} value={settings.branding?.colors?.primary} onChange={(v) => updateSettings("branding.colors.primary", v)} />
                    <ColorPicker label={t("contracts.settings.branding.secondary")} value={settings.branding?.colors?.secondary} onChange={(v) => updateSettings("branding.colors.secondary", v)} />
                    <ColorPicker label={t("contracts.settings.branding.text")} value={settings.branding?.colors?.text} onChange={(v) => updateSettings("branding.colors.text", v)} />
                    <ColorPicker label={t("contracts.settings.branding.accent")} value={settings.branding?.colors?.accent} onChange={(v) => updateSettings("branding.colors.accent", v)} />
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                     <div className="flex items-center gap-2 mb-4">
                        <ImageIcon size={18} className="text-gray-400"/>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase">Logo URL</span>
                     </div>
                     <StyledInput 
                        label="Lien Public du Logo (HTTPS)" 
                        value={settings.branding?.logo?.url} 
                        onChange={(e) => updateSettings("branding.logo.url", e.target.value)} 
                        dir="ltr" 
                        placeholder="https://example.com/logo.png"
                     />
                     <p className="text-xs text-gray-500 mt-2">Pour de meilleurs résultats PDF, utilisez un lien direct vers une image PNG ou JPG.</p>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* FINANCIALS */}
            {activeTab === "financials" && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <SectionCard title={t("contracts.settings.financials.title")} icon={Receipt}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <StyledInput label="Taux TVA par défaut (%)" type="number" value={settings.financialDefaults?.defaultVatRate} onChange={(e) => updateSettings("financialDefaults.defaultVatRate", parseFloat(e.target.value))} />
                       <StyledInput label="Timbre Fiscal (TND)" type="number" step="0.100" value={settings.financialDefaults?.defaultStampDuty} onChange={(e) => updateSettings("financialDefaults.defaultStampDuty", parseFloat(e.target.value))} />
                       <StyledInput label="Acompte Requis (%)" type="number" value={settings.financialDefaults?.depositPercentage} onChange={(e) => updateSettings("financialDefaults.depositPercentage", parseFloat(e.target.value))} />
                       <StyledInput label="Caution de Garantie (TND)" type="number" value={settings.financialDefaults?.securityDepositAmount} onChange={(e) => updateSettings("financialDefaults.securityDepositAmount", parseFloat(e.target.value))} />
                    </div>
                  </SectionCard>
               </div>
            )}

            {/* LAYOUT */}
            {activeTab === "layout" && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <SectionCard title={t("contracts.settings.layout.title")} icon={Layout}>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{t("contracts.settings.layout.showPageNumbers")}</span>
                          <input type="checkbox" checked={settings.layout?.showPageNumbers} onChange={(e) => updateSettings("layout.showPageNumbers", e.target.checked)} className="w-5 h-5 text-orange-600 rounded focus:ring-orange-600" />
                       </div>
                       <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{t("contracts.settings.layout.showDate")}</span>
                          <input type="checkbox" checked={settings.layout?.showDate} onChange={(e) => updateSettings("layout.showDate", e.target.checked)} className="w-5 h-5 text-orange-600 rounded focus:ring-orange-600" />
                       </div>
                    </div>
                  </SectionCard>
               </div>
            )}

            {/* SECTIONS / CLAUSES */}
            {activeTab === "sections" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Scale className="text-orange-600"/> {t("contracts.settings.clauses.title")}</h2>
                    <Button size="sm" variant="outline" icon={Plus} onClick={addSection}>{t("contracts.settings.clauses.add")}</Button>
                </div>
                
                <div className="space-y-4">
                  {settings.defaultSections?.map((section, idx) => (
                    <div key={section.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:border-orange-200 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="pt-3 text-gray-300 cursor-grab hover:text-orange-500"><GripVertical size={20} /></div>
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-col md:flex-row gap-4">
                            <input 
                              type="text" 
                              value={section.title} 
                              onChange={(e) => updateSection(idx, "title", e.target.value)} 
                              className="flex-1 font-bold text-lg bg-transparent border-b border-transparent hover:border-gray-300 focus:border-orange-500 outline-none py-1 text-gray-900 dark:text-white placeholder-gray-400" 
                              placeholder={t("contracts.settings.clauses.articleTitle")} 
                            />
                            <label className="flex items-center gap-2 text-xs font-bold uppercase bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                               <input type="checkbox" checked={section.isRequired} onChange={(e) => updateSection(idx, "isRequired", e.target.checked)} className="rounded text-orange-600 focus:ring-orange-600" /> 
                               <span className="text-gray-600 dark:text-gray-300">{t("contracts.settings.clauses.required")}</span>
                            </label>
                          </div>
                          <textarea 
                             value={section.content} 
                             onChange={(e) => updateSection(idx, "content", e.target.value)} 
                             rows={4} 
                             className="w-full text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 resize-y dark:text-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none" 
                             placeholder={t("contracts.settings.clauses.content")} 
                          />
                        </div>
                        <button onClick={() => removeSection(idx)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                  {settings.defaultSections?.length === 0 && (
                      <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
                          Aucune clause par défaut.
                      </div>
                  )}
                </div>
              </div>
            )}

            {/* CANCELLATION */}
            {activeTab === "cancellation" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <SectionCard title={t("contracts.settings.cancellation.title")} icon={Shield}>
                  <div className="flex justify-end mb-4">
                     <Button variant="outline" size="sm" icon={Plus} onClick={addCancellationTier}>{t("contracts.settings.cancellation.add")}</Button>
                  </div>
                  <div className="space-y-3">
                    {settings.defaultCancellationPolicy?.tiers?.map((tier, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-300 transition-colors">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <StyledInput label="Jours avant (Min)" type="number" value={tier.daysBeforeEvent} onChange={(e) => updateCancellationTier(idx, "daysBeforeEvent", parseInt(e.target.value))} />
                          <StyledInput label="Pénalité (%)" type="number" value={tier.penaltyPercentage} onChange={(e) => updateCancellationTier(idx, "penaltyPercentage", parseInt(e.target.value))} />
                          <StyledInput label="Description" value={tier.description || ""} onChange={(e) => updateCancellationTier(idx, "description", e.target.value)} />
                        </div>
                        <button onClick={() => removeCancellationTier(idx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg mt-5"><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            )}

            {/* LABELS (FIXED) */}
            {activeTab === "labels" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <SectionCard title={t("contracts.settings.labels.title")} icon={Type}>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.keys(settings.labels).map((key) => (
                        <StyledInput 
                           key={key}
                           label={t(`contracts.settings.labels.${key}`) || key} // ✅ Fixed: Use t() or fallback to key
                           value={settings.labels[key]} 
                           onChange={(e) => updateSettings(`labels.${key}`, e.target.value)} 
                        />
                      ))}
                   </div>
                </SectionCard>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: LIVE PREVIEW --- */}
      <div className={`hidden lg:flex flex-1 bg-gray-900 flex-col overflow-hidden ${isRTL ? "border-r" : "border-l"} border-gray-700`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-gray-900 shrink-0 shadow-lg z-20">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Aperçu PDF
          </span>
          <div className="text-gray-500 text-xs flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full">
             <Eye size={12} /> Live Preview
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
                   stampDuty: settings.financialDefaults?.defaultStampDuty || 1.000
                }
              }} 
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default ContractSettingsPage;