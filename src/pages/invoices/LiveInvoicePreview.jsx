import React, { useState } from "react";
import { Edit2, GripVertical, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// --- ZOOM CONTROLS ---
const ZoomControls = ({ zoom, onZoomIn, onZoomOut, onZoomReset }) => (
  <div className="fixed bottom-8 right-8 z-50 flex gap-2 bg-white rounded-full shadow-xl p-2 border border-gray-200">
    <button onClick={onZoomOut} className="p-2 hover:bg-gray-100 rounded-full"><ZoomOut size={18}/></button>
    <span className="px-2 py-2 text-xs font-bold w-12 text-center">{Math.round(zoom * 100)}%</span>
    <button onClick={onZoomIn} className="p-2 hover:bg-gray-100 rounded-full"><ZoomIn size={18}/></button>
    <button onClick={onZoomReset} className="p-2 hover:bg-gray-100 rounded-full border-l ml-1"><Maximize2 size={18}/></button>
  </div>
);

// --- DRAGGABLE BLOCK ---
const DraggableBlock = ({ id, index, onEdit, children }) => (
  <Draggable draggableId={id} index={index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className={`relative group transition-all duration-200 ${snapshot.isDragging ? "z-50 opacity-90 scale-105" : ""}`}
      >
        {/* Hover Controls */}
        <div className="absolute -left-10 top-0 bottom-0 w-8 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div {...provided.dragHandleProps} className="p-1.5 bg-gray-100 hover:bg-orange-100 text-gray-500 hover:text-orange-600 rounded cursor-grab shadow-sm mb-1"><GripVertical size={14} /></div>
          {onEdit && <div onClick={onEdit} className="p-1.5 bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 rounded cursor-pointer shadow-sm"><Edit2 size={14} /></div>}
        </div>
        
        {/* Content Wrapper */}
        <div onClick={onEdit} className="border-2 border-transparent hover:border-dashed hover:border-blue-300 rounded transition-colors cursor-pointer">
          {children}
        </div>
      </div>
    )}
  </Draggable>
);

const LiveInvoicePreview = ({ settings, data, onEditSection, onReorder }) => {
  const [zoom, setZoom] = useState(0.8); // Start slightly zoomed out to fit

  const s = {
    colors: settings.branding.colors,
    fonts: settings.branding.fonts,
    labels: settings.labels,
    layout: settings.layout,
    table: settings.table
  };

  // --- STYLE VARIABLES ---
  const pageStyle = {
    width: "794px", // A4 Width in px at 96 DPI
    minHeight: "1123px", // A4 Height
    backgroundColor: "white",
    padding: "40px",
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: `${s.fonts.size}px`,
    color: s.colors.text,
    transform: `scale(${zoom})`,
    transformOrigin: "top center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
  };

  // --- HELPERS ---
  const formatCurrency = (amt) => `${amt.toFixed(2)} TND`;
  const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR");

  // --- RENDERERS ---
  const renderers = {
    header: (
      <div className="flex justify-between items-start mb-10">
        <div>
          {settings.branding.logo.url ? (
            <img src={settings.branding.logo.url} style={{ height: 80, maxWidth: 200, objectFit: 'contain' }} />
          ) : (
            <h1 style={{ color: s.colors.primary, fontSize: 24, fontWeight: 'bold' }}>Your Business</h1>
          )}
        </div>
        <div className="text-right">
          <h1 style={{ color: s.colors.primary, fontSize: 32, fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            {s.labels.invoiceTitle}
          </h1>
          <p style={{ color: s.colors.secondary, fontSize: 14, marginTop: 5, fontWeight: 'bold' }}># {data.invoiceNumber}</p>
        </div>
      </div>
    ),

    details: (
      <div className="flex justify-between mb-8 border-t pt-6" style={{ borderColor: '#eee' }}>
         <div style={{ width: '45%' }}>
            <span style={{ fontSize: 10, fontWeight: 'bold', color: s.colors.secondary, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
              {s.labels.from}
            </span>
            <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>Your Business Name</div>
            <div style={{ fontSize: 12, color: s.colors.secondary, whiteSpace: 'pre-line' }}>123 Street Address, City, Country</div>
         </div>
         <div style={{ width: '45%', textAlign: 'right' }}>
            <span style={{ fontSize: 10, fontWeight: 'bold', color: s.colors.secondary, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
              {s.labels.to}
            </span>
            <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>{data.recipient.name}</div>
            <div style={{ fontSize: 12, color: s.colors.secondary }}>{data.recipient.email}</div>
         </div>
         <div style={{ position: 'absolute', top: 220, width: '100%', display: 'flex', gap: 40 }}>
             <div><span style={{ fontWeight: 'bold', color: s.colors.secondary, marginRight: 8 }}>DATE:</span> {formatDate(data.issueDate)}</div>
             <div><span style={{ fontWeight: 'bold', color: s.colors.secondary, marginRight: 8 }}>DUE:</span> {formatDate(data.dueDate)}</div>
         </div>
      </div>
    ),

    items: (
      <div className="mb-8 mt-12">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {s.table.columns.description && <th style={{ textAlign: 'left', padding: 12, backgroundColor: s.table.headerColor, color: 'white', borderTopLeftRadius: s.table.rounded ? 6 : 0 }}>{s.labels.item}</th>}
              {s.table.columns.quantity && <th style={{ textAlign: 'center', padding: 12, backgroundColor: s.table.headerColor, color: 'white' }}>{s.labels.quantity}</th>}
              {s.table.columns.rate && <th style={{ textAlign: 'right', padding: 12, backgroundColor: s.table.headerColor, color: 'white' }}>{s.labels.rate}</th>}
              {s.table.columns.total && <th style={{ textAlign: 'right', padding: 12, backgroundColor: s.table.headerColor, color: 'white', borderTopRightRadius: s.table.rounded ? 6 : 0 }}>{s.labels.total}</th>}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} style={{ backgroundColor: s.table.striped && i % 2 !== 0 ? '#F9FAFB' : 'transparent' }}>
                {s.table.columns.description && <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{item.description}</td>}
                {s.table.columns.quantity && <td style={{ padding: 12, borderBottom: '1px solid #eee', textAlign: 'center' }}>{item.quantity}</td>}
                {s.table.columns.rate && <td style={{ padding: 12, borderBottom: '1px solid #eee', textAlign: 'right' }}>{formatCurrency(item.rate)}</td>}
                {s.table.columns.total && <td style={{ padding: 12, borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(item.amount)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),

    totals: (
      <div className="flex justify-end mb-10">
        <div style={{ width: 300 }}>
          <div className="flex justify-between py-1 border-b border-gray-100"><span>Subtotal:</span> <span>{formatCurrency(data.items.reduce((a, b) => a + b.amount, 0))}</span></div>
          <div className="flex justify-between py-1 border-b border-gray-100"><span>Tax ({data.taxRate}%):</span> <span>{formatCurrency((data.items.reduce((a, b) => a + b.amount, 0) * data.taxRate)/100)}</span></div>
          <div className="flex justify-between p-3 mt-4 rounded-lg text-white font-bold" style={{ backgroundColor: s.colors.primary }}>
            <span>{s.labels.total}</span>
            <span>{formatCurrency(data.items.reduce((a, b) => a + b.amount, 0) * 1.19)}</span>
          </div>
        </div>
      </div>
    ),

    footer: (
       <div className="mt-auto pt-6 border-t-2 border-gray-100">
          <div style={{ fontSize: 11, fontWeight: 'bold', color: s.colors.secondary, textTransform: 'uppercase', marginBottom: 5 }}>
            {s.labels.paymentInstructions}
          </div>
          <div style={{ fontSize: 12, color: s.colors.text, whiteSpace: 'pre-line' }}>
            {settings.paymentTerms.bankDetails || "Bank Name: XXXX\nIBAN: TN59..."}
          </div>
       </div>
    )
  };

  // Section Mapping
  const sectionMap = { header: "branding", details: "text", items: "table", totals: "text", footer: "text" };
  
  // Sort Sections
  const activeSections = s.layout.sections
    .filter(sec => sec.visible)
    .sort((a, b) => a.order - b.order);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(activeSections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    if (onReorder) onReorder(items);
  };

  return (
    <>
      <ZoomControls zoom={zoom} onZoomIn={() => setZoom(z => z + 0.1)} onZoomOut={() => setZoom(z => Math.max(0.5, z - 0.1))} onZoomReset={() => setZoom(0.8)} />
      
      <div style={pageStyle}>
        <div className="flex flex-col h-full">
           <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="preview">
                 {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col flex-1">
                       {activeSections.map((sec, index) => {
                          const content = renderers[sec.id];
                          if (!content) return null;
                          return (
                             <DraggableBlock key={sec.id} id={sec.id} index={index} onEdit={() => onEditSection(sectionMap[sec.id])} className={sec.id === 'footer' ? 'mt-auto' : ''}>
                                {content}
                             </DraggableBlock>
                          );
                       })}
                       {provided.placeholder}
                    </div>
                 )}
              </Droppable>
           </DragDropContext>
        </div>
      </div>
    </>
  );
};

export default LiveInvoicePreview;