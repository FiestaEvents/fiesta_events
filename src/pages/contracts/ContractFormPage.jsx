import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Save, Plus, Trash2, Users, Calendar, 
  DollarSign, Scale, Eye, Search, Building2, User, 
  Check, ChevronRight, Settings, AlertCircle
} from "lucide-react";

// SERVICES (Keep your original imports)
import { clientService, partnerService, eventService, contractService } from "../../api/index";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import LiveContractPreview from "./LiveContractPreview";

// --- SUB-COMPONENTS ---
const StepButton = ({ isActive, isDone, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    disabled={!isActive && !isDone}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0
      ${isActive ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-500' : ''}
      ${isDone ? 'bg-green-50 text-green-700' : ''}
      ${!isActive && !isDone ? 'text-gray-400 cursor-not-allowed' : ''}
    `}
  >
    {isDone ? <Check size={16} /> : <Icon size={16} />}
    <span>{label}</span>
  </button>
);

const ContractFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { showSuccess, apiError } = useToast();
  
  const isEditMode = Boolean(id);
  const initialType = searchParams.get("type") || "client";

  // --- STATE ---
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false); // Save loading
  const [fetchLoading, setFetchLoading] = useState(true); // Initial data loading

  // Data Sources
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [events, setEvents] = useState([]);
  const [settings, setSettings] = useState(null);

  // UI State
  const [recipientSearch, setRecipientSearch] = useState("");
  const [errors, setErrors] = useState({});

  // Form State
  const [services, setServices] = useState([{ description: "Location Salle", quantity: 1, rate: 0, amount: 0 }]);
  const [formData, setFormData] = useState({
    contractType: initialType,
    status: "draft",
    title: "",
    contractNumber: "", 
    eventId: "",
    
    party: {
      type: "individual",
      name: "",
      identifier: "", // CIN or MF
      representative: "",
      address: "",
      phone: "",
      email: ""
    },

    logistics: {
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      checkInTime: "10:00",
      checkOutTime: "00:00"
    },

    financials: {
      currency: "TND",
      amountHT: 0,
      vatRate: 19, // Default TN
      taxAmount: 0,
      stampDuty: 1.000, // Default TN
      totalTTC: 0
    },

    paymentTerms: {
      depositAmount: 0,
      securityDeposit: 0
    },

    legal: {
      jurisdiction: "Tribunal de Tunis",
      specialConditions: ""
    }
  });

  // --- 1. FETCH DATA (Restored Logic) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchLoading(true);
        // Fetch Settings, Clients, Partners, Events in parallel
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

        // Apply Defaults if new
        if (!isEditMode && settingsData) {
          setFormData(prev => ({
            ...prev,
            financials: {
              ...prev.financials,
              vatRate: settingsData.financialDefaults?.defaultVatRate || 19,
              stampDuty: settingsData.financialDefaults?.defaultStampDuty || 1.000
            },
            legal: { ...prev.legal, jurisdiction: "Tribunal de Tunis" }
          }));
        }

        // If Edit Mode, Load Existing Contract
        if (isEditMode) {
          const res = await contractService.getById(id);
          const contract = res.data?.contract || res.contract;
          if (contract) {
            setFormData({
              ...contract,
              eventId: contract.event?._id || contract.event || "",
              logistics: {
                startDate: contract.logistics?.startDate?.split('T')[0],
                endDate: contract.logistics?.endDate?.split('T')[0],
                checkInTime: contract.logistics?.checkInTime,
                checkOutTime: contract.logistics?.checkOutTime
              },
              party: contract.party || { type: 'individual', name: '' },
              financials: contract.financials || { amountHT: 0, vatRate: 19, stampDuty: 1.000 },
              paymentTerms: contract.paymentTerms || {},
              legal: contract.legal || {}
            });
            if (contract.services) setServices(contract.services);
          }
        }
      } catch (err) {
        apiError(err, "Impossible de charger les données");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, [id, isEditMode]);

  // --- 2. CALCULATIONS (Restored Logic) ---
  useEffect(() => {
    // 1. Calculate HT from Services
    const calculatedHT = services.reduce((sum, item) => {
      return sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0));
    }, 0);

    // 2. Calculate Tax & TTC
    const vatRate = parseFloat(formData.financials.vatRate) || 0;
    const stampDuty = parseFloat(formData.financials.stampDuty) || 0;
    const taxAmount = (calculatedHT * vatRate) / 100;
    const totalTTC = calculatedHT + taxAmount + stampDuty;

    // 3. Update State (avoid infinite loop by checking difference)
    if (
      Math.abs(calculatedHT - formData.financials.amountHT) > 0.001 ||
      Math.abs(totalTTC - formData.financials.totalTTC) > 0.001
    ) {
      setFormData(prev => ({
        ...prev,
        financials: {
          ...prev.financials,
          amountHT: calculatedHT,
          taxAmount: taxAmount.toFixed(3),
          totalTTC: totalTTC.toFixed(3)
        }
      }));
    }
  }, [services, formData.financials.vatRate, formData.financials.stampDuty]);

  // --- 3. HANDLERS ---

  // Handle auto-fill when selecting a client/partner from search
  const handleRecipientSelect = (recipientId) => {
    const list = formData.contractType === "client" ? clients : partners;
    const selected = list.find(r => r._id === recipientId);
    
    if (selected) {
      setFormData(prev => ({
        ...prev,
        party: {
          type: selected.companyName ? "company" : "individual",
          name: selected.companyName || selected.name, // Fallback logic
          identifier: selected.taxId || selected.cin || "", // MF or CIN
          email: selected.email,
          phone: selected.phone,
          address: selected.address?.street || selected.address || "",
          representative: selected.contactPerson || ""
        }
      }));
      setRecipientSearch(""); // Clear search
    }
  };

  const handleEventSelect = (evtId) => {
    const evt = events.find(e => e._id === evtId);
    setFormData(prev => ({
      ...prev,
      eventId: evtId,
      title: evt ? `Contrat - ${evt.title}` : prev.title,
      logistics: {
        ...prev.logistics,
        startDate: evt?.startDate?.split("T")[0] || prev.logistics.startDate,
        endDate: evt?.endDate?.split("T")[0] || prev.logistics.endDate
      }
    }));
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    // Recalc line amount for display
    const qty = parseFloat(newServices[index].quantity) || 0;
    const rate = parseFloat(newServices[index].rate) || 0;
    newServices[index].amount = qty * rate;
    setServices(newServices);
  };

  // Validation
  const validateStep = () => {
    const errs = {};
    if (currentStep === 1) {
      if (!formData.title) errs.title = "Le titre est obligatoire";
      if (!formData.party.name) errs.party = "Veuillez sélectionner ou saisir un client";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setCurrentStep(p => Math.min(p + 1, 4));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        ...formData,
        event: formData.eventId || undefined,
        services: services
      };
      
      if (isEditMode) await contractService.update(id, payload);
      else await contractService.create(payload);

      showSuccess(isEditMode ? "Contrat mis à jour" : "Contrat créé avec succès");
      navigate("/contracts");
    } catch (err) {
      apiError(err, "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const recipientList = formData.contractType === "client" ? clients : partners;
  const filteredRecipients = recipientList.filter(r => 
    (r.name || r.companyName || "").toLowerCase().includes(recipientSearch.toLowerCase())
  );

  if (fetchLoading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 overflow-hidden text-slate-800 font-sans">
      
      {/* --- LEFT: FORM PANEL (50%) --- */}
      <div className="flex-1 flex flex-col h-full bg-white border-r border-gray-200 z-10 shadow-xl max-w-2xl">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/contracts")} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{isEditMode ? "Modifier Contrat" : "Nouveau Contrat"}</h1>
              <div className="flex gap-2 mt-1">
                <button 
                  onClick={() => setFormData(p => ({ ...p, contractType: "client" }))}
                  className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${formData.contractType === 'client' ? 'bg-orange-100 text-orange-700' : 'text-gray-400 hover:bg-gray-100'}`}
                >Client</button>
                <button 
                  onClick={() => setFormData(p => ({ ...p, contractType: "partner" }))}
                  className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${formData.contractType === 'partner' ? 'bg-purple-100 text-purple-700' : 'text-gray-400 hover:bg-gray-100'}`}
                >Partenaire</button>
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600"><Settings size={20}/></button>
        </div>

        {/* STEPPER */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex gap-1 overflow-x-auto shrink-0">
          <StepButton isActive={currentStep===1} isDone={currentStep>1} icon={Users} label="Parties" onClick={()=>setCurrentStep(1)} />
          <ChevronRight className="text-gray-300 self-center" size={16}/>
          <StepButton isActive={currentStep===2} isDone={currentStep>2} icon={Calendar} label="Logistique" onClick={()=>setCurrentStep(2)} />
          <ChevronRight className="text-gray-300 self-center" size={16}/>
          <StepButton isActive={currentStep===3} isDone={currentStep>3} icon={DollarSign} label="Finance" onClick={()=>setCurrentStep(3)} />
          <ChevronRight className="text-gray-300 self-center" size={16}/>
          <StepButton isActive={currentStep===4} isDone={currentStep>4} icon={Scale} label="Légal" onClick={()=>setCurrentStep(4)} />
        </div>

        {/* SCROLLABLE FORM */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* STEP 1: PARTIES */}
          {currentStep === 1 && (
            <div className="animate-in slide-in-from-right-4 duration-300 space-y-5">
              
              {/* Recipient Search */}
              <div className="relative">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher un {formData.contractType}</label>
                 <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                      placeholder="Tapez pour rechercher..."
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                    />
                 </div>
                 {recipientSearch && (
                   <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                     {filteredRecipients.map(r => (
                       <button key={r._id} onClick={() => handleRecipientSelect(r._id)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50">
                         <div className="font-bold text-sm text-gray-800">{r.companyName || r.name}</div>
                         <div className="text-xs text-gray-500">{r.email}</div>
                       </button>
                     ))}
                     {filteredRecipients.length === 0 && <div className="p-3 text-sm text-gray-500 italic">Aucun résultat</div>}
                   </div>
                 )}
              </div>

              {/* Manual Entry Form */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                   <h3 className="font-bold text-sm uppercase text-gray-500">Détails du Tiers</h3>
                   <div className="flex bg-white rounded-lg p-1 shadow-sm">
                      <button onClick={() => setFormData(p=>({...p, party:{...p.party, type:'individual'}}))} className={`px-3 py-1 text-xs font-medium rounded ${formData.party.type==='individual' ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}>Physique</button>
                      <button onClick={() => setFormData(p=>({...p, party:{...p.party, type:'company'}}))} className={`px-3 py-1 text-xs font-medium rounded ${formData.party.type==='company' ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}>Morale</button>
                   </div>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                       <input 
                         className="w-full p-2 border border-gray-300 rounded focus:border-orange-500 outline-none text-sm"
                         placeholder={formData.party.type === 'company' ? "Nom de la Société" : "Nom complet"}
                         value={formData.party.name}
                         onChange={(e) => setFormData(p=>({...p, party:{...p.party, name: e.target.value}}))}
                       />
                       {errors.party && <span className="text-xs text-red-500">{errors.party}</span>}
                    </div>
                    <div>
                       <input 
                         className="w-full p-2 border border-gray-300 rounded focus:border-orange-500 outline-none text-sm"
                         placeholder={formData.party.type === 'company' ? "Matricule Fiscale" : "N° CIN / Passeport"}
                         value={formData.party.identifier}
                         onChange={(e) => setFormData(p=>({...p, party:{...p.party, identifier: e.target.value}}))}
                       />
                    </div>
                    <div>
                       <input 
                         className="w-full p-2 border border-gray-300 rounded focus:border-orange-500 outline-none text-sm"
                         placeholder="Téléphone"
                         value={formData.party.phone}
                         onChange={(e) => setFormData(p=>({...p, party:{...p.party, phone: e.target.value}}))}
                       />
                    </div>
                    <div className="col-span-2">
                       <input 
                         className="w-full p-2 border border-gray-300 rounded focus:border-orange-500 outline-none text-sm"
                         placeholder="Adresse complète"
                         value={formData.party.address}
                         onChange={(e) => setFormData(p=>({...p, party:{...p.party, address: e.target.value}}))}
                       />
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Link */}
              <div className="pt-2 border-t border-gray-100">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Titre du Contrat *</label>
                 <input 
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.title}
                    onChange={(e) => setFormData(p=>({...p, title: e.target.value}))}
                    placeholder="Ex: Contrat de Mariage..."
                 />
                 {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
                 
                 <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Lier à un événement (Optionnel)</label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                      value={formData.eventId}
                      onChange={(e) => handleEventSelect(e.target.value)}
                    >
                      <option value="">Sélectionner...</option>
                      {events.map(e => <option key={e._id} value={e._id}>{e.title} ({e.startDate.split('T')[0]})</option>)}
                    </select>
                 </div>
              </div>
            </div>
          )}

          {/* STEP 2: LOGISTICS */}
          {currentStep === 2 && (
            <div className="animate-in slide-in-from-right-4 duration-300 grid grid-cols-2 gap-5">
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date Début</label>
                  <input type="date" className="w-full p-2 border border-gray-300 rounded" value={formData.logistics.startDate} onChange={e => setFormData(p=>({...p, logistics: {...p.logistics, startDate: e.target.value}}))} />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date Fin</label>
                  <input type="date" className="w-full p-2 border border-gray-300 rounded" value={formData.logistics.endDate} onChange={e => setFormData(p=>({...p, logistics: {...p.logistics, endDate: e.target.value}}))} />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Heure Accès</label>
                  <input type="time" className="w-full p-2 border border-gray-300 rounded" value={formData.logistics.checkInTime} onChange={e => setFormData(p=>({...p, logistics: {...p.logistics, checkInTime: e.target.value}}))} />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Heure Libération</label>
                  <input type="time" className="w-full p-2 border border-gray-300 rounded" value={formData.logistics.checkOutTime} onChange={e => setFormData(p=>({...p, logistics: {...p.logistics, checkOutTime: e.target.value}}))} />
               </div>
            </div>
          )}

          {/* STEP 3: FINANCIALS */}
          {currentStep === 3 && (
            <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
              
              {/* Services List */}
              <div className="space-y-3">
                 <div className="flex justify-between items-end">
                    <label className="text-sm font-bold text-gray-700">Prestations / Services</label>
                    <button onClick={() => setServices([...services, {description:'', quantity:1, rate:0, amount:0}])} className="text-orange-600 text-xs font-bold flex items-center gap-1 hover:underline"><Plus size={14}/> AJOUTER</button>
                 </div>
                 {services.map((svc, idx) => (
                   <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded border border-gray-200 group">
                      <input className="flex-1 bg-transparent border-b border-transparent focus:border-orange-400 outline-none text-sm" placeholder="Description..." value={svc.description} onChange={e => handleServiceChange(idx, 'description', e.target.value)} />
                      <input type="number" className="w-12 text-center bg-white border border-gray-200 rounded text-sm py-1" value={svc.quantity} onChange={e => handleServiceChange(idx, 'quantity', e.target.value)} />
                      <input type="number" className="w-20 text-right bg-white border border-gray-200 rounded text-sm py-1" placeholder="Prix" value={svc.rate} onChange={e => handleServiceChange(idx, 'rate', e.target.value)} />
                      <button onClick={() => setServices(services.filter((_,i)=>i!==idx))} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                   </div>
                 ))}
              </div>

              {/* Summary Card */}
              <div className="bg-slate-800 text-white rounded-xl p-5 shadow-lg">
                 <div className="flex justify-between text-sm mb-2 text-slate-300">
                    <span>Total HT</span>
                    <span>{formData.financials.amountHT.toFixed(3)}</span>
                 </div>
                 <div className="flex justify-between text-sm mb-2 text-slate-300 items-center">
                    <div className="flex items-center gap-2">
                       <span>TVA</span>
                       <input className="w-10 bg-slate-700 text-center rounded border-none text-xs py-0.5" value={formData.financials.vatRate} onChange={e => setFormData(p=>({...p, financials: {...p.financials, vatRate: e.target.value}}))} />
                       <span>%</span>
                    </div>
                    <span>{formData.financials.taxAmount}</span>
                 </div>
                 <div className="flex justify-between text-sm mb-4 text-slate-300 pb-4 border-b border-slate-600">
                    <span>Timbre Fiscal</span>
                    <input className="w-16 bg-slate-700 text-right rounded border-none text-xs py-0.5" value={formData.financials.stampDuty} onChange={e => setFormData(p=>({...p, financials: {...p.financials, stampDuty: e.target.value}}))} />
                 </div>
                 <div className="flex justify-between text-xl font-bold text-white">
                    <span>NET TTC</span>
                    <span>{formData.financials.totalTTC} TND</span>
                 </div>
              </div>

              {/* Payment Terms */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-gray-500 mb-1 block">Avance (TND)</label>
                    <input type="number" className="w-full p-2 border border-gray-300 rounded text-sm" value={formData.paymentTerms.depositAmount} onChange={e => setFormData(p=>({...p, paymentTerms: {...p.paymentTerms, depositAmount: e.target.value}}))} />
                 </div>
                 <div>
                    <label className="text-xs text-gray-500 mb-1 block">Caution (TND)</label>
                    <input type="number" className="w-full p-2 border border-gray-300 rounded text-sm" value={formData.paymentTerms.securityDeposit} onChange={e => setFormData(p=>({...p, paymentTerms: {...p.paymentTerms, securityDeposit: e.target.value}}))} />
                 </div>
              </div>
            </div>
          )}

          {/* STEP 4: LEGAL */}
          {currentStep === 4 && (
            <div className="animate-in slide-in-from-right-4 duration-300 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Juridiction Compétente</label>
                  <select className="w-full p-2 border border-gray-300 rounded bg-white text-sm" value={formData.legal.jurisdiction} onChange={e => setFormData(p=>({...p, legal:{...p.legal, jurisdiction: e.target.value}}))}>
                     <option value="Tribunal de Tunis">Tribunal de Tunis</option>
                     <option value="Tribunal de l'Ariana">Tribunal de l'Ariana</option>
                     <option value="Tribunal de Sousse">Tribunal de Sousse</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conditions Spéciales</label>
                  <textarea rows={6} className="w-full p-3 border border-gray-300 rounded text-sm outline-none focus:border-orange-500" placeholder="Ajouter des clauses particulières ici..." value={formData.legal.specialConditions} onChange={e => setFormData(p=>({...p, legal:{...p.legal, specialConditions: e.target.value}}))} />
               </div>
               <div className="bg-blue-50 p-3 rounded flex gap-3 text-blue-700 text-xs">
                  <AlertCircle size={16} className="shrink-0 mt-0.5"/>
                  <p>Les clauses générales de vente (CGV) définies dans vos paramètres seront automatiquement annexées à ce contrat lors de l'impression PDF.</p>
               </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-between shrink-0">
          {currentStep > 1 ? (
             <button onClick={() => setCurrentStep(c => c - 1)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg text-sm">Précédent</button>
          ) : <div></div>}
          
          {currentStep < 4 ? (
             <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 text-sm shadow-md shadow-orange-200">
               Suivant <ChevronRight size={16}/>
             </button>
          ) : (
             <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 text-sm shadow-md shadow-green-200 disabled:opacity-70">
               {loading ? <LoadingSpinner size="sm" color="white" /> : <Save size={16}/>}
               {isEditMode ? "Mettre à jour" : "Enregistrer le Contrat"}
             </button>
          )}
        </div>
      </div>

      {/* --- RIGHT: PREVIEW PANEL (50%) --- */}
      <div className="hidden lg:flex flex-1 bg-gray-900 items-center justify-center relative overflow-hidden">
        <div className="absolute top-4 right-4 text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
           <Eye size={14}/> Live Preview
        </div>
        {/* Scale the A4 Preview to fit screen */}
        <div className="transform scale-[0.60] xl:scale-[0.70] shadow-2xl transition-transform duration-300 origin-center">
          <LiveContractPreview settings={settings} data={{...formData, services}} />
        </div>
      </div>

    </div>
  );
};

export default ContractFormPage;