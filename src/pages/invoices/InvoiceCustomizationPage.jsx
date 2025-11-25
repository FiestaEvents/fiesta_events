import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Save, Layout, Palette, Type, Image as ImageIcon,
  RotateCcw, Table as TableIcon, Grid, Move, Check,
  ZoomIn, ZoomOut, Menu, Layers,
  DollarSign, ArrowLeft, X
} from "lucide-react";

// ✅ Services & API
import { invoiceService } from "../../api/index";
import { useToast } from "../../context/ToastContext";

// ✅ Generic Components
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Default configuration
const DEFAULT_SETTINGS = {
  branding: {
    logo: { url: "", width: 150, height: 60, position: "left" },
    colors: { primary: "#F18237", secondary: "#374151", text: "#1F2937", background: "#FFFFFF" },
    fonts: { body: "Helvetica", heading: "Helvetica", size: 10 },
    watermark: { enabled: false, url: "" }
  },
  layout: {
    template: "modern",
    borderRadius: 4,
    density: "standard",
    sections: [
      { id: "header", label: "Header (Logo)", visible: true, order: 1 },
      { id: "details", label: "Details (From/To)", visible: true, order: 2 },
      { id: "items", label: "Line Items Table", visible: true, order: 3 },
      { id: "totals", label: "Totals & Tax", visible: true, order: 4 },
      { id: "footer", label: "Footer (Terms)", visible: true, order: 5 },
    ]
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
      total: true
    }
  },
  labels: {
    invoiceTitle: "INVOICE",
    from: "From",
    to: "Bill To",
    item: "Description",
    quantity: "Qty",
    rate: "Price",
    total: "Amount"
  },
  companyInfo: { displayName: "My Venue" },
  currency: { symbol: "DT", position: "after" },
  paymentTerms: { bankDetails: "" }
};

const InvoiceSettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("branding");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [zoom, setZoom] = useState(0.85);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getSettings();
      const data = response.data || {};

      setSettings(prev => ({
        ...prev,
        ...data,
        branding: { ...prev.branding, ...data.branding },
        layout: { ...prev.layout, ...data.layout },
        table: {
          ...prev.table,
          ...data.table,
          columns: { ...prev.table.columns, ...(data.table?.columns || {}) }
        },
        labels: { ...prev.labels, ...data.labels },
        paymentTerms: { ...prev.paymentTerms, ...data.paymentTerms }
      }));
    } catch (error) {
      console.error("Fetch error:", error);
      showError(t('invoiceCustomization.toasts.loadError', "Failed to load settings. Using defaults."));
    } finally {
      setLoading(false);
    }
  }, [showError, t]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = (path, value) => {
    setSettings(prev => {
      const newSettings = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const handleFileUpload = (e, fieldPath) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      updateSetting(fieldPath, e.target.result);
      showSuccess(t('invoiceCustomization.toasts.imageUpdated', "Image updated locally (save to persist)"));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await invoiceService.updateSettings(settings);
      showSuccess(t('invoiceCustomization.toasts.saveSuccess', "Design saved successfully!"));
    } catch (error) {
      console.error(error);
      showError(t('invoiceCustomization.toasts.saveError', "Failed to save settings."));
    } finally {
      setSaving(false);
    }
  };

  const moveSection = (index, direction) => {
    const sections = [...settings.layout.sections];
    if (direction === 'up' && index > 0) {
      [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
    } else if (direction === 'down' && index < sections.length - 1) {
      [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
    }
    sections.forEach((s, i) => s.order = i + 1);
    updateSetting('layout.sections', sections);
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('data:')) return path;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  if (loading) return <div className="flex h-screen justify-center items-center"><LoadingSpinner size="lg" /></div>;

  const TABS = [
    { id: 'branding', label: t('invoiceCustomization.tabs.brand', 'Brand'), icon: Palette },
    { id: 'layout', label: t('invoiceCustomization.tabs.layout', 'Layout'), icon: Layers },
    { id: 'table', label: t('invoiceCustomization.tabs.table', 'Table'), icon: TableIcon },
    { id: 'style', label: t('invoiceCustomization.tabs.style', 'Style'), icon: Layout },
    { id: 'text', label: t('invoiceCustomization.tabs.content', 'Content'), icon: Type },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden relative">

      {/* Mobile Menu Toggle */}
      <button
        className="lg:hidden absolute top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md text-gray-700"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* LEFT SIDEBAR */}
      <div className={`
        fixed lg:static inset-y-0 left-0 w-full sm:w-96 bg-white border-r border-gray-200 
        flex flex-col shadow-2xl lg:shadow-none z-40 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 bg-white">
          <Button variant="ghost" size="sm" onClick={() => navigate("/invoices")} className="p-2 h-auto">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">{t('invoiceCustomization.title', 'Invoice Design')}</h1>
            <p className="text-xs text-gray-500">{t('invoiceCustomization.subtitle', 'Customize your invoice template')}</p>
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-orange-600 shadow-sm ring-1 ring-orange-100'
                    : 'text-gray-500 hover:bg-gray-200/50'
                }`}
              >
                <tab.icon size={18} className="mb-1" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

          {/* BRANDING */}
          {activeTab === 'branding' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('invoiceCustomization.branding.companyLogo', 'Company Logo')}</label>
                <div className="relative h-32 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-orange-50/30 hover:border-orange-300 transition-all flex flex-col items-center justify-center overflow-hidden group">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileUpload(e, 'branding.logo.url')} accept="image/*" />
                  {settings.branding.logo.url ? (
                    <img src={getImageUrl(settings.branding.logo.url)} className="h-full w-full object-contain p-2" alt="Logo" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 group-hover:text-orange-500">
                      <ImageIcon size={24} />
                      <span className="text-xs font-medium mt-2">{t('invoiceCustomization.branding.uploadLogo', 'Click to upload')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('invoiceCustomization.branding.brandColors', 'Colors')}</label>
                <ModernColorPicker label={t('invoiceCustomization.branding.primaryColor', 'Primary')} value={settings.branding.colors.primary} onChange={e => updateSetting('branding.colors.primary', e.target.value)} />
                <ModernColorPicker label={t('invoiceCustomization.branding.secondaryColor', 'Secondary')} value={settings.branding.colors.secondary} onChange={e => updateSetting('branding.colors.secondary', e.target.value)} />
              </div>
            </div>
          )}

          {/* LAYOUT */}
          {activeTab === 'layout' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">{t('invoiceCustomization.layout.sections', 'Sections')}</p>
              {settings.layout.sections.sort((a, b) => a.order - b.order).map((section, index) => (
                <div key={section.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <button
                    onClick={() => {
                      const newSections = [...settings.layout.sections];
                      newSections[index].visible = !newSections[index].visible;
                      updateSetting('layout.sections', newSections);
                    }}
                    className={`w-8 h-5 rounded-full p-0.5 transition-colors relative ${section.visible ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${section.visible ? 'translate-x-3' : 'translate-x-0'}`} />
                  </button>
                  <span className="flex-1 text-sm font-medium text-gray-700">{section.label}</span>
                  <div className="flex flex-col gap-1">
                    <button disabled={index === 0} onClick={() => moveSection(index, 'up')} className="text-gray-400 hover:text-orange-500 disabled:opacity-30"><Move size={12} className="rotate-180" /></button>
                    <button disabled={index === settings.layout.sections.length - 1} onClick={() => moveSection(index, 'down')} className="text-gray-400 hover:text-orange-500 disabled:opacity-30"><Move size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TABLE */}
          {activeTab === 'table' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('invoiceCustomization.table.style', 'Appearance')}</h4>
                <ModernColorPicker label={t('invoiceCustomization.table.headerBg', 'Header Bg')} value={settings.table.headerColor || settings.branding.colors.primary} onChange={e => updateSetting('table.headerColor', e.target.value)} />
                
                <div className="grid grid-cols-2 gap-4">
                  <ModernSwitch label={t('invoiceCustomization.table.striped', 'Striped')} checked={settings.table.striped} onChange={e => updateSetting('table.striped', e.target.checked)} />
                  <ModernSwitch label={t('invoiceCustomization.table.rounded', 'Rounded')} checked={settings.table.rounded} onChange={e => updateSetting('table.rounded', e.target.checked)} />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('invoiceCustomization.table.visibleColumns', 'Columns')}</h4>
                {Object.entries(settings.table.columns).map(([key, val]) => (
                  <label key={key} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${val ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
                    <span className="text-sm font-medium capitalize text-gray-700">{t(`invoiceCustomization.columns.${key}`, key)}</span>
                    <input type="checkbox" checked={val} onChange={e => updateSetting(`table.columns.${key}`, e.target.checked)} className="accent-orange-500 w-4 h-4" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STYLE */}
          {activeTab === 'style' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">{t('invoiceCustomization.style.density', 'Density')}</label>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {['compact', 'standard', 'spacious'].map(mode => (
                    <button key={mode} onClick={() => updateSetting('layout.density', mode)} className={`flex-1 py-2 text-xs font-medium rounded-md capitalize ${settings.layout.density === mode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                      {t(`invoiceCustomization.density.${mode}`, mode)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm space-y-5">
                <RangeSlider label={t('invoiceCustomization.style.fontSize', 'Font Size')} icon={<Type size={14} />} value={settings.branding.fonts.size} min={8} max={14} step={1} suffix="px" onChange={e => updateSetting('branding.fonts.size', parseInt(e.target.value))} />
                <div className="h-px bg-gray-100"></div>
                <RangeSlider label={t('invoiceCustomization.style.radius', 'Radius')} icon={<Grid size={14} />} value={settings.layout.borderRadius} min={0} max={24} step={2} suffix="px" onChange={e => updateSetting('layout.borderRadius', parseInt(e.target.value))} />
              </div>
            </div>
          )}

          {/* CONTENT */}
          {activeTab === 'text' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-3">
                {['invoiceTitle', 'from', 'to', 'item', 'total'].map(label => (
                  <div key={label}>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider">{t(`invoiceCustomization.labels.${label}`, `${label} Label`)}</label>
                    <input type="text" value={settings.labels[label]} onChange={e => updateSetting(`labels.${label}`, e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2"><DollarSign size={14} /> {t('invoiceCustomization.labels.paymentInstructions', 'Payment Instructions')}</label>
                <textarea rows={4} value={settings.paymentTerms.bankDetails} onChange={e => updateSetting('paymentTerms.bankDetails', e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Bank details, terms, etc." />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0 flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={fetchSettings} icon={RotateCcw}>{t('common.reset', 'Reset')}</Button>
          <Button variant="primary" className="flex-1" onClick={handleSave} loading={saving} icon={Save}>{t('common.save', 'Save')}</Button>
        </div>
      </div>

      {/* RIGHT SIDEBAR (PREVIEW) */}
      <div className="flex-1 bg-gray-800/95 relative overflow-hidden flex flex-col">
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2">
          <div className="bg-gray-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-3 shadow-xl border border-gray-700">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="hover:text-orange-400"><ZoomOut size={16} /></button>
            <span className="text-xs font-mono w-8 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="hover:text-orange-400"><ZoomIn size={16} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-auto flex justify-center p-8 lg:p-12 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="origin-top transition-transform duration-200 ease-out shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-white" style={{ transform: `scale(${zoom})` }}>
            <InvoicePreview settings={settings} getImageUrl={getImageUrl} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components (Pure presentational, no translation needed)
const ModernColorPicker = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg bg-white">
    <span className="text-xs text-gray-600 font-medium pl-1">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-gray-400 uppercase bg-gray-100 px-1.5 py-0.5 rounded">{value}</span>
      <input type="color" value={value} onChange={onChange} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
    </div>
  </div>
);

const ModernSwitch = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${checked ? 'bg-orange-500' : 'bg-gray-300'}`}>
      <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
      <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
    </div>
    <span className="text-xs font-medium text-gray-700">{label}</span>
  </label>
);

const RangeSlider = ({ label, icon, value, min, max, step, suffix, onChange }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 text-gray-600">{icon}<span className="text-xs font-semibold">{label}</span></div>
      <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-mono">{value}{suffix}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full accent-orange-500 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
  </div>
);

const InvoicePreview = ({ settings, getImageUrl }) => {
  const paddingMap = { compact: '30px', standard: '50px', spacious: '80px' };
  const currentPadding = paddingMap[settings.layout.density] || '50px';

  const styles = {
    page: {
      fontFamily: settings.branding.fonts.body,
      fontSize: `${settings.branding.fonts.size}px`,
      color: settings.branding.colors.text,
      backgroundColor: '#fff',
      minHeight: '1123px', width: '794px', padding: currentPadding, position: 'relative',
    },
    primaryText: { color: settings.branding.colors.primary },
    secondaryText: { color: settings.branding.colors.secondary },
    borderRadius: `${settings.layout.borderRadius}px`,
    tableHeader: {
      backgroundColor: settings.table.headerColor || settings.branding.colors.primary,
      color: '#ffffff',
    }
  };

  const sortedSections = settings.layout.sections
    .filter(s => s.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div style={styles.page}>
      {settings.branding.watermark.enabled && settings.branding.watermark.url && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] overflow-hidden">
          <img src={getImageUrl(settings.branding.watermark.url)} className="w-2/3 object-contain" alt="Watermark" />
        </div>
      )}

      <div className="flex flex-col gap-8 h-full">
        {sortedSections.map(section => {
          if (section.id === 'header') {
            return (
              <div key="header" className="flex justify-between items-start">
                <div>
                  {settings.branding.logo.url ? (
                    <img src={getImageUrl(settings.branding.logo.url)} style={{ height: settings.branding.logo.height, borderRadius: styles.borderRadius }} className="object-contain" alt="Logo" />
                  ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 font-bold text-lg" style={{ width: 150, height: 60, borderRadius: styles.borderRadius }}>LOGO</div>
                  )}
                </div>
                <div className="text-right">
                  <h1 className="text-5xl font-black uppercase leading-none tracking-tighter" style={styles.primaryText}>{settings.labels.invoiceTitle}</h1>
                  <p style={styles.secondaryText} className="mt-2 font-medium opacity-60 tracking-wide text-sm">#INV-2025-001</p>
                </div>
              </div>
            );
          }
          if (section.id === 'details') {
            return (
              <div key="details" className="flex justify-between items-start pt-4">
                <div className="w-1/3">
                  <p className="text-[0.75em] font-bold uppercase tracking-widest opacity-40 mb-2.5 border-b border-gray-100 pb-1">{settings.labels.from}</p>
                  <p className="font-bold text-[1.2em] leading-tight mb-1.5 text-gray-900">{settings.companyInfo.displayName}</p>
                  <p className="opacity-70 leading-relaxed">123 Venue Street<br />Tunis, Tunisia</p>
                </div>
                <div className="w-1/3 text-right">
                  <p className="text-[0.75em] font-bold uppercase tracking-widest opacity-40 mb-2.5 border-b border-gray-100 pb-1">{settings.labels.to}</p>
                  <p className="font-bold text-[1.2em] leading-tight mb-1.5 text-gray-900">Client Name</p>
                  <p className="opacity-70 leading-relaxed">client@example.com<br />+216 12 345 678</p>
                </div>
              </div>
            );
          }
          if (section.id === 'items') {
            return (
              <div key="items" className="pt-4">
                <table className="w-full" style={{ borderCollapse: settings.table.rounded ? 'separate' : 'collapse', borderSpacing: 0 }}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      {settings.table.columns.description && (
                        <th className="py-3 px-4 text-left font-bold text-[0.85em] uppercase tracking-wider"
                          style={{ borderTopLeftRadius: settings.table.rounded ? styles.borderRadius : 0, borderBottomLeftRadius: settings.table.rounded ? styles.borderRadius : 0 }}>
                          {settings.labels.item}
                        </th>
                      )}
                      {settings.table.columns.quantity && <th className="py-3 px-2 text-center font-bold text-[0.85em] uppercase tracking-wider">{settings.labels.quantity}</th>}
                      {settings.table.columns.rate && <th className="py-3 px-2 text-right font-bold text-[0.85em] uppercase tracking-wider">{settings.labels.rate}</th>}
                      {settings.table.columns.discount && <th className="py-3 px-2 text-right font-bold text-[0.85em] uppercase tracking-wider">Disc.</th>}
                      {settings.table.columns.tax && <th className="py-3 px-2 text-right font-bold text-[0.85em] uppercase tracking-wider">Tax</th>}
                      {settings.table.columns.total && (
                        <th className="py-3 px-4 text-right font-bold text-[0.85em] uppercase tracking-wider"
                          style={{ borderTopRightRadius: settings.table.rounded ? styles.borderRadius : 0, borderBottomRightRadius: settings.table.rounded ? styles.borderRadius : 0 }}>
                          {settings.labels.total}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="text-[0.95em]">
                    {[1, 2].map((item, idx) => (
                      <tr key={item} className={settings.table.striped && idx % 2 !== 0 ? 'bg-gray-100' : ''}>
                        {settings.table.columns.description && <td className="py-5 px-4 border-b border-gray-100"><p className="font-bold text-gray-800">Premium Service {item}</p><p className="text-[0.85em] opacity-60 mt-1">Service description details...</p></td>}
                        {settings.table.columns.quantity && <td className="py-5 px-2 text-center border-b border-gray-100 align-top pt-5 font-medium opacity-80">1</td>}
                        {settings.table.columns.rate && <td className="py-5 px-2 text-right border-b border-gray-100 align-top pt-5 font-medium opacity-80">1,000.00</td>}
                        {settings.table.columns.discount && <td className="py-5 px-2 text-right border-b border-gray-100 text-red-500 align-top pt-5">-50.00</td>}
                        {settings.table.columns.tax && <td className="py-5 px-2 text-right border-b border-gray-100 opacity-60 align-top pt-5">190.00</td>}
                        {settings.table.columns.total && <td className="py-5 px-4 text-right border-b border-gray-100 font-bold align-top pt-5 text-gray-800">1,140.00</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          if (section.id === 'totals') {
            return (
              <div key="totals" className="flex justify-end pt-2">
                <div className="w-5/12 space-y-3">
                  <div className="flex justify-between text-[0.9em] opacity-70 border-b border-gray-100 pb-2"><span className="font-medium">Subtotal</span><span>2,000.00 {settings.currency.symbol}</span></div>
                  <div className="flex justify-between text-[0.9em] opacity-70 border-b border-gray-100 pb-2"><span className="font-medium">Tax (19%)</span><span>380.00 {settings.currency.symbol}</span></div>
                  {settings.table.columns.discount && <div className="flex justify-between text-[0.9em] text-red-500 border-b border-gray-100 pb-2"><span className="font-medium">Discount</span><span>-100.00 {settings.currency.symbol}</span></div>}
                  <div className="flex justify-between text-[1.4em] font-extrabold pt-2" style={{ color: settings.branding.colors.primary }}><span>Total</span><span>2,280.00 {settings.currency.symbol}</span></div>
                </div>
              </div>
            );
          }
          if (section.id === 'footer' && settings.paymentTerms.bankDetails) {
            return (
              <div key="footer" className="mt-auto pt-8">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h4 className="font-bold mb-3 uppercase text-[0.8em] tracking-wider flex items-center gap-2" style={styles.primaryText}>Payment Instructions</h4>
                  <div className="opacity-70 whitespace-pre-line leading-relaxed text-[0.9em] font-medium text-gray-600">{settings.paymentTerms.bankDetails}</div>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default InvoiceSettingsPage;