// src/pages/contracts/ContractSettingsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, Palette, Type, Building2, FileText, CreditCard,
  Shield, Plus, Trash2, GripVertical, Receipt, Scale
} from "lucide-react";
import { useTranslation } from "react-i18next";

// Services
import { contractService } from "../../api/index";

// Components
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Textarea from "../../components/common/Textarea";
import Input from "../../components/common/Input";

// Hooks
import { useToast } from "../../hooks/useToast";

// ============================================
// TAB BUTTON
// ============================================
const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all w-full text-left ${
      active
        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
    }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

// ============================================
// COLOR PICKER
// ============================================
const ColorPicker = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-1 bg-white"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
const ContractSettingsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSuccess, apiError } = useToast();

  const [activeTab, setActiveTab] = useState("company"); // Default to Company Info as it's most critical
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);

  // Fetch Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await contractService.getSettings();
        setSettings(res.data?.settings || res.settings || {});
      } catch (err) {
        apiError(err, "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [apiError]);

  // Save Settings
  const handleSave = async () => {
    try {
      setSaving(true);
      await contractService.updateSettings(settings);
      showSuccess("Settings saved successfully");
    } catch (err) {
      apiError(err, "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Update nested settings
  const updateSettings = (path, value) => {
    setSettings(prev => {
      const keys = path.split(".");
      const newSettings = { ...prev };
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current[keys[i]] = { ...current[keys[i]] }; // Clone level
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newSettings;
    });
  };

  // Section handlers
  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: "Nouvelle Section",
      content: "",
      type: "custom",
      order: (settings.defaultSections?.length || 0) + 1,
      isRequired: false,
      isDefault: true,
    };
    updateSettings("defaultSections", [...(settings.defaultSections || []), newSection]);
  };

  const updateSection = (index, field, value) => {
    const sections = [...(settings.defaultSections || [])];
    sections[index] = { ...sections[index], [field]: value };
    updateSettings("defaultSections", sections);
  };

  const removeSection = (index) => {
    updateSettings("defaultSections", settings.defaultSections.filter((_, i) => i !== index));
  };

  // Cancellation tier handlers
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

  const removeCancellationTier = (index) => {
    updateSettings("defaultCancellationPolicy.tiers", 
      settings.defaultCancellationPolicy.tiers.filter((_, i) => i !== index)
    );
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!settings) return null;

  const tabs = [
    { id: "company", label: "Company Info", icon: Building2 },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "financials", label: "Financial Defaults", icon: Receipt },
    { id: "sections", label: "Contract Clauses", icon: Scale },
    { id: "payment", label: "Payment Terms", icon: CreditCard },
    { id: "cancellation", label: "Cancellation Policy", icon: Shield },
    { id: "labels", label: "PDF Labels", icon: Type },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/contracts")}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Contract Settings</h1>
              <p className="text-sm text-gray-500">Configure your Tunisian business defaults</p>
            </div>
          </div>
          <Button variant="primary" icon={Save} onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex items-start gap-6 p-6">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shrink-0 sticky top-24">
          <div className="space-y-1">
            {tabs.map(tab => (
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

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          
          {/* COMPANY INFO (Tunisian Context) */}
          {activeTab === "company" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Legal Entity Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Raison Sociale (Legal Name)"
                  value={settings.companyInfo?.legalName || ""}
                  onChange={(e) => updateSettings("companyInfo.legalName", e.target.value)}
                  placeholder="Ex: STE EVENTS SARL"
                />
                <Input
                  label="Enseigne Commerciale (Display Name)"
                  value={settings.companyInfo?.displayName || ""}
                  onChange={(e) => updateSettings("companyInfo.displayName", e.target.value)}
                  placeholder="Ex: Top Events"
                />
                <Input
                  label="Matricule Fiscale"
                  value={settings.companyInfo?.matriculeFiscale || ""}
                  onChange={(e) => updateSettings("companyInfo.matriculeFiscale", e.target.value)}
                  placeholder="1234567/A/M/000"
                />
                <Input
                  label="Représentant Légal (Gérant)"
                  value={settings.companyInfo?.legalRepresentative || ""}
                  onChange={(e) => updateSettings("companyInfo.legalRepresentative", e.target.value)}
                  placeholder="Nom du gérant"
                />
                <Input
                  label="RIB / IBAN"
                  value={settings.companyInfo?.rib || ""}
                  onChange={(e) => updateSettings("companyInfo.rib", e.target.value)}
                  placeholder="20 Digits"
                />
                <Input
                  label="Banque"
                  value={settings.companyInfo?.bankName || ""}
                  onChange={(e) => updateSettings("companyInfo.bankName", e.target.value)}
                  placeholder="Ex: BIAT, STB..."
                />
              </div>
              
              <Textarea
                label="Adresse du Siège Social"
                value={settings.companyInfo?.address || ""}
                onChange={(e) => updateSettings("companyInfo.address", e.target.value)}
                rows={2}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Input label="Email" type="email" value={settings.companyInfo?.email || ""} onChange={(e) => updateSettings("companyInfo.email", e.target.value)} />
                 <Input label="Téléphone" value={settings.companyInfo?.phone || ""} onChange={(e) => updateSettings("companyInfo.phone", e.target.value)} />
                 <Input label="Site Web" value={settings.companyInfo?.website || ""} onChange={(e) => updateSettings("companyInfo.website", e.target.value)} />
              </div>
            </div>
          )}

          {/* BRANDING */}
          {activeTab === "branding" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Theme Colors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ColorPicker
                    label="Primary Color"
                    value={settings.branding?.colors?.primary || "#F18237"}
                    onChange={(v) => updateSettings("branding.colors.primary", v)}
                  />
                  <ColorPicker
                    label="Secondary Color"
                    value={settings.branding?.colors?.secondary || "#374151"}
                    onChange={(v) => updateSettings("branding.colors.secondary", v)}
                  />
                  <ColorPicker
                    label="Text Color"
                    value={settings.branding?.colors?.text || "#1F2937"}
                    onChange={(v) => updateSettings("branding.colors.text", v)}
                  />
                  <ColorPicker
                    label="Accent Color"
                    value={settings.branding?.colors?.accent || "#3B82F6"}
                    onChange={(v) => updateSettings("branding.colors.accent", v)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* FINANCIAL DEFAULTS */}
          {activeTab === "financials" && (
             <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tax & Financial Defaults</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <Input 
                      label="TVA par défaut (%)" 
                      type="number" 
                      value={settings.financialDefaults?.defaultVatRate || 19} 
                      onChange={(e) => updateSettings("financialDefaults.defaultVatRate", parseFloat(e.target.value))} 
                   />
                   <Input 
                      label="Timbre Fiscal (TND)" 
                      type="number" 
                      step="0.100"
                      value={settings.financialDefaults?.defaultStampDuty || 1.000} 
                      onChange={(e) => updateSettings("financialDefaults.defaultStampDuty", parseFloat(e.target.value))} 
                   />
                   <Input 
                      label="Avance / Deposit (%)" 
                      type="number" 
                      value={settings.financialDefaults?.depositPercentage || 30} 
                      onChange={(e) => updateSettings("financialDefaults.depositPercentage", parseFloat(e.target.value))} 
                   />
                   <Input 
                      label="Caution / Security (TND)" 
                      type="number" 
                      value={settings.financialDefaults?.securityDepositAmount || 1000} 
                      onChange={(e) => updateSettings("financialDefaults.securityDepositAmount", parseFloat(e.target.value))} 
                   />
                </div>
             </div>
          )}

          {/* DEFAULT SECTIONS (CLAUSES) */}
          {activeTab === "sections" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Clauses Contractuelles</h2>
                <Button variant="outline" size="sm" icon={Plus} onClick={addSection}>
                  Ajouter Clause
                </Button>
              </div>

              {settings.defaultSections?.map((section, idx) => (
                <div key={section.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 group">
                  <div className="flex items-start gap-3">
                    <div className="pt-2 text-gray-300 cursor-grab">
                      <GripVertical size={16} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => updateSection(idx, "title", e.target.value)}
                          className="flex-1 font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-orange-500 outline-none py-1 text-gray-900 dark:text-white"
                          placeholder="Titre de l'article"
                        />
                        <div className="flex items-center gap-2">
                            <select
                            value={section.type}
                            onChange={(e) => updateSection(idx, "type", e.target.value)}
                            className="text-xs bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-2 py-1 dark:text-white"
                            >
                            <option value="scope">Objet</option>
                            <option value="payment">Paiement</option>
                            <option value="cancellation">Annulation</option>
                            <option value="liability">Responsabilité</option>
                            <option value="jurisdiction">Juridiction</option>
                            <option value="custom">Personnalisé</option>
                            </select>
                            <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <input
                                type="checkbox"
                                checked={section.isRequired}
                                onChange={(e) => updateSection(idx, "isRequired", e.target.checked)}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            Obligatoire
                            </label>
                        </div>
                      </div>
                      <textarea
                        value={section.content}
                        onChange={(e) => updateSection(idx, "content", e.target.value)}
                        rows={4}
                        className="w-full text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 resize-none focus:ring-2 focus:ring-orange-500 outline-none dark:text-gray-300"
                        placeholder="Contenu de la clause..."
                      />
                    </div>
                    <button
                      onClick={() => removeSection(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CANCELLATION POLICY */}
          {activeTab === "cancellation" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Politique d'Annulation</h2>
                <Button variant="outline" size="sm" icon={Plus} onClick={addCancellationTier}>
                  Ajouter Palier
                </Button>
              </div>

              <div className="space-y-3">
                {settings.defaultCancellationPolicy?.tiers?.map((tier, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700 group">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Jours avant l'événement</label>
                        <input
                          type="number"
                          value={tier.daysBeforeEvent}
                          onChange={(e) => updateCancellationTier(idx, "daysBeforeEvent", parseInt(e.target.value))}
                          className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Pénalité (%)</label>
                        <input
                          type="number"
                          value={tier.penaltyPercentage}
                          onChange={(e) => updateCancellationTier(idx, "penaltyPercentage", parseInt(e.target.value))}
                          className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Description</label>
                        <input
                          type="text"
                          value={tier.description || ""}
                          onChange={(e) => updateCancellationTier(idx, "description", e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
                          placeholder="Ex: Acompte non remboursable"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeCancellationTier(idx)}
                      className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity self-end mb-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LABELS (FR) */}
          {activeTab === "labels" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Labels PDF (Français)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: "contractTitle", label: "Titre du Contrat", default: "CONTRAT DE PRESTATION" },
                  { key: "partiesTitle", label: "Titre Parties", default: "ENTRE LES SOUSSIGNÉS" },
                  { key: "serviceProvider", label: "Label Prestataire", default: "Le Prestataire" },
                  { key: "clientLabel", label: "Label Client", default: "Le Client" },
                  { key: "partnerLabel", label: "Label Partenaire", default: "Le Partenaire" },
                  { key: "servicesTitle", label: "Titre Services", default: "OBJET DU CONTRAT" },
                  { key: "paymentTitle", label: "Titre Paiement", default: "MODALITÉS DE PAIEMENT" },
                  { key: "signaturesTitle", label: "Titre Signatures", default: "SIGNATURES" },
                ].map(item => (
                  <div key={item.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{item.label}</label>
                    <input
                      type="text"
                      value={settings.labels?.[item.key] || item.default}
                      onChange={(e) => updateSettings(`labels.${item.key}`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ContractSettingsPage;