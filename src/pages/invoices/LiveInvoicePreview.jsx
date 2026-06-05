import React, { useState, useEffect } from "react";
import { Edit2, GripVertical, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useTranslation } from "react-i18next";

// ==========================================
// 1. HELPER COMPONENTS
// ==========================================

const ZoomControls = ({ zoom, onZoomIn, onZoomOut, onZoomReset }) => {
  const { t } = useTranslation();
  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
      <button
        onClick={onZoomIn}
        className="p-2 hover:bg-gray-100 rounded transition text-gray-700 hover:text-orange-600"
      >
        <ZoomIn size={20} />
      </button>
      <div className="px-2 py-1 text-center">
        <span className="text-xs font-semibold text-gray-700">
          {Math.round(zoom * 100)}%
        </span>
      </div>
      <button
        onClick={onZoomOut}
        className="p-2 hover:bg-gray-100 rounded transition text-gray-700 hover:text-orange-600"
      >
        <ZoomOut size={20} />
      </button>
      <button
        onClick={onZoomReset}
        className="p-2 hover:bg-gray-100 rounded transition text-gray-700 hover:text-orange-600 border-t"
      >
        <Maximize2 size={20} />
      </button>
    </div>
  );
};

const DraggableBlock = ({
  id,
  index,
  onEdit,
  children,
  className = "",
  style = {},
}) => {
  const { t } = useTranslation();
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`relative group mb-1 transition-all duration-200 ${snapshot.isDragging ? "z-50 shadow-2xl scale-105 bg-white ring-2 ring-orange-400 rounded-lg opacity-90" : ""} ${className}`}
          style={{ ...provided.draggableProps.style, ...style }}
        >
          <div className="absolute -left-12 top-0 bottom-0 w-10 flex flex-col items-end justify-start pt-2 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
            <div
              {...provided.dragHandleProps}
              className="p-1.5 bg-gray-100 hover:bg-orange-100 text-gray-500 hover:text-orange-600 rounded cursor-grab shadow-sm mb-1"
            >
              <GripVertical size={16} />
            </div>
            {onEdit && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1.5 bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 rounded cursor-pointer shadow-sm"
              >
                <Edit2 size={16} />
              </div>
            )}
          </div>
          <div
            onClick={onEdit}
            className={`border-2 border-transparent ${onEdit ? "hover:border-dashed hover:border-gray-300 cursor-pointer" : ""} rounded-sm transition-colors`}
          >
            {children}
          </div>
        </div>
      )}
    </Draggable>
  );
};

// ==========================================
// 2. MAIN PREVIEW COMPONENT
// ==========================================

const LiveInvoicePreview = ({ settings, data, onEditSection, onReorder }) => {
  const { t, i18n } = useTranslation();
  const [zoom, setZoom] = useState(0.8);

  // --- SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        setZoom((z) => Math.min(z + 0.1, 2));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setZoom((z) => Math.max(z - 0.1, 0.5));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        setZoom(0.8);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- UTILS ---
  const formatCurrency = (amt) =>
    new Intl.NumberFormat("fr-TN", {
      style: "decimal",
      minimumFractionDigits: 3,
    }).format(amt) + " TND";

  const formatDate = (d) => {
    if (!d) return "...";
    return new Date(d).toLocaleDateString("fr-FR");
  };

  const formatAddress = (addr) => {
    if (!addr) return null;
    if (typeof addr === "object") {
      return (
        <>
          <div>{addr.street}</div>
          <div>{[addr.city, addr.zipCode].filter(Boolean).join(" ")}</div>
          <div>{addr.country}</div>
        </>
      );
    }
    return <div className="whitespace-pre-line">{addr}</div>;
  };

  // --- STYLES & SETTINGS ---
  const s = {
    colors: settings?.branding?.colors || {
      primary: "#F18237",
      secondary: "#374151",
      text: "#1F2937",
    },
    fonts: settings?.branding?.fonts || { size: 10 },
    company: settings?.companyInfo || {},
    labels: settings?.labels || {},
    layout: settings?.layout || { sections: [] },
    table: settings?.table || {
      headerColor: "#F18237",
      striped: false,
      rounded: true,
      columns: {},
    },
    logo: settings?.branding?.logo?.url,
    paymentTerms: settings?.paymentTerms || {},
  };

  // Page Container Style
  const pageStyle = {
    width: "794px",
    minHeight: "1123px",
    backgroundColor: "white",
    padding: "50px 60px", // Matches Backend Margin
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: `${s.fonts.size}px`,
    color: s.colors.text,
    lineHeight: 1.5,
    transform: `scale(${zoom})`,
    transformOrigin: "top center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    position: "relative",
    overflow: "hidden", // For brand strip
  };

  const styles = {
    primaryText: { color: s.colors.primary },
    secondaryText: { color: s.colors.secondary },
    label: {
      fontSize: "10px",
      fontWeight: 700,
      textTransform: "uppercase",
      color: s.colors.secondary,
      marginBottom: "5px",
      display: "block",
    },
    headerValue: {
      fontSize: "15px",
      fontWeight: 700,
      color: "#000",
      marginBottom: "4px",
    },
    smallText: { fontSize: "11px", color: s.colors.secondary },
  };

  // Calculations
  const subtotal =
    data.items?.reduce((acc, item) => acc + (item.amount || 0), 0) || 0;
  const taxAmount = (subtotal * (data.taxRate || 19)) / 100;
  const discountAmount = data.discount || 0;
  const totalAmount = subtotal + taxAmount - discountAmount;

  // ==========================================
  // RENDERERS
  // ==========================================

  const renderers = {
    header: (
      <div className="flex justify-between items-start mb-10 mt-4">
        <div>
          {s.logo ? (
            <img
              src={s.logo}
              alt="Logo"
              className="object-contain"
              style={{ height: 80, maxWidth: 200 }}
            />
          ) : (
            <h2
              style={{
                ...styles.primaryText,
                fontSize: "28px",
                fontWeight: 700,
                margin: 0,
              }}
            >
              {s.company.displayName || "My Company"}
            </h2>
          )}
        </div>
        <div className="text-right">
          <h1
            style={{
              ...styles.primaryText,
              fontSize: "32px",
              fontWeight: 800,
              textTransform: "uppercase",
              margin: 0,
              lineHeight: 1,
            }}
          >
            {s.labels.invoiceTitle || "FACTURE"}
          </h1>
          <p
            style={{
              ...styles.secondaryText,
              fontSize: "14px",
              fontWeight: 600,
              marginTop: "8px",
            }}
          >
            # {data.invoiceNumber}
          </p>
        </div>
      </div>
    ),

    details: (
      <div className="mb-8">
        <div className="flex justify-between gap-10">
          {/* SENDER BOX (Left) */}
          <div className="w-1/2">
            <span style={styles.label}>{s.labels.from || "FROM"}</span>
            <div style={styles.headerValue}>
              {s.company.displayName || "Ma Société"}
            </div>
            <div style={styles.smallText}>
              {formatAddress(
                data.senderAddress || "123 Rue Exemple\nTunis, Tunisie"
              )}
              {s.company.matriculeFiscale && (
                <div className="mt-1">MF: {s.company.matriculeFiscale}</div>
              )}
            </div>

            {/* Dates (Aligned Left under sender) */}
            <div className="flex gap-8 mt-6">
              <div>
                <span style={styles.label}>DATE</span>
                <span className="font-medium text-sm text-black">
                  {formatDate(data.issueDate)}
                </span>
              </div>
              <div>
                <span style={styles.label}>DUE</span>
                <span className="font-medium text-sm text-black">
                  {formatDate(data.dueDate)}
                </span>
              </div>
            </div>
          </div>

          {/* RECIPIENT BOX (Right - Gray Background) */}
          <div
            className="w-1/2 bg-gray-50 p-5 rounded-lg border-l-4"
            style={{ borderColor: s.colors.primary }}
          >
            <span style={styles.label}>{s.labels.to || "BILL TO"}</span>
            <div style={styles.headerValue}>
              {data.recipient?.name || "Client Name"}
            </div>
            <div style={styles.smallText}>
              {data.recipient?.email && <div>{data.recipient.email}</div>}
              {data.recipient?.phone && <div>{data.recipient.phone}</div>}
              {formatAddress(data.recipientAddress)}
            </div>
          </div>
        </div>
      </div>
    ),

    items: (
      <div className="mb-6 mt-8">
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {s.table.columns.description && (
                <th
                  className="text-left py-3 px-3 text-[11px] font-bold uppercase text-white first:rounded-l-md"
                  style={{ backgroundColor: s.table.headerColor }}
                >
                  {s.labels.item || "Description"}
                </th>
              )}
              {s.table.columns.quantity && (
                <th
                  className="text-center py-3 px-3 text-[11px] font-bold uppercase text-white"
                  style={{ backgroundColor: s.table.headerColor }}
                >
                  {s.labels.quantity || "Qty"}
                </th>
              )}
              {s.table.columns.rate && (
                <th
                  className="text-right py-3 px-3 text-[11px] font-bold uppercase text-white"
                  style={{ backgroundColor: s.table.headerColor }}
                >
                  {s.labels.rate || "Price"}
                </th>
              )}
              {s.table.columns.total && (
                <th
                  className="text-right py-3 px-3 text-[11px] font-bold uppercase text-white last:rounded-r-md"
                  style={{ backgroundColor: s.table.headerColor }}
                >
                  {s.labels.total || "Total"}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.items?.map((item, idx) => (
              <tr
                key={idx}
                style={{
                  backgroundColor:
                    s.table.striped && idx % 2 !== 0
                      ? "#F9FAFB"
                      : "transparent",
                }}
              >
                {s.table.columns.description && (
                  <td className="py-3 px-3 border-b border-gray-100 text-xs font-medium">
                    {item.description}
                  </td>
                )}
                {s.table.columns.quantity && (
                  <td className="py-3 px-3 border-b border-gray-100 text-xs text-center">
                    {item.quantity}
                  </td>
                )}
                {s.table.columns.rate && (
                  <td className="py-3 px-3 border-b border-gray-100 text-xs text-right">
                    {formatCurrency(item.rate)}
                  </td>
                )}
                {s.table.columns.total && (
                  <td className="py-3 px-3 border-b border-gray-100 text-xs text-right font-bold">
                    {formatCurrency(item.amount)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),

    totals: (
      <div className="flex justify-end mt-2">
        <div style={{ width: "350px" }}>
          <div className="flex justify-between py-1.5 border-b border-gray-100 text-xs">
            <span style={styles.secondaryText}>
              {t("invoicePreview.subtotal") || "Subtotal"}:
            </span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-gray-100 text-xs">
            <span style={styles.secondaryText}>
              {t("invoicePreview.tax") || "Tax"} ({data.taxRate}%):
            </span>
            <span className="font-medium">{formatCurrency(taxAmount)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between py-1.5 border-b border-gray-100 text-xs text-red-500">
              <span>Discount:</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}

          <div
            className="flex justify-between items-center p-3 mt-3 rounded-md text-white shadow-sm"
            style={{ backgroundColor: s.colors.primary }}
          >
            <span className="text-sm font-bold uppercase">
              {s.labels.total || "Total"}
            </span>
            <span className="text-lg font-bold">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>
    ),

    footer:
      s.paymentTerms.bankDetails || s.labels.paymentInstructions ? (
        <div className="mt-auto pt-8 border-t-2 border-dashed border-gray-100">
          <div style={{ ...styles.label, marginBottom: "8px" }}>
            {s.labels.paymentInstructions || "Payment Instructions"}
          </div>
          <div className="text-xs text-gray-600 bg-gray-50 p-4 rounded-md whitespace-pre-line leading-relaxed">
            {s.paymentTerms.bankDetails || "Bank details here..."}
          </div>
        </div>
      ) : null,
  };

  // --- SORTING ---
  const sectionEditMap = {
    header: "branding",
    details: "text",
    items: "table",
    totals: "text",
    footer: "text",
  };
  const activeSections = (s.layout.sections || [])
    .filter((sec) => sec.visible)
    .sort((a, b) => a.order - b.order);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(activeSections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    if (onReorder) onReorder(items);
  };

  return (
    <div className="flex justify-center items-start overflow-auto p-8 bg-gray-800/50 min-h-full select-none relative">
      <ZoomControls
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(z + 0.1, 2))}
        onZoomOut={() => setZoom((z) => Math.max(z - 0.1, 0.5))}
        onZoomReset={() => setZoom(0.8)}
      />

      <div style={pageStyle}>
        {/* Brand Strip */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "10px",
            backgroundColor: s.colors.primary,
          }}
        />

        <div className="flex-1 z-10 flex flex-col h-full pt-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="invoice-preview-sections">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex flex-col flex-1"
                >
                  {activeSections.map((section, index) => {
                    const content = renderers[section.id];
                    if (!content) return null;
                    return (
                      <DraggableBlock
                        key={section.id}
                        id={section.id}
                        index={index}
                        onEdit={() =>
                          onEditSection &&
                          onEditSection(sectionEditMap[section.id])
                        }
                        className={section.id === "footer" ? "mt-auto" : ""}
                      >
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

        {/* Page Number Mockup */}
        <div className="absolute bottom-4 left-0 w-full text-center text-[10px] text-gray-400 uppercase tracking-widest">
          Page 1 / 1
        </div>
      </div>
    </div>
  );
};

export default LiveInvoicePreview;
