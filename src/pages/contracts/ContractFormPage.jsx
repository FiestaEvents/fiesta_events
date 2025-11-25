import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Save, Users, Calendar, DollarSign, Scale, 
  Eye, Plus, Trash2, Building2, User, Check, ChevronRight
} from "lucide-react";

// You would import your actual services here
// import { contractService, clientService, partnerService, eventService } from "../../api/index";

// Mock Components for this example to work standalone
import LiveContractPreview from "./LiveContractPreview";
const Button = ({ children, onClick, variant, className, icon: Icon }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${variant === 'primary' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${className}`}>
    {Icon && <Icon size={18} />} {children}
  </button>
);

const ContractFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // --- 1. STATE MANAGEMENT ---
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Settings (normally fetched from API)
  const [settings, setSettings] = useState({
    companyInfo: {
      displayName: "Mon Espace",
      legalName: "STE TUNISIE EVENT SARL",
      matriculeFiscale: "1234567/A/M/000",
      address: "Les Berges du Lac, Tunis",
      phone: "71 000 000"
    },
    branding: { colors: { primary: "#F18237" } }
  });

  // Main Form Data
  const [formData, setFormData] = useState({
    status: "draft",
    contractType: "client",
    title: "", 
    contractNumber: "REF-" + Math.floor(Math.random() * 10000), // Auto-gen
    
    // Party (Client/Partner)
    party: {
      type: "company", // 'company' or 'individual'
      name: "",
      identifier: "", // MF or CIN
      address: "",
      representative: ""
    },

    // Logistics
    logistics: {
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      checkInTime: "09:00",
      checkOutTime: "23:00"
    },

    // Financials
    financials: {
      amountHT: 0,
      vatRate: 19, // Default Tunisian VAT
      taxAmount: 0,
      stampDuty: 1.000, // Default Stamp
      totalTTC: 0,
      depositAmount: 0
    },

    legal: {
      jurisdiction: "Tribunal de Tunis",
    },

    services: [
      { description: "Location de la salle principale", quantity: 1, rate: 1000, amount: 1000 }
    ]
  });

  // --- 2. CALCULATIONS ---
  
  // Auto-calculate totals whenever services or rates change
  useEffect(() => {
    const totalHT = formData.services.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
    const vat = (totalHT * formData.financials.vatRate) / 100;
    const stamp = parseFloat(formData.financials.stampDuty) || 0;
    const ttc = totalHT + vat + stamp;

    setFormData(prev => ({
      ...prev,
      financials: {
        ...prev.financials,
        amountHT: totalHT,
        taxAmount: vat.toFixed(3),
        totalTTC: ttc.toFixed(3)
      }
    }));
  }, [formData.services, formData.financials.vatRate, formData.financials.stampDuty]);

  // --- 3. HANDLERS ---

  const handlePartyChange = (field, value) => {
    setFormData(prev => ({ ...prev, party: { ...prev.party, [field]: value } }));
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...formData.services];
    newServices[index][field] = value;
    
    // Auto-calc line amount
    if (field === 'quantity' || field === 'rate') {
      const qty = parseFloat(newServices[index].quantity) || 0;
      const rate = parseFloat(newServices[index].rate) || 0;
      newServices[index].amount = qty * rate;
    }
    
    setFormData(prev => ({ ...prev, services: newServices }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { description: "", quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const saveContract = async () => {
    if (!formData.title || !formData.party.name) {
      alert("Veuillez remplir le titre et le nom du client.");
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert("Contrat enregistré avec succès !");
      navigate("/contracts");
    }, 1000);
  };

  // --- 4. RENDER HELPERS ---
  const StepIcon = ({ step, icon: Icon, label }) => {
    const isActive = currentStep === step;
    const isDone = currentStep > step;
    return (
      <button 
        onClick={() => setCurrentStep(step)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-500' : isDone ? 'text-green-600' : 'text-gray-400'}`}
      >
        {isDone ? <Check size={16} /> : <Icon size={16} />}
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-slate-800">
      
      {/* LEFT: Editor (50%) */}
      <div className="w-full lg:w-1/2 flex flex-col border-r border-gray-200 bg-white z-10 shadow-xl">
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ArrowLeft size={20}/></button>
            <h1 className="font-bold text-lg">{isEditMode ? 'Modifier Contrat' : 'Nouveau Contrat'}</h1>
          </div>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded uppercase tracking-wider">
              {formData.contractType}
            </span>
          </div>
        </div>

        {/* Steps */}
        <div className="px-6 py-4 flex gap-2 overflow-x-auto shrink-0 border-b border-gray-100 bg-gray-50/50">
          <StepIcon step={1} icon={Users} label="Client" />
          <ChevronRight size={16} className="text-gray-300" />
          <StepIcon step={2} icon={Calendar} label="Dates" />
          <ChevronRight size={16} className="text-gray-300" />
          <StepIcon step={3} icon={DollarSign} label="Finance" />
          <ChevronRight size={16} className="text-gray-300" />
          <StepIcon step={4} icon={Scale} label="Légal" />
        </div>

        {/* Form Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* STEP 1: PARTY */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Users className="text-orange-500"/> Informations Client</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre du contrat *</label>
                <input 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                  placeholder="Ex: Mariage Mr X & Mme Y"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="p-1 bg-gray-100 rounded-lg inline-flex">
                <button 
                  onClick={() => handlePartyChange('type', 'company')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${formData.party.type === 'company' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}
                >Société</button>
                <button 
                   onClick={() => handlePartyChange('type', 'individual')}
                   className={`px-4 py-2 rounded-md text-sm font-medium transition ${formData.party.type === 'individual' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}
                >Particulier</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom / Raison Sociale *</label>
                  <input 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 outline-none"
                    placeholder={formData.party.type === 'company' ? "Nom de la société" : "Nom complet"}
                    value={formData.party.name}
                    onChange={(e) => handlePartyChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.party.type === 'company' ? "Matricule Fiscale (MF)" : "CIN"}
                  </label>
                  <input 
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                    placeholder={formData.party.type === 'company' ? "0000000/A/M/000" : "00000000"}
                    value={formData.party.identifier}
                    onChange={(e) => handlePartyChange('identifier', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input 
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                    placeholder="+216 ..."
                    // Add state handling for phone if needed
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input 
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                    placeholder="Adresse complète..."
                    value={formData.party.address}
                    onChange={(e) => handlePartyChange('address', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LOGISTICS */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar className="text-orange-500"/> Logistique & Dates</h2>
              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2 block">Date de début</label>
                    <input type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" 
                      value={formData.logistics.startDate}
                      onChange={(e) => setFormData({...formData, logistics: {...formData.logistics, startDate: e.target.value}})}
                    />
                 </div>
                 <div>
                    <label className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2 block">Date de fin</label>
                    <input type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" 
                       value={formData.logistics.endDate}
                       onChange={(e) => setFormData({...formData, logistics: {...formData.logistics, endDate: e.target.value}})}
                    />
                 </div>
                 <div>
                    <label className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2 block">Heure Accès</label>
                    <input type="time" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" 
                       value={formData.logistics.checkInTime}
                       onChange={(e) => setFormData({...formData, logistics: {...formData.logistics, checkInTime: e.target.value}})}
                    />
                 </div>
                 <div>
                    <label className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2 block">Heure Fin</label>
                    <input type="time" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" 
                       value={formData.logistics.checkOutTime}
                       onChange={(e) => setFormData({...formData, logistics: {...formData.logistics, checkOutTime: e.target.value}})}
                    />
                 </div>
              </div>
            </div>
          )}

          {/* STEP 3: FINANCIALS */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><DollarSign className="text-orange-500"/> Services & Facturation</h2>
              
              <div className="space-y-3">
                {formData.services.map((svc, idx) => (
                  <div key={idx} className="flex gap-2 items-start p-3 bg-gray-50 border rounded-lg group">
                    <div className="flex-1">
                      <input 
                        className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-orange-500 outline-none text-sm py-1"
                        placeholder="Description du service..."
                        value={svc.description}
                        onChange={(e) => handleServiceChange(idx, 'description', e.target.value)}
                      />
                    </div>
                    <div className="w-16">
                      <input 
                         type="number" min="1"
                         className="w-full bg-white border border-gray-200 rounded p-1 text-center text-sm"
                         value={svc.quantity}
                         onChange={(e) => handleServiceChange(idx, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="w-24">
                      <input 
                         type="number" 
                         className="w-full bg-white border border-gray-200 rounded p-1 text-right text-sm"
                         placeholder="Prix"
                         value={svc.rate}
                         onChange={(e) => handleServiceChange(idx, 'rate', e.target.value)}
                      />
                    </div>
                    <button onClick={() => removeService(idx)} className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={16}/></button>
                  </div>
                ))}
                <button onClick={addService} className="text-sm text-orange-600 font-medium flex items-center gap-1 hover:underline">
                  <Plus size={16}/> Ajouter une ligne
                </button>
              </div>

              {/* Totals Summary */}
              <div className="bg-slate-800 text-white p-6 rounded-xl mt-6">
                <div className="flex justify-between text-sm mb-2 opacity-80">
                  <span>Total HT</span>
                  <span>{formData.financials.amountHT.toFixed(3)} TND</span>
                </div>
                <div className="flex justify-between text-sm mb-2 opacity-80">
                  <div className="flex items-center gap-2">
                    <span>TVA</span>
                    <input 
                      className="w-12 bg-slate-700 text-center rounded border-none text-xs"
                      value={formData.financials.vatRate}
                      onChange={(e) => setFormData({...formData, financials: {...formData.financials, vatRate: e.target.value}})}
                    />
                    <span>%</span>
                  </div>
                  <span>{formData.financials.taxAmount} TND</span>
                </div>
                <div className="flex justify-between text-sm mb-4 opacity-80 border-b border-slate-600 pb-4">
                  <span>Timbre Fiscal</span>
                  <span>{parseFloat(formData.financials.stampDuty).toFixed(3)} TND</span>
                </div>
                <div className="flex justify-between text-xl font-bold">
                  <span>NET TTC</span>
                  <span>{formData.financials.totalTTC} TND</span>
                </div>
              </div>
            </div>
          )}

           {/* STEP 4: LEGAL */}
           {currentStep === 4 && (
             <div className="space-y-6 animate-fade-in">
               <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Scale className="text-orange-500"/> Clauses Juridiques</h2>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Juridiction Compétente</label>
                 <select 
                   className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                   value={formData.legal.jurisdiction}
                   onChange={(e) => setFormData({...formData, legal: {...formData.legal, jurisdiction: e.target.value}})}
                 >
                   <option value="Tribunal de Tunis">Tribunal de Tunis</option>
                   <option value="Tribunal de l'Ariana">Tribunal de l'Ariana</option>
                   <option value="Tribunal de Sousse">Tribunal de Sousse</option>
                 </select>
               </div>
               <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                  <p>Les clauses standards relatives aux événements (annulation, force majeure) sont incluses automatiquement dans le contrat.</p>
               </div>
             </div>
           )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-white flex justify-between shrink-0">
          {currentStep > 1 && (
            <Button onClick={() => setCurrentStep(c => c - 1)}>Précédent</Button>
          )}
          <div className="ml-auto">
            {currentStep < 4 ? (
               <Button variant="primary" onClick={() => setCurrentStep(c => c + 1)} icon={ChevronRight}>Suivant</Button>
            ) : (
               <Button variant="primary" onClick={saveContract} icon={Save} loading={loading}>Enregistrer le Contrat</Button>
            )}
          </div>
        </div>

      </div>

      {/* RIGHT: Live Preview (50%) */}
      <div className="hidden lg:flex w-1/2 bg-gray-800 items-center justify-center relative overflow-hidden">
        <div className="absolute top-6 right-6 text-white/50 text-sm font-bold flex items-center gap-2">
           <Eye size={16}/> APERÇU A4
        </div>
        
        {/* We scale the A4 component down to fit the screen */}
        <div className="transform scale-[0.60] shadow-2xl origin-center">
          <LiveContractPreview settings={settings} data={formData} />
        </div>
      </div>

    </div>
  );
};

export default ContractFormPage;