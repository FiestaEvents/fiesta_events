import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Save, Palette, Type, Image as ImageIcon,
  Table as TableIcon, Layers, DollarSign, ArrowLeft,
  Move, Eye, RefreshCw
} from "lucide-react";
import { HexColorPicker } from "react-colorful";

import { invoiceService } from "../../api/index";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/common/Button";
import OrbitLoader from "../../components/common/LoadingSpinner";
import Input from "../../components/common/Input";
import LiveInvoicePreview from "./LiveInvoicePreview";

// --- DEFAULTS ---
const DEFAULT_SETTINGS = {
  branding: {
    logo: { url: "", width: 150, height: 60 },
    colors: { primary: "#F18237", secondary: "#374151", text: "#1F2937", background: "#FFFFFF" },
    fonts: { size: 10 },
    watermark: { enabled: false, url: "" },
  },
  layout: {
    template: "modern",
    density: "standard",
    borderRadius: 4,
    // Order determines vertical position
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
      description: true, quantity: true, rate: true, total: true,
    },
  },
  labels: {
    invoiceTitle: "FACTURE", from: "De", to: "À",
    item: "Description", quantity: "Qté", rate: "Prix", total: "Total",
    paymentInstructions: "Instructions de paiement",
  },
  paymentTerms: { bankDetails: "", terms: "" },
};

// Deep merge helper
const deepMerge = (target, source) => {
  const output = { ...target };
  if (!source) return output;
  Object.keys(target).forEach((key) => {
    if (source[key] === undefined) return;
    if (typeof target[key] === "object" && target[key] !== null && !Array.isArray(target[key])) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  });
  return output;
};

// --- SUB-COMPONENTS ---
const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all w-full text-left ${
      active
        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 shadow-sm ring-1 ring-orange-200"
        : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
    }`}
  >
    <Icon size={18} className="shrink-0" />
    <span className="hidden md:inline">{label}</span>
  </button>
);

const ColorPicker = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popover = useRef();
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popover.current && !popover.current.contains(e.target)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm cursor-pointer"
          style={{ backgroundColor: value || "#fff" }}
          onClick={() => setIsOpen(!isOpen)}
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono uppercase outline-none dark:bg-gray-800 dark:text-white"
        />
      </div>
      {isOpen && (
        <div ref={popover} className="absolute top-full left-0 mt-2 z-50 bg-white p-3 rounded-xl shadow-xl border">
          <HexColorPicker color={value || "#fff"} onChange={onChange} />
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
const InvoiceCustomizationPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState("branding");
  const [isUploading, setIsUploading] = useState(false);
  const isRTL = i18n.dir() === "rtl";

  // State
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await invoiceService.getSettings();
        const rawData = res.data || res || {};
        const merged = deepMerge(DEFAULT_SETTINGS, rawData);
        // Ensure sections array exists and is valid
        if (!merged.layout.sections || merged.layout.sections.length === 0) {
          merged.layout.sections = DEFAULT_SETTINGS.layout.sections;
        }
        setSettings(merged);
      } catch (err) {
        showError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Update Helper
  const updateSetting = (path, value) => {
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
  };

  const reorderSections = (newOrder) => {
    setSettings((prev) => {
      const orderMap = {};
      newOrder.forEach((item, index) => { orderMap[item.id] = index + 1; });
      const updatedSections = prev.layout.sections.map((sec) => ({
        ...sec,
        order: orderMap[sec.id] !== undefined ? orderMap[sec.id] : sec.order
      }));
      return { ...prev, layout: { ...prev.layout, sections: updatedSections } };
    });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return showError("Image must be < 2MB");

    setIsUploading(true);
    try {
      const res = await invoiceService.uploadLogo(file);
      if (res && res.url) {
        updateSetting("branding.logo.url", res.url);
        showSuccess("Logo uploaded");
      }
    } catch (err) {
      showError("Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await invoiceService.updateSettings(settings);
      showSuccess("Settings saved successfully");
    } catch (err) {
      showError("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    if(!window.confirm("Reset all settings to default?")) return;
    try {
      await invoiceService.resetSettings();
      setSettings(DEFAULT_SETTINGS);
      showSuccess("Settings reset");
    } catch (err) { showError("Reset failed"); }
  };

  // Preview Data
  const previewData = {
    invoiceNumber: "INV-001",
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 15).toISOString(),
    recipient: { name: "Client Test", email: "client@test.com", phone: "+216 20 000 000" },
    items: [
      { description: "Location Salle", quantity: 1, rate: 1500, amount: 1500 },
      { description: "Traiteur", quantity: 50, rate: 25, amount: 1250 },
    ],
    subtotal: 2750,
    taxRate: 19,
    taxAmount: 522.5,
    totalAmount: 3272.5
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><OrbitLoader /></div>;

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 overflow-hidden font-sans" dir={isRTL ? "rtl" : "ltr"}>
      
      {/* --- LEFT: EDITOR --- */}
      <div className={`flex-1 flex flex-col h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 shadow-xl max-w-xl ${isRTL ? "border-l border-r-0" : ""}`}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/invoices")} className="p-2 h-auto"><ArrowLeft size={18} /></Button>
            <h1 className="font-bold text-gray-900 dark:text-white text-lg">Editor</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={resetSettings} icon={RefreshCw} />
            <Button variant="primary" icon={Save} onClick={saveSettings} loading={saving}>Save</Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Tabs */}
          <div className={`w-16 md:w-48 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-700`}>
            <div className="space-y-1">
              <TabButton active={activeTab === "branding"} icon={Palette} label="Branding" onClick={() => setActiveTab("branding")} />
              <TabButton active={activeTab === "layout"} icon={Layers} label="Layout" onClick={() => setActiveTab("layout")} />
              <TabButton active={activeTab === "table"} icon={TableIcon} label="Table" onClick={() => setActiveTab("table")} />
              <TabButton active={activeTab === "text"} icon={Type} label="Text" onClick={() => setActiveTab("text")} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "branding" && (
              <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500 uppercase">Logo</label>
                   <div className="relative h-32 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden group">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleLogoUpload} accept="image/*" disabled={isUploading} />
                      {isUploading ? <OrbitLoader size={20} color="orange" /> : 
                       settings.branding.logo.url ? <img src={settings.branding.logo.url} className="h-full object-contain" /> :
                       <div className="text-gray-400 flex flex-col items-center"><ImageIcon size={24} /><span className="text-xs">Upload</span></div>
                      }
                   </div>
                </div>
                <ColorPicker label="Primary Color" value={settings.branding.colors.primary} onChange={(v) => updateSetting("branding.colors.primary", v)} />
                <ColorPicker label="Text Color" value={settings.branding.colors.text} onChange={(v) => updateSetting("branding.colors.text", v)} />
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Font Size</label>
                    <input type="range" min="8" max="14" value={settings.branding.fonts.size} onChange={(e) => updateSetting("branding.fonts.size", Number(e.target.value))} className="w-full accent-orange-500" />
                    <div className="text-xs text-right">{settings.branding.fonts.size}px</div>
                </div>
              </div>
            )}

            {activeTab === "layout" && (
               <div className="space-y-4">
                  <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded flex gap-2"><Move size={14}/> Drag & Drop sections on the preview!</div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold">Visibility</h3>
                    {settings.layout.sections.sort((a,b) => a.order - b.order).map(sec => (
                        <label key={sec.id} className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50">
                            <span className="text-sm capitalize">{sec.label}</span>
                            <input type="checkbox" checked={sec.visible} onChange={(e) => {
                                const newSecs = [...settings.layout.sections];
                                const idx = newSecs.findIndex(s => s.id === sec.id);
                                newSecs[idx].visible = e.target.checked;
                                updateSetting("layout.sections", newSecs);
                            }} />
                        </label>
                    ))}
                  </div>
                  <div className="space-y-2 pt-4">
                     <h3 className="text-sm font-bold">Border Radius</h3>
                     <input type="range" min="0" max="20" value={settings.layout.borderRadius} onChange={(e) => updateSetting("layout.borderRadius", Number(e.target.value))} className="w-full accent-orange-500" />
                  </div>
               </div>
            )}

            {activeTab === "table" && (
                <div className="space-y-4">
                    <ColorPicker label="Header Color" value={settings.table.headerColor} onChange={(v) => updateSetting("table.headerColor", v)} />
                    <label className="flex items-center justify-between p-2 border rounded cursor-pointer">
                        <span className="text-sm">Striped Rows</span>
                        <input type="checkbox" checked={settings.table.striped} onChange={(e) => updateSetting("table.striped", e.target.checked)} />
                    </label>
                    <label className="flex items-center justify-between p-2 border rounded cursor-pointer">
                        <span className="text-sm">Rounded Corners</span>
                        <input type="checkbox" checked={settings.table.rounded} onChange={(e) => updateSetting("table.rounded", e.target.checked)} />
                    </label>
                    <div className="pt-2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Columns</h3>
                        {Object.entries(settings.table.columns).map(([key, val]) => (
                             <label key={key} className="flex items-center justify-between p-2 border-b">
                                <span className="text-sm capitalize">{key}</span>
                                <input type="checkbox" checked={val} onChange={(e) => updateSetting(`table.columns.${key}`, e.target.checked)} />
                             </label>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === "text" && (
                <div className="space-y-4">
                    {["invoiceTitle", "from", "to", "item", "total"].map(f => (
                        <Input key={f} label={f.toUpperCase()} value={settings.labels[f]} onChange={(e) => updateSetting(`labels.${f}`, e.target.value)} />
                    ))}
                    <div className="pt-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Payment Instructions</label>
                        <textarea rows={4} className="w-full p-2 border rounded text-sm" value={settings.paymentTerms.bankDetails} onChange={(e) => updateSetting("paymentTerms.bankDetails", e.target.value)} />
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* --- RIGHT: PREVIEW --- */}
      <div className={`hidden lg:flex flex-1 bg-gray-900 flex-col overflow-hidden ${isRTL ? "border-l" : "border-r"} border-gray-700`}>
         <div className="h-14 flex items-center justify-between px-6 border-b border-gray-700 bg-gray-900 shrink-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Preview
            </span>
            <div className="text-gray-500 text-xs flex items-center gap-2"><Eye size={14} /> Interactive</div>
         </div>
         <div className="flex-1 w-full h-full bg-gray-800 p-8 overflow-auto flex justify-center">
             <LiveInvoicePreview settings={settings} data={previewData} onReorder={reorderSections} onEditSection={setActiveTab} />
         </div>
      </div>
    </div>
  );
};

export default InvoiceCustomizationPage;