import React from 'react';
import formatCurrency from "../../utils/formatCurrency";
const LiveInvoicePreview = ({ settings, data, calculations, recipient, companyName }) => {
  
  // ✅ FIX: robust default merging to prevent "undefined" errors on nested keys
  const defaults = {
    branding: { 
      colors: { primary: '#F18237', secondary: '#374151', text: '#1F2937' }, 
      fonts: { size: 10, body: 'Helvetica' },
      logo: { url: '', height: 60 }
    },
    layout: { borderRadius: 4, density: 'standard' },
    table: { 
      headerColor: '#F18237', 
      rounded: true, 
      striped: false, 
      columns: { description: true, quantity: true, rate: true, total: true } 
    },
    labels: { invoiceTitle: 'INVOICE', from: 'From', to: 'Bill To', item: 'Item', total: 'Amount', quantity: 'Qty', rate: 'Price' },
    companyInfo: { displayName: companyName || 'My Venue' },
    paymentTerms: { bankDetails: '' }
  };

  // Safe merging: Use provided settings if available, otherwise use defaults
  const s = {
    branding: {
      colors: { ...defaults.branding.colors, ...settings?.branding?.colors },
      fonts: { ...defaults.branding.fonts, ...settings?.branding?.fonts },
      logo: { ...defaults.branding.logo, ...settings?.branding?.logo }
    },
    layout: { ...defaults.layout, ...settings?.layout },
    table: { 
      ...defaults.table, 
      ...settings?.table,
      columns: { ...defaults.table.columns, ...settings?.table?.columns }
    },
    labels: { ...defaults.labels, ...settings?.labels },
    companyInfo: { ...defaults.companyInfo, ...settings?.companyInfo },
    paymentTerms: { ...defaults.paymentTerms, ...settings?.paymentTerms }
  };

  const paddingMap = { compact: '30px', standard: '50px', spacious: '80px' };
  const currentPadding = paddingMap[s.layout.density] || '50px';

  const styles = {
    page: {
      width: '794px', // A4 width at 96 DPI
      minHeight: '1123px', // A4 height
      backgroundColor: 'white',
      padding: currentPadding,
      fontFamily: s.branding.fonts.body || 'Helvetica', // Fallback
      fontSize: `${s.branding.fonts.size || 10}px`,
      color: s.branding.colors.text,
      position: 'relative'
    },
    primary: { color: s.branding.colors.primary },
    headerBg: { backgroundColor: s.table.headerColor || s.branding.colors.primary, color: 'white' },
    radius: { borderRadius: `${s.layout.borderRadius}px` }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '-';

  return (
    <div style={styles.page}>
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          {s.branding.logo?.url ? (
            <img 
              src={s.branding.logo.url.startsWith('http') ? s.branding.logo.url : `http://localhost:5000${s.branding.logo.url}`} 
              alt="Logo" 
              style={{ height: s.branding.logo.height || 60, objectFit: 'contain', ...styles.radius }} 
            />
          ) : (
             <h2 className="text-2xl font-bold text-gray-400 uppercase tracking-widest">LOGO</h2>
          )}
        </div>
        <div className="text-right">
          <h1 className="text-5xl font-black uppercase leading-none" style={styles.primary}>
            {s.labels.invoiceTitle}
          </h1>
          <p className="mt-2 text-sm opacity-60 font-medium">
            {data?.status === 'draft' ? '# DRAFT' : (data?.invoiceNumber || '# PREVIEW')}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="flex justify-between items-start mb-12">
        <div>
           <p className="text-[0.7em] font-bold uppercase tracking-widest opacity-40 mb-2">{s.labels.from}</p>
           <p className="font-bold text-[1.2em]">{s.companyInfo.displayName}</p>
           <p className="opacity-70 whitespace-pre-line text-[0.9em]">123 Venue Street, Tunis</p>
        </div>
        <div className="text-right">
           <p className="text-[0.7em] font-bold uppercase tracking-widest opacity-40 mb-2">{s.labels.to}</p>
           {recipient ? (
             <>
               <p className="font-bold text-[1.2em]">{recipient.name}</p>
               <p className="opacity-70 text-[0.9em]">{recipient.email}</p>
               {recipient.phone && <p className="opacity-70 text-[0.9em]">{recipient.phone}</p>}
             </>
           ) : (
             <p className="text-gray-300 italic">Select a recipient...</p>
           )}
        </div>
      </div>

      {/* Dates */}
      <div className="flex gap-8 mb-8 border-t border-b border-gray-100 py-4">
         <div>
            <span className="text-[0.8em] font-bold opacity-50 uppercase mr-2">Issue Date:</span>
            <span className="font-medium">{formatDate(data?.issueDate)}</span>
         </div>
         <div>
            <span className="text-[0.8em] font-bold opacity-50 uppercase mr-2">Due Date:</span>
            <span className="font-medium">{formatDate(data?.dueDate)}</span>
         </div>
      </div>

      {/* Table */}
      <table className="w-full mb-8" style={{ borderCollapse: s.table.rounded ? 'separate' : 'collapse', borderSpacing: 0 }}>
        <thead>
          <tr style={styles.headerBg}>
             <th className="py-3 px-4 text-left font-bold text-[0.85em] uppercase" style={{ borderTopLeftRadius: s.layout.borderRadius, borderBottomLeftRadius: s.layout.borderRadius }}>{s.labels.item}</th>
             <th className="py-3 px-2 text-center font-bold text-[0.85em] uppercase">{s.labels.quantity}</th>
             <th className="py-3 px-2 text-right font-bold text-[0.85em] uppercase">{s.labels.rate}</th>
             <th className="py-3 px-4 text-right font-bold text-[0.85em] uppercase" style={{ borderTopRightRadius: s.layout.borderRadius, borderBottomRightRadius: s.layout.borderRadius }}>{s.labels.total}</th>
          </tr>
        </thead>
        <tbody>
          {data?.items?.length > 0 ? data.items.map((item, idx) => (
             <tr key={idx} className={s.table.striped && idx % 2 !== 0 ? 'bg-gray-50' : ''}>
                <td className="py-4 px-4 border-b border-gray-100 font-bold text-gray-800">{item.description || 'New Item'}</td>
                <td className="py-4 px-2 text-center border-b border-gray-100 opacity-70">{item.quantity}</td>
                <td className="py-4 px-2 text-right border-b border-gray-100 opacity-70">{formatCurrency(item.rate)}</td>
                <td className="py-4 px-4 text-right border-b border-gray-100 font-bold">{formatCurrency(item.amount)}</td>
             </tr>
          )) : (
             <tr><td colSpan="4" className="py-8 text-center text-gray-300 italic">No items added yet</td></tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-12">
         <div className="w-5/12 space-y-2">
            <div className="flex justify-between text-[0.9em] opacity-70 border-b border-gray-100 pb-2">
               <span>Subtotal</span>
               <span>{formatCurrency(calculations?.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between text-[0.9em] opacity-70 border-b border-gray-100 pb-2">
               <span>Tax ({data?.taxRate || 0}%)</span>
               <span>{formatCurrency(calculations?.tax || 0)}</span>
            </div>
            {(calculations?.discountAmount > 0) && (
               <div className="flex justify-between text-[0.9em] text-red-500 border-b border-gray-100 pb-2">
                  <span>Discount</span>
                  <span>-{formatCurrency(calculations.discountAmount)}</span>
               </div>
            )}
            <div className="flex justify-between text-[1.4em] font-black pt-2" style={styles.primary}>
               <span>Total</span>
               <span>{formatCurrency(calculations?.totalAmount || 0)}</span>
            </div>
         </div>
      </div>

      {/* Footer / Terms */}
      {(data?.terms || s.paymentTerms?.bankDetails) && (
        <div className="mt-auto pt-8 border-t-2 border-gray-100">
           <h4 className="font-bold mb-2 uppercase text-[0.8em] tracking-wider" style={styles.primary}>Terms & Payment</h4>
           <div className="opacity-70 whitespace-pre-line text-[0.9em] leading-relaxed">
              {data?.terms || s.paymentTerms.bankDetails}
           </div>
        </div>
      )}
    </div>
  );
};

export default LiveInvoicePreview;