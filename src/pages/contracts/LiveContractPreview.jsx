import React from 'react';
import { Edit2 } from 'lucide-react';
import formatCurrency from '../../utils/formatCurrency';

// ==========================================
// HELPER: EDITABLE WRAPPER
// ==========================================
const EditableBlock = ({ sectionId, onEdit, children, className = "" }) => {
  return (
    <div 
      onClick={() => onEdit(sectionId)}
      className={`relative group cursor-pointer border-2 border-transparent hover:border-orange-400 hover:bg-orange-50/10 rounded-lg transition-all duration-200 ${className}`}
    >
      {/* Edit Badge on Hover */}
      <div className="absolute -top-2.5 -right-2.5 bg-orange-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 shadow-md transition-opacity z-20 scale-75 group-hover:scale-100">
        <Edit2 size={12} />
      </div>
      {children}
    </div>
  );
};

const LiveContractPreview = ({ settings, data, onEditSection }) => {
  
  // Safe Defaults
  const s = {
    colors: settings?.branding?.colors || { primary: '#F18237', text: '#1F2937', secondary: '#374151' },
    company: settings?.companyInfo || {},
    labels: settings?.labels || {},
    layout: settings?.layout || {},
    logo: settings?.branding?.logo?.url
  };

  const isPartner = data.contractType === 'partner';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '...';

  // Styles that depend on dynamic settings
  const primaryStyle = { color: s.colors.primary };
  const borderStyle = { borderColor: s.colors.primary };

  return (
    <div className="w-full h-full flex justify-center items-start overflow-hidden bg-gray-800/50 py-8 select-none">
      
      {/* A4 PAGE CONTAINER (Scaled to fit) */}
      <div 
        className="bg-white shadow-2xl origin-top transform-gpu transition-transform duration-300"
        style={{ 
          width: '794px', // A4 width at 96 DPI
          minHeight: '1123px', // A4 height
          padding: '50px 60px',
          color: s.colors.text,
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontSize: '11px',
          lineHeight: '1.5',
          position: 'relative'
        }}
      >
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-start mb-8 pb-4 border-b-2" style={borderStyle}>
          {/* Company Info (Click to edit Company or Branding) */}
          <EditableBlock sectionId={s.logo ? "branding" : "company"} onEdit={onEditSection} className="flex-1">
             {s.logo ? (
               <img src={s.logo} alt="Logo" className="h-16 object-contain mb-2" />
             ) : (
               <h1 className="text-xl font-bold uppercase" style={primaryStyle}>{s.company.displayName || "VOTRE SOCIÉTÉ"}</h1>
             )}
             <div className="text-[10px] text-gray-500 leading-tight mt-1">
               <p className="font-bold text-gray-700">{s.company.legalName}</p>
               <p>{s.company.address}</p>
               <p>MF: {s.company.matriculeFiscale}</p>
               <p>{s.company.email}</p>
             </div>
          </EditableBlock>

          {/* Document Meta (Click to edit Labels) */}
          <EditableBlock sectionId="labels" onEdit={onEditSection} className="text-right">
             <h2 className="text-lg font-black uppercase mb-1" style={primaryStyle}>
               {s.labels.contractTitle || "CONTRAT"}
             </h2>
             <p className="font-mono text-[10px] text-gray-600">Réf: {data.contractNumber}</p>
             {s.layout.showDate && (
                <p className="text-[10px] text-gray-600">Date: {formatDate(new Date())}</p>
             )}
          </EditableBlock>
        </div>

        {/* --- PARTIES --- */}
        <EditableBlock sectionId="labels" onEdit={onEditSection} className="mb-8 p-2">
           <h3 className="text-xs font-bold uppercase mb-2 tracking-wide text-gray-400 border-b pb-1">
             {s.labels.partiesTitle || "ENTRE LES SOUSSIGNÉS"}
           </h3>
           <div className="flex gap-8">
             <div className="flex-1 pl-3 border-l-2" style={borderStyle}>
                <p className="font-bold text-sm">{s.company.legalName || "Le Prestataire"}</p>
                <p className="text-xs text-gray-500">Ci-après dénommé "{s.labels.serviceProvider || "Le Prestataire"}"</p>
             </div>
             <div className="flex-1 pl-3 border-l-2 border-gray-300">
                <p className="font-bold text-sm">{data.party?.name || "Le Client"}</p>
                <p className="text-xs text-gray-500">Ci-après dénommé(e) "{isPartner ? s.labels.partnerLabel : s.labels.clientLabel}"</p>
             </div>
           </div>
        </EditableBlock>

        {/* --- OBJECT / LOGISTICS --- */}
        <EditableBlock sectionId="labels" onEdit={onEditSection} className="mb-6 p-2">
           <h3 className="text-xs font-bold uppercase mb-2 tracking-wide" style={primaryStyle}>
             {s.labels.servicesTitle || "OBJET DU CONTRAT"}
           </h3>
           <p className="text-justify mb-2">
             Le présent contrat a pour objet : <strong>{data.title}</strong>.
           </p>
           <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-2 rounded border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Début:</span>
                <span className="font-bold">{formatDate(data.logistics?.startDate)} ({data.logistics?.checkInTime})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fin:</span>
                <span className="font-bold">{formatDate(data.logistics?.endDate)} ({data.logistics?.checkOutTime})</span>
              </div>
           </div>
        </EditableBlock>

        {/* --- FINANCIALS --- */}
        <EditableBlock sectionId="financials" onEdit={onEditSection} className="mb-8 p-2">
           <h3 className="text-xs font-bold uppercase mb-2 tracking-wide" style={primaryStyle}>
             {s.labels.paymentTitle || "CONDITIONS FINANCIÈRES"}
           </h3>

           {isPartner ? (
             <div className="text-xs">
               <p className="mb-2 italic text-gray-500">Mode Partenaire (Liste Simple)</p>
               <ul className="list-disc list-inside space-y-1">
                 {data.services?.map((svc, i) => (
                   <li key={i}><strong>{svc.description}</strong> : {formatCurrency(svc.amount)}</li>
                 ))}
               </ul>
             </div>
           ) : (
             <table className="w-full text-xs border-collapse">
               <thead>
                 <tr className="text-white" style={{ backgroundColor: s.colors.primary }}>
                   <th className="p-2 text-left">Désignation</th>
                   <th className="p-2 text-center">Qté</th>
                   <th className="p-2 text-right">P.U</th>
                   <th className="p-2 text-right">Total HT</th>
                 </tr>
               </thead>
               <tbody className="text-gray-700">
                 {data.services?.map((svc, i) => (
                   <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                     <td className="p-2 border-b border-gray-100">{svc.description}</td>
                     <td className="p-2 border-b border-gray-100 text-center">{svc.quantity}</td>
                     <td className="p-2 border-b border-gray-100 text-right">{formatCurrency(svc.rate)}</td>
                     <td className="p-2 border-b border-gray-100 text-right">{formatCurrency(svc.amount)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}

           {/* Totals */}
           <div className="flex justify-end mt-4">
             <div className="w-48 text-xs space-y-1">
               <div className="flex justify-between"><span>Total HT:</span> <span>{formatCurrency(data.financials?.amountHT)}</span></div>
               <div className="flex justify-between"><span>TVA ({data.financials?.vatRate}%):</span> <span>{formatCurrency(data.financials?.taxAmount)}</span></div>
               <div className="flex justify-between"><span>Timbre:</span> <span>{formatCurrency(data.financials?.stampDuty)}</span></div>
               <div className="flex justify-between border-t border-gray-300 pt-1 mt-1 font-bold text-sm" style={primaryStyle}>
                 <span>NET À PAYER:</span>
                 <span>{formatCurrency(data.financials?.totalTTC)}</span>
               </div>
             </div>
           </div>
        </EditableBlock>

        {/* --- CLAUSES --- */}
        <EditableBlock sectionId="sections" onEdit={onEditSection} className="mb-8 p-2 min-h-[100px]">
           <h3 className="text-xs font-bold uppercase mb-2 tracking-wide" style={primaryStyle}>
             CONDITIONS GÉNÉRALES
           </h3>
           <div className="space-y-3">
             {settings.defaultSections?.length > 0 ? (
               settings.defaultSections.map((sec, i) => (
                 <div key={i}>
                   <p className="font-bold text-[10px] uppercase mb-0.5">{sec.title}</p>
                   <p className="text-[10px] text-justify text-gray-600 leading-relaxed">{sec.content}</p>
                 </div>
               ))
             ) : (
               <p className="text-center text-gray-400 italic py-4">Aucune clause définie (Cliquez pour ajouter)</p>
             )}
             
             {/* Jurisdiction Helper */}
             <div className="mt-4 pt-2 border-t border-gray-100">
                <p className="font-bold text-[10px] uppercase">JURIDICTION</p>
                <p className="text-[10px]">En cas de litige, compétence exclusive attribuée au {data.legal?.jurisdiction}.</p>
             </div>
           </div>
        </EditableBlock>

        {/* --- SIGNATURES --- */}
        <EditableBlock sectionId="labels" onEdit={onEditSection} className="mt-auto p-2">
           <h3 className="text-xs font-bold uppercase mb-6 text-center opacity-50 tracking-widest">
             {s.labels.signaturesTitle || "SIGNATURES"}
           </h3>
           <div className="flex justify-between gap-10">
             <div className="flex-1 h-24 border border-dashed border-gray-300 rounded p-2 relative">
               <p className="text-[9px] uppercase font-bold text-gray-400 mb-1">Pour {s.company.displayName}</p>
               <p className="text-[8px] text-gray-400 text-center absolute bottom-2 left-0 right-0">{s.labels.signatureLabel || "Lu et approuvé"}</p>
             </div>
             <div className="flex-1 h-24 border border-dashed border-gray-300 rounded p-2 relative">
               <p className="text-[9px] uppercase font-bold text-gray-400 mb-1">Pour {isPartner ? "Le Partenaire" : "Le Client"}</p>
               <p className="text-[8px] text-gray-400 text-center absolute bottom-2 left-0 right-0">{s.labels.signatureLabel || "Lu et approuvé"}</p>
             </div>
           </div>
        </EditableBlock>

        {/* --- FOOTER --- */}
        <EditableBlock sectionId="company" onEdit={onEditSection} className="absolute bottom-10 left-10 right-10 text-center border-t border-gray-100 pt-2">
           <p className="text-[9px] text-gray-400">
             {s.company.legalName} - MF: {s.company.matriculeFiscale} - {s.company.address}
           </p>
        </EditableBlock>

      </div>
    </div>
  );
};

export default LiveContractPreview;