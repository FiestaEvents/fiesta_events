import React from 'react';
import { Edit2 } from 'lucide-react';
import formatCurrency from '../../utils/formatCurrency';

// Helper: Clickable Wrapper
const EditableBlock = ({ sectionId, onEdit, children, className = "" }) => (
  <div 
    onClick={() => onEdit && onEdit(sectionId)}
    className={`relative group cursor-pointer border-2 border-transparent hover:border-orange-400 hover:bg-orange-50/10 rounded-lg transition-all duration-200 ${className}`}
  >
    {onEdit && (
      <div className="absolute -top-2.5 -right-2.5 bg-orange-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 shadow-md transition-opacity z-50 pointer-events-none">
        <Edit2 size={12} />
      </div>
    )}
    {children}
  </div>
);

const LiveInvoicePreview = ({ settings, data, onEditSection }) => {
  
  // 1. Safe Settings Access
  const s = {
    colors: settings?.branding?.colors || { primary: '#F18237', secondary: '#374151', text: '#1F2937', background: '#FFFFFF' },
    fonts: settings?.branding?.fonts || { body: 'Helvetica', size: 10 },
    company: settings?.companyInfo || {},
    labels: settings?.labels || {},
    layout: settings?.layout || { density: 'standard', borderRadius: 4, sections: [] },
    table: settings?.table || { headerColor: '', striped: false, rounded: true, columns: {} },
    logo: settings?.branding?.logo?.url,
    currency: settings?.currency || { symbol: 'DT', position: 'after' },
    paymentTerms: settings?.paymentTerms || {}
  };

  // 2. Date Formatter
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '...';

  // 3. Dynamic Styles
  const pageStyle = {
    fontFamily: s.fonts.body,
    fontSize: `${s.fonts.size}px`,
    color: s.colors.text,
    backgroundColor: '#FFFFFF',
    padding: s.layout.density === 'compact' ? '30px' : s.layout.density === 'spacious' ? '70px' : '50px',
  };

  const primaryText = { color: s.colors.primary };
  const secondaryText = { color: s.colors.secondary };
  const borderRadius = { borderRadius: `${s.layout.borderRadius}px` };
  const tableHeaderStyle = {
    backgroundColor: s.table.headerColor || s.colors.primary,
    color: '#FFFFFF',
  };

  // 4. Render Logic based on Sections Order
  const sortedSections = (s.layout.sections || [])
    .filter(sec => sec.visible)
    .sort((a, b) => a.order - b.order);

  // Mock Calculations (if not provided in data)
  const subtotal = data.items?.reduce((acc, item) => acc + (item.amount || 0), 0) || 0;
  const taxAmount = (subtotal * (data.taxRate || 19)) / 100;
  const discountAmount = data.discount || 0; 
  const totalAmount = subtotal + taxAmount - discountAmount;

  return (
    <div className="flex justify-center items-start p-8 bg-gray-800/50 min-h-full select-none">
      
      {/* A4 PAGE CONTAINER */}
      <div 
        className="shadow-2xl relative flex flex-col transition-all duration-300"
        style={{ 
          width: '794px', 
          minHeight: '1123px', 
          ...pageStyle
        }}
      >
        {/* Watermark */}
        {settings?.branding?.watermark?.enabled && settings.branding.watermark.url && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] z-0 overflow-hidden">
             <img src={settings.branding.watermark.url} className="w-2/3 object-contain" alt="Watermark" />
          </div>
        )}

        <div className="flex flex-col gap-6 h-full z-10">
          {sortedSections.map(section => {
            
            // --- HEADER ---
            if (section.id === 'header') {
              return (
                <EditableBlock key="header" sectionId="branding" onEdit={onEditSection}>
                  <div className="flex justify-between items-start">
                    <div>
                      {s.logo ? (
                        <img 
                          src={s.logo} 
                          alt="Logo" 
                          className="object-contain" 
                          style={{ height: settings.branding.logo.height || 60, ...borderRadius }} 
                        />
                      ) : (
                        <div className="bg-gray-100 text-gray-300 font-bold flex items-center justify-center border-2 border-dashed border-gray-200" style={{ width: 150, height: 60, ...borderRadius }}>LOGO</div>
                      )}
                    </div>
                    <div className="text-right">
                      <h1 className="text-5xl font-black uppercase leading-none tracking-tighter" style={primaryText}>
                        {s.labels.invoiceTitle || "FACTURE"}
                      </h1>
                      <p className="mt-2 font-medium opacity-60 tracking-wide text-sm" style={secondaryText}>
                        # {data.invoiceNumber}
                      </p>
                    </div>
                  </div>
                </EditableBlock>
              );
            }

            // --- DETAILS ---
            if (section.id === 'details') {
              return (
                <EditableBlock key="details" sectionId="text" onEdit={onEditSection}>
                  <div className="flex justify-between items-start pt-4 border-t border-gray-100">
                    <div className="w-5/12">
                      <p className="text-[0.75em] font-bold uppercase tracking-widest opacity-40 mb-2 pb-1 border-b border-gray-100">
                        {s.labels.from || "DE"}
                      </p>
                      <p className="font-bold text-[1.1em] mb-1" style={{ color: '#111' }}>{s.company.displayName || "Ma Société"}</p>
                      <div className="opacity-70 text-[0.9em] leading-relaxed">
                         <p>123 Rue Exemple</p>
                         <p>Tunis, Tunisie</p>
                         {s.company.matriculeFiscale && <p>MF: {s.company.matriculeFiscale}</p>}
                      </div>
                    </div>
                    <div className="w-5/12 text-right">
                      <p className="text-[0.75em] font-bold uppercase tracking-widest opacity-40 mb-2 pb-1 border-b border-gray-100">
                        {s.labels.to || "À"}
                      </p>
                      <p className="font-bold text-[1.1em] mb-1" style={{ color: '#111' }}>{data.recipient?.name || "Client Name"}</p>
                      <div className="opacity-70 text-[0.9em] leading-relaxed">
                         <p>{data.recipient?.email}</p>
                         <p>{data.recipient?.phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-8 mt-6 pt-2">
                     <div>
                        <span className="font-bold opacity-50 text-[0.8em] uppercase mr-2">Date:</span>
                        <span className="font-medium">{formatDate(data.issueDate)}</span>
                     </div>
                     <div>
                        <span className="font-bold opacity-50 text-[0.8em] uppercase mr-2">Échéance:</span>
                        <span className="font-medium">{formatDate(data.dueDate)}</span>
                     </div>
                  </div>
                </EditableBlock>
              );
            }

            // --- ITEMS TABLE ---
            if (section.id === 'items') {
              return (
                <EditableBlock key="items" sectionId="table" onEdit={onEditSection}>
                  <table className="w-full mt-2" style={{ borderCollapse: s.table.rounded ? 'separate' : 'collapse', borderSpacing: 0 }}>
                    <thead>
                      <tr style={tableHeaderStyle}>
                        {s.table.columns.description && (
                          <th className="py-3 px-4 text-left font-bold text-[0.85em] uppercase tracking-wider"
                              style={{ borderTopLeftRadius: s.table.rounded ? s.layout.borderRadius : 0, borderBottomLeftRadius: s.table.rounded ? s.layout.borderRadius : 0 }}>
                            {s.labels.item || "Description"}
                          </th>
                        )}
                        {s.table.columns.quantity && <th className="py-3 px-2 text-center font-bold text-[0.85em] uppercase tracking-wider">{s.labels.quantity || "Qté"}</th>}
                        {s.table.columns.rate && <th className="py-3 px-2 text-right font-bold text-[0.85em] uppercase tracking-wider">{s.labels.rate || "Prix"}</th>}
                        {s.table.columns.total && (
                          <th className="py-3 px-4 text-right font-bold text-[0.85em] uppercase tracking-wider"
                              style={{ borderTopRightRadius: s.table.rounded ? s.layout.borderRadius : 0, borderBottomRightRadius: s.table.rounded ? s.layout.borderRadius : 0 }}>
                            {s.labels.total || "Total"}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="text-[0.95em]">
                      {data.items?.map((item, idx) => (
                        <tr key={idx} className={s.table.striped && idx % 2 !== 0 ? 'bg-gray-50' : ''}>
                           {s.table.columns.description && (
                             <td className="py-4 px-4 border-b border-gray-100">
                               <p className="font-bold text-gray-800">{item.description}</p>
                             </td>
                           )}
                           {s.table.columns.quantity && <td className="py-4 px-2 text-center border-b border-gray-100 opacity-70">{item.quantity}</td>}
                           {s.table.columns.rate && <td className="py-4 px-2 text-right border-b border-gray-100 opacity-70">{formatCurrency(item.rate, s.currency)}</td>}
                           {s.table.columns.total && <td className="py-4 px-4 text-right border-b border-gray-100 font-bold">{formatCurrency(item.amount, s.currency)}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </EditableBlock>
              );
            }

            // --- TOTALS ---
            if (section.id === 'totals') {
              return (
                <EditableBlock key="totals" sectionId="text" onEdit={onEditSection}>
                  <div className="flex justify-end pt-2">
                    <div className="w-5/12 space-y-2">
                       <div className="flex justify-between text-[0.9em] opacity-70 border-b border-gray-100 pb-2">
                          <span>Sous-total</span>
                          <span>{formatCurrency(subtotal, s.currency)}</span>
                       </div>
                       <div className="flex justify-between text-[0.9em] opacity-70 border-b border-gray-100 pb-2">
                          <span>TVA ({data.taxRate || 19}%)</span>
                          <span>{formatCurrency(taxAmount, s.currency)}</span>
                       </div>
                       {discountAmount > 0 && (
                         <div className="flex justify-between text-[0.9em] text-red-500 border-b border-gray-100 pb-2">
                            <span>Remise</span>
                            <span>-{formatCurrency(discountAmount, s.currency)}</span>
                         </div>
                       )}
                       <div className="flex justify-between text-[1.4em] font-extrabold pt-2" style={primaryText}>
                          <span>Total</span>
                          <span>{formatCurrency(totalAmount, s.currency)}</span>
                       </div>
                    </div>
                  </div>
                </EditableBlock>
              );
            }

            // --- FOOTER ---
            if (section.id === 'footer' && s.paymentTerms.bankDetails) {
              return (
                <EditableBlock key="footer" sectionId="text" onEdit={onEditSection} className="mt-auto pt-8">
                   <div className="bg-gray-50 p-6 border border-gray-100" style={borderRadius}>
                      <h4 className="font-bold mb-3 uppercase text-[0.8em] tracking-wider" style={primaryText}>
                        {s.labels.paymentInstructions || "Instructions de paiement"}
                      </h4>
                      <div className="opacity-70 whitespace-pre-line leading-relaxed text-[0.9em] font-medium text-gray-600">
                        {s.paymentTerms.bankDetails}
                      </div>
                   </div>
                </EditableBlock>
              );
            }

            return null;
          })}
        </div>

        {/* Page Numbers */}
        {s.layout.showPageNumbers && (
           <div className="absolute bottom-6 left-0 right-0 text-center text-[10px] text-gray-400 uppercase tracking-widest">
              Page 1 / 1
           </div>
        )}
        
      </div>
    </div>
  );
};

export default LiveInvoicePreview;