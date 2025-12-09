import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Users,
  Calendar,
  DollarSign,
  Scale,
  Search,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Briefcase,
  Settings,
  Tag,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// ✅ Imports
import {
  clientService,
  partnerService,
  eventService,
  contractService,
} from "../../api/index";
import { useToast } from "../../hooks/useToast";
import OrbitLoader from "../../components/common/LoadingSpinner";
import LiveContractPreview from "./LiveContractPreview";
import Button from "../../components/common/Button";

// --- CONSTANTS ---
const PARTNER_CATEGORIES = [
  "driver",
  "bakery",
  "catering",
  "decoration",
  "photography",
  "music",
  "security",
  "cleaning",
  "audio_visual",
  "floral",
  "entertainment",
  "hairstyling",
  "other",
];

// --- UI HELPERS ---
const StepButton = ({ isActive, isDone, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    disabled={!isActive && !isDone}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0
      ${
        isActive
          ? "bg-orange-100 text-orange-700 ring-2 ring-orange-500 dark:bg-orange-900/40 dark:text-orange-300 dark:ring-orange-400"
          : ""
      }
      ${
        isDone
          ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
          : ""
      }
      ${
        !isActive && !isDone
          ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
          : ""
      }
    `}
  >
    {isDone ? <Check size={16} /> : <Icon size={16} />}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const ContractFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { showSuccess, apiError } = useToast();
  const { t, i18n } = useTranslation();

  const isEditMode = Boolean(id);
  const initialType = searchParams.get("type") || "client";
  const isRTL = i18n.dir() === "rtl";
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  // --- STATE ---
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Data Sources
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [events, setEvents] = useState([]);
  const [settings, setSettings] = useState(null);

  // Form UI State
  const [recipientSearch, setRecipientSearch] = useState("");
  const [services, setServices] = useState([
    { description: "Prestation", quantity: 1, rate: 0, amount: 0 },
  ]);

  const [formData, setFormData] = useState({
    contractType: initialType,
    status: "draft",
    title: "",
    eventId: "",
    party: {
      id: "",
      type: "individual",
      name: "",
      identifier: "",
      email: "",
      phone: "",
      address: "",
      representative: "",
      category: "other",
      priceType: "fixed",
    },
    logistics: {
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      checkInTime: "10:00",
      checkOutTime: "00:00",
    },
    financials: {
      amountHT: 0,
      vatRate: 19,
      taxAmount: 0,
      stampDuty: 1.0,
      totalTTC: 0,
    },
    paymentTerms: { depositAmount: 0, securityDeposit: 0 },
    legal: { jurisdiction: "Tribunal de Tunis", specialConditions: "" },
  });

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchLoading(true);
        const [stRes, cRes, pRes, eRes] = await Promise.all([
          contractService.getSettings(),
          clientService.getAll({ limit: 100, status: "active" }),
          partnerService.getAll({ limit: 100, status: "active" }),
          eventService.getAll({ limit: 100 }),
        ]);

        const settingsData = stRes.data?.settings || stRes.settings || {};
        setSettings(settingsData);

        setClients(cRes.data?.clients || cRes.clients || []);
        setPartners(pRes.data?.partners || pRes.partners || []);
        setEvents(eRes.data?.events || eRes.events || []);

        if (!isEditMode) {
          const isPartner = initialType === "partner";
          setFormData((prev) => ({
            ...prev,
            financials: {
              ...prev.financials,
              vatRate: isPartner
                ? 0
                : settingsData.financialDefaults?.defaultVatRate || 19,
              stampDuty: isPartner
                ? 0
                : settingsData.financialDefaults?.defaultStampDuty || 1.0,
            },
            legal: { ...prev.legal, jurisdiction: "Tribunal de Tunis" },
          }));
        }

        if (isEditMode) {
          const res = await contractService.getById(id);
          const contract =
            res.data?.contract || res.contract || res.message?.contract;
          if (contract) {
            setFormData({
              ...contract,
              eventId: contract.event?._id || contract.event || "",
              logistics: {
                startDate: contract.logistics?.startDate?.split("T")[0],
                endDate: contract.logistics?.endDate?.split("T")[0],
                checkInTime: contract.logistics?.checkInTime,
                checkOutTime: contract.logistics?.checkOutTime,
              },
              party: { ...formData.party, ...contract.party },
              financials: contract.financials || {
                amountHT: 0,
                vatRate: 19,
                stampDuty: 1.0,
              },
              paymentTerms: contract.paymentTerms || {},
              legal: contract.legal || {},
            });
            if (contract.services) setServices(contract.services);
            if (contract.party?.name) setRecipientSearch(contract.party.name);
          }
        }
      } catch (err) {
        apiError(err, t("contracts.form.messages.loadError"));
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, [id, isEditMode, initialType]);

  // --- 2. CALCULATIONS ---
  useEffect(() => {
    const calculatedHT = services.reduce(
      (sum, item) =>
        sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0),
      0
    );
    const vatRate = parseFloat(formData.financials.vatRate) || 0;
    const stampDuty = parseFloat(formData.financials.stampDuty) || 0;
    const taxAmount = (calculatedHT * vatRate) / 100;
    const totalTTC = calculatedHT + taxAmount + stampDuty;

    if (
      Math.abs(totalTTC - formData.financials.totalTTC) > 0.001 ||
      Math.abs(calculatedHT - formData.financials.amountHT) > 0.001
    ) {
      setFormData((prev) => ({
        ...prev,
        financials: {
          ...prev.financials,
          amountHT: calculatedHT,
          taxAmount: taxAmount.toFixed(3),
          totalTTC: totalTTC.toFixed(3),
        },
      }));
    }
  }, [services, formData.financials.vatRate, formData.financials.stampDuty]);

  // --- 3. HANDLERS ---
  const handleRecipientSelect = (recipientId) => {
    const isPartner = formData.contractType === "partner";
    const list = isPartner ? partners : clients;
    const selected = list.find((r) => r._id === recipientId);

    if (selected) {
      const isCompany = !!(selected.company || selected.companyName);
      const displayAddress = selected.address?.street
        ? `${selected.address.street}, ${selected.address.city || ""}`
        : typeof selected.address === "string"
          ? selected.address
          : "";

      const newParty = {
        id: selected._id,
        type: isCompany ? "company" : "individual",
        name: selected.company || selected.name,
        identifier: selected.taxId || selected.cin || "",
        email: selected.email,
        phone: selected.phone,
        address: displayAddress,
        representative: selected.contactPerson || "",
        category: selected.category || "other",
        priceType: selected.priceType || "fixed",
      };

      let newServices = [];
      if (isPartner) {
        const desc = selected.category
          ? `Prestation ${selected.category}`
          : `Services Partenaire`;
        const rate =
          selected.priceType === "fixed"
            ? selected.fixedRate || 0
            : selected.hourlyRate || 0;
        newServices.push({
          description: desc,
          quantity: 1,
          rate: rate,
          amount: rate,
        });
        setFormData((prev) => ({
          ...prev,
          party: newParty,
          financials: { ...prev.financials, vatRate: 0, stampDuty: 0 },
        }));
      } else {
        newServices.push({
          description: "Location Espace & Services",
          quantity: 1,
          rate: 0,
          amount: 0,
        });
        setFormData((prev) => ({ ...prev, party: newParty }));
      }

      setServices(newServices);
      setRecipientSearch("");
    }
  };

  const handleServiceChange = (idx, field, val) => {
    const updated = [...services];
    updated[idx] = { ...updated[idx], [field]: val };
    updated[idx].amount =
      (parseFloat(updated[idx].quantity) || 0) *
      (parseFloat(updated[idx].rate) || 0);
    setServices(updated);
  };

  const handleNext = () => setCurrentStep((c) => Math.min(c + 1, 4));
  const handleBack = () => setCurrentStep((c) => Math.max(c - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { ...formData, services };
      if (!payload.contractNumber) delete payload.contractNumber;

      if (isEditMode) await contractService.update(id, payload);
      else await contractService.create(payload);

      showSuccess(t("contracts.form.messages.saveSuccess"));
      navigate("/contracts");
    } catch (e) {
      apiError(e, t("contracts.form.messages.error"));
    } finally {
      setLoading(false);
    }
  };

  const activeList = formData.contractType === "client" ? clients : partners;
  const filteredRecipients = activeList.filter((r) => {
    const term = recipientSearch.toLowerCase();
    return (
      (r.name && r.name.toLowerCase().includes(term)) ||
      (r.company && r.company.toLowerCase().includes(term)) ||
      (r.email && r.email.toLowerCase().includes(term))
    );
  });

  const isPartnerMode = formData.contractType === "partner";
  const themeColor = isPartnerMode ? "orange" : "orange";

  if (fetchLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <OrbitLoader />
      </div>
    );

  return (
    <div
      className="flex flex-col lg:flex-row h-full bg-gray-50 dark:bg-gray-900 overflow-hidden text-slate-800 dark:text-slate-100 font-sans"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* --- LEFT: FORM PANEL --- */}
      <div
        className={`flex-1 flex flex-col h-full bg-white dark:bg-[#1f2937] border-r border-gray-200 dark:border-gray-700 z-10 shadow-xl max-w-2xl ${isRTL ? "border-l border-r-0" : ""}`}
      >
        {/* HEADER & ACTIONS */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0 bg-white dark:bg-[#1f2937]">
          {/* Left: Title & Type Toggle */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/contracts")}
              className="text-gray-500"
            >
              <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                {isEditMode
                  ? t("contracts.form.title.edit")
                  : t("contracts.form.title.create")}
              </h1>
              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => {
                    setFormData((p) => ({ ...p, contractType: "client" }));
                    setRecipientSearch("");
                  }}
                  className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded transition-colors ${!isPartnerMode ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" : "text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-700"}`}
                >
                  {t("contracts.form.types.client")}
                </button>
                <div className="w-px bg-gray-200 dark:bg-gray-700 h-4 my-auto" />
                <button
                  onClick={() => {
                    setFormData((p) => ({ ...p, contractType: "partner" }));
                    setRecipientSearch("");
                  }}
                  className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded transition-colors ${isPartnerMode ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" : "text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-700"}`}
                >
                  {t("contracts.form.types.partner")}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => navigate("/contracts/settings")}
              title={t("contracts.form.nav.settings")}
            >
              <Settings size={20} />
            </Button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="text-gray-500"
            >
              <ChevronLeft size={18} className={isRTL ? "rotate-180" : ""} />
            </Button>

            {currentStep < 4 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                className="gap-1 px-4"
              >
                {t("contracts.form.nav.next")}{" "}
                <ChevronRight
                  size={16}
                  className={`opacity-60 ${isRTL ? "rotate-180" : ""}`}
                />
              </Button>
            ) : (
              <Button
                variant="success"
                size="sm"
                onClick={handleSubmit}
                loading={loading}
                className="gap-1 px-4"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} className="opacity-60" />
                )}
                {isEditMode
                  ? t("contracts.form.nav.update")
                  : t("contracts.form.nav.save")}
              </Button>
            )}
          </div>
        </div>

        {/* STEPPER INDICATOR */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex gap-1 overflow-x-auto shrink-0 scrollbar-hide">
          <StepButton
            isActive={currentStep === 1}
            isDone={currentStep > 1}
            icon={Users}
            label={t("contracts.form.steps.parties")}
            onClick={() => setCurrentStep(1)}
          />
          <ChevronIcon
            className={`text-gray-300 dark:text-gray-600 self-center shrink-0`}
            size={16}
          />
          <StepButton
            isActive={currentStep === 2}
            isDone={currentStep > 2}
            icon={Calendar}
            label={t("contracts.form.steps.dates")}
            onClick={() => setCurrentStep(2)}
          />
          <ChevronIcon
            className={`text-gray-300 dark:text-gray-600 self-center shrink-0`}
            size={16}
          />
          <StepButton
            isActive={currentStep === 3}
            isDone={currentStep > 3}
            icon={DollarSign}
            label={t("contracts.form.steps.finance")}
            onClick={() => setCurrentStep(3)}
          />
          <ChevronIcon
            className={`text-gray-300 dark:text-gray-600 self-center shrink-0`}
            size={16}
          />
          <StepButton
            isActive={currentStep === 4}
            isDone={currentStep > 4}
            icon={Scale}
            label={t("contracts.form.steps.legal")}
            onClick={() => setCurrentStep(4)}
          />
        </div>

        {/* --- SCROLLABLE FORM AREA --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: PARTY */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
              {/* Search Bar */}
              <div className="relative z-50">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("contracts.form.search.label")}
                </label>
                <div className="relative">
                  <Search
                    className={`absolute top-2.5 text-gray-400 ${isRTL ? "right-3" : "left-3"}`}
                    size={18}
                  />
                  <input
                    className={`w-full py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-${themeColor}-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"}`}
                    placeholder={
                      isPartnerMode
                        ? t("contracts.form.search.placeholderPartner")
                        : t("contracts.form.search.placeholderClient")
                    }
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                  />
                </div>
                {/* Dropdown Results */}
                {recipientSearch && filteredRecipients.length > 0 && (
                  <div className="absolute w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                    {filteredRecipients.map((r) => (
                      <button
                        key={r._id}
                        onClick={() => handleRecipientSelect(r._id)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center group"
                      >
                        <div>
                          <div className="font-bold text-sm text-gray-800 dark:text-gray-200">
                            {r.company || r.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {r.email}
                          </div>
                        </div>
                        {isPartnerMode && r.category && (
                          <div className="text-[10px] font-bold px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded uppercase">
                            {r.category}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Partner Category Grid */}
              {isPartnerMode && (
                <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-3 text-purple-800 dark:text-purple-300">
                    <Tag size={16} />
                    <h3 className="text-xs font-bold uppercase">
                      {t("contracts.form.party.category")}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PARTNER_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            party: { ...p.party, category: cat },
                          }))
                        }
                        className={`px-3 py-2 rounded text-xs font-medium capitalize border transition-all text-left truncate
                          ${
                            formData.party.category === cat
                              ? "bg-purple-600 text-white border-purple-600 shadow-md"
                              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500"
                          }`}
                      >
                        {cat.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Party Details Inputs */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex justify-between">
                  <h3 className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500">
                    {t("contracts.form.party.title")}
                  </h3>
                  {isPartnerMode && formData.party.priceType && (
                    <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded font-bold uppercase">
                      {t("contracts.form.party.rateType")}:{" "}
                      {formData.party.priceType}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      {t("contracts.form.party.name")}
                    </label>
                    <input
                      className="w-full p-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white"
                      value={formData.party.name}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          party: { ...p.party, name: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      {t("contracts.form.party.identifier")}
                    </label>
                    <input
                      className="w-full p-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white"
                      value={formData.party.identifier}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          party: { ...p.party, identifier: e.target.value },
                        }))
                      }
                      placeholder="MF / CIN"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      {t("contracts.form.party.phone")}
                    </label>
                    <input
                      className="w-full p-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white"
                      value={formData.party.phone}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          party: { ...p.party, phone: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      {t("contracts.form.party.address")}
                    </label>
                    <input
                      className="w-full p-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white"
                      value={formData.party.address}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          party: { ...p.party, address: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("contracts.form.party.contractTitle")}
                </label>
                <input
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded text-gray-900 dark:text-white"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder={t(
                    "contracts.form.party.contractTitlePlaceholder"
                  )}
                />
              </div>
            </div>
          )}

          {/* STEP 2: LOGISTICS */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    {t("contracts.form.logistics.start")}
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded text-gray-900 dark:text-white"
                    value={formData.logistics.startDate}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        logistics: {
                          ...p.logistics,
                          startDate: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    {t("contracts.form.logistics.end")}
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded text-gray-900 dark:text-white"
                    value={formData.logistics.endDate}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        logistics: { ...p.logistics, endDate: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    {t("contracts.form.logistics.checkIn")}
                  </label>
                  <input
                    type="time"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded text-gray-900 dark:text-white"
                    value={formData.logistics.checkInTime}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        logistics: {
                          ...p.logistics,
                          checkInTime: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    {t("contracts.form.logistics.checkOut")}
                  </label>
                  <input
                    type="time"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded text-gray-900 dark:text-white"
                    value={formData.logistics.checkOutTime}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        logistics: {
                          ...p.logistics,
                          checkOutTime: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("contracts.form.logistics.eventLink")}
                </label>
                <select
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.eventId}
                  onChange={(e) => {
                    const evt = events.find((ev) => ev._id === e.target.value);
                    setFormData((p) => ({
                      ...p,
                      eventId: e.target.value,
                      title: evt ? `Contrat - ${evt.title}` : p.title,
                    }));
                  }}
                >
                  <option value="">
                    {t("contracts.form.logistics.select")}
                  </option>
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: FINANCIALS */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              {isPartnerMode && (
                <div className="flex gap-2 p-3 bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300 rounded-lg text-sm border border-purple-100 dark:border-purple-800">
                  <Briefcase size={18} className="shrink-0" />
                  <p>{t("contracts.form.financials.partnerMode")}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {t("contracts.form.financials.title")}
                  </label>
                  <button
                    onClick={() =>
                      setServices([
                        ...services,
                        { description: "", quantity: 1, rate: 0, amount: 0 },
                      ])
                    }
                    className={`text-xs font-bold text-${themeColor}-600 dark:text-${themeColor}-400 flex items-center gap-1`}
                  >
                    <Plus size={14} /> {t("contracts.form.financials.add")}
                  </button>
                </div>

                {/* Services List */}
                {services.map((svc, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 items-center bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 group"
                  >
                    <input
                      className="flex-1 bg-transparent border-b border-transparent focus:border-orange-400 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder={t("contracts.form.financials.description")}
                      value={svc.description}
                      onChange={(e) =>
                        handleServiceChange(idx, "description", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      className="w-16 text-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm py-1 text-gray-900 dark:text-white"
                      value={svc.quantity}
                      onChange={(e) =>
                        handleServiceChange(idx, "quantity", e.target.value)
                      }
                      placeholder={t("contracts.form.financials.qty")}
                    />
                    <input
                      type="number"
                      className="w-20 text-right bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm py-1 text-gray-900 dark:text-white"
                      placeholder={t("contracts.form.financials.price")}
                      value={svc.rate}
                      onChange={(e) =>
                        handleServiceChange(idx, "rate", e.target.value)
                      }
                    />
                    <button
                      onClick={() =>
                        setServices(services.filter((_, i) => i !== idx))
                      }
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Totals Summary */}
              <div
                className={`text-gray-900 rounded-xl p-5 shadow-lg ${isPartnerMode ? "bg-white" : "bg-white"} dark:bg-gray-700 dark:text-white`}
              >
                <div className="flex justify-between text-sm mb-2 opacity-80">
                  <span>{t("contracts.form.financials.totalHT")}</span>
                  <span>{formData.financials.amountHT.toFixed(3)}</span>
                </div>

                <div className="flex justify-between text-sm mb-2 items-center opacity-80">
                  <div className="flex items-center gap-2">
                    <span>{t("contracts.form.financials.vat")}</span>
                    <input
                      className="w-10 bg-white/10 text-center rounded border-none text-xs py-0.5 text-white"
                      value={formData.financials.vatRate}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          financials: {
                            ...p.financials,
                            vatRate: e.target.value,
                          },
                        }))
                      }
                    />
                    <span>%</span>
                  </div>
                  <span>{formData.financials.taxAmount}</span>
                </div>
                <div className="flex justify-between text-sm mb-4 items-center opacity-80 border-b border-white/20 pb-3">
                  <span>{t("contracts.form.financials.stamp")}</span>
                  <input
                    className="w-14 bg-white/10 text-right rounded border-none text-xs py-0.5 text-white"
                    value={formData.financials.stampDuty}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        financials: {
                          ...p.financials,
                          stampDuty: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="flex justify-between text-xl font-bold">
                  <span>{isPartnerMode ? "NET À PAYER" : "TOTAL TTC"}</span>
                  <span>{formData.financials.totalTTC} TND</span>
                </div>
              </div>

              {/* Deposit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                    {t("contracts.form.financials.deposit")}
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white"
                    value={formData.paymentTerms.depositAmount}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        paymentTerms: {
                          ...p.paymentTerms,
                          depositAmount: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: LEGAL */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("contracts.form.legal.jurisdiction")}
                </label>
                <select
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.legal.jurisdiction}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      legal: { ...p.legal, jurisdiction: e.target.value },
                    }))
                  }
                >
                  <option value="Tribunal de Tunis">Tribunal de Tunis</option>
                  <option value="Tribunal de l'Ariana">
                    Tribunal de l'Ariana
                  </option>
                  <option value="Tribunal de Sousse">Tribunal de Sousse</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("contracts.form.legal.specialConditions")}
                </label>
                <textarea
                  rows={5}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t(
                    "contracts.form.legal.specialConditionsPlaceholder"
                  )}
                  value={formData.legal.specialConditions}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      legal: { ...p.legal, specialConditions: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="flex gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs border border-blue-100 dark:border-blue-800">
                <AlertCircle size={16} className="shrink-0" />
                <p>{t("contracts.form.legal.warning")}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- RIGHT: PREVIEW --- */}
      <div
        className={`hidden lg:flex flex-1 bg-gray-900 items-center justify-center relative ${isRTL ? "border-r" : "border-l"} border-gray-700`}
      >
        <LiveContractPreview
          settings={settings}
          data={{ ...formData, services }}
        />
      </div>
    </div>
  );
};

export default ContractFormPage;
