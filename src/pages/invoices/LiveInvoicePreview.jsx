import React, { useState, useEffect } from "react";
import { Edit2, GripVertical, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useTranslation } from "react-i18next";

// ==========================================
// ZOOM CONTROLS COMPONENT
// ==========================================
const ZoomControls = ({ zoom, onZoomIn, onZoomOut, onZoomReset }) => {
  const { t } = useTranslation();

  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
        title={t("invoicePreview.zoom.zoomIn")}
      >
        <ZoomIn size={20} />
      </button>

      {/* Zoom Percentage */}
      <div className="px-2 py-1 text-center">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
        title={t("invoicePreview.zoom.zoomOut")}
      >
        <ZoomOut size={20} />
      </button>

      {/* Reset Zoom */}
      <button
        onClick={onZoomReset}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 border-t border-gray-200 dark:border-gray-600"
        title={t("invoicePreview.zoom.reset")}
      >
        <Maximize2 size={20} />
      </button>
    </div>
  );
};

// ==========================================
// DRAGGABLE WRAPPER COMPONENT
// ==========================================
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
          className={`relative group mb-1 transition-all duration-200 ${
            snapshot.isDragging
              ? "z-50 shadow-2xl scale-105 bg-white ring-2 ring-orange-400 rounded-lg opacity-90"
              : ""
          } ${className}`}
          style={{ ...provided.draggableProps.style, ...style }}
        >
          {/* Action Overlay (Visible on Hover) */}
          <div className="absolute -left-12 top-0 bottom-0 w-10 flex flex-col items-end justify-start pt-2 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
            {/* Drag Handle */}
            <div
              {...provided.dragHandleProps}
              className="p-1.5 bg-gray-100 hover:bg-orange-100 text-gray-500 hover:text-orange-600 rounded cursor-grab active:cursor-grabbing mb-1 shadow-sm transition-colors"
              title={t("invoicePreview.tooltips.drag")}
            >
              <GripVertical size={16} />
            </div>

            {/* Edit Button */}
            {onEdit && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1.5 bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 rounded cursor-pointer shadow-sm transition-colors"
                title={t("invoicePreview.tooltips.edit")}
              >
                <Edit2 size={16} />
              </div>
            )}
          </div>

          {/* Hover Border Effect */}
          <div
            onClick={onEdit}
            className={`border-2 border-transparent ${
              onEdit ? "hover:border-dashed hover:border-gray-300 cursor-pointer" : ""
            } rounded-sm transition-colors`}
          >
            {children}
          </div>
        </div>
      )}
    </Draggable>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const LiveInvoicePreview = ({ settings, data, onEditSection, onReorder }) => {
  const { t, i18n } = useTranslation();

  // ==========================================
  // ZOOM STATE
  // ==========================================
  const [zoom, setZoom] = useState(1);
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2;
  const ZOOM_STEP = 0.1;

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Plus/Equals
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        handleZoomIn();
      }
      // Ctrl/Cmd + Minus
      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      }
      // Ctrl/Cmd + 0
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        handleZoomReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  const formatCurrency = (amount, currency = "DT") => {
    const localeMap = {
      en: "en-US",
      fr: "fr-FR",
      ar: "ar-TN",
    };
    const locale = localeMap[i18n.language] || "fr-TN";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "TND",
    })
      .format(amount)
      .replace("TND", currency)
      .replace("د.ت.‏", currency);
  };

  const formatDate = (d) => {
    if (!d) return "...";
    const localeMap = {
      en: "en-GB",
      fr: "fr-FR",
      ar: "ar-TN",
    };
    return new Date(d).toLocaleDateString(localeMap[i18n.language] || "fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ==========================================
  // SETTINGS & STYLES
  // ==========================================

  const s = {
    colors: settings?.branding?.colors || {
      primary: "#F18237",
      secondary: "#374151",
      text: "#1F2937",
    },
    fonts: settings?.branding?.fonts || { body: "Helvetica", size: 10 },
    company: settings?.companyInfo || {},
    labels: settings?.labels || {},
    layout: settings?.layout || {
      density: "standard",
      borderRadius: 4,
      sections: [],
    },
    table: settings?.table || {
      headerColor: "",
      striped: false,
      rounded: true,
      columns: {},
    },
    logo: settings?.branding?.logo?.url,
    currency: settings?.currency || { symbol: "DT", position: "after" },
    paymentTerms: settings?.paymentTerms || {},
  };

  const pageStyle = {
    fontFamily: s.fonts.body,
    fontSize: `${s.fonts.size}px`,
    color: s.colors.text,
    backgroundColor: "#FFFFFF",
    padding:
      s.layout.density === "compact"
        ? "30px"
        : s.layout.density === "spacious"
          ? "70px"
          : "50px",
  };

  const primaryText = { color: s.colors.primary };
  const secondaryText = { color: s.colors.secondary };
  const borderRadius = { borderRadius: `${s.layout.borderRadius}px` };
  const tableHeaderStyle = {
    backgroundColor: s.table.headerColor || s.colors.primary,
    color: "#FFFFFF",
  };

  // Mock Calculations
  const subtotal =
    data.items?.reduce((acc, item) => acc + (item.amount || 0), 0) || 0;
  const taxAmount = (subtotal * (data.taxRate || 19)) / 100;
  const discountAmount = data.discount || 0;
  const totalAmount = subtotal + taxAmount - discountAmount;

  // ==========================================
  // BLOCK RENDERERS
  // ==========================================

  const renderers = {
    header: (
      <div className="flex justify-between items-start mb-6">
        <div>
          {s.logo ? (
            <img
              src={s.logo}
              alt="Logo"
              className="object-contain"
              style={{
                height: settings?.branding?.logo?.height || 60,
                ...borderRadius,
              }}
            />
          ) : (
            <div
              className="bg-gray-100 text-gray-300 font-bold flex items-center justify-center border-2 border-dashed border-gray-200"
              style={{ width: 150, height: 60, ...borderRadius }}
            >
              LOGO
            </div>
          )}
        </div>
        <div className="text-right">
          <h1
            className="text-5xl font-black uppercase leading-none tracking-tighter"
            style={primaryText}
          >
            {s.labels.invoiceTitle || t("invoicePreview.defaultLabels.invoice")}
          </h1>
          <p
            className="mt-2 font-medium opacity-60 tracking-wide text-sm"
            style={secondaryText}
          >
            # {data.invoiceNumber}
          </p>
        </div>
      </div>
    ),

    details: (
      <div className="mb-8">
        <div className="flex justify-between items-start pt-4 border-t border-gray-100">
          <div className="w-5/12">
            <p className="text-[0.75em] font-bold uppercase tracking-widest opacity-40 mb-2 pb-1 border-b border-gray-100">
              {s.labels.from || t("invoicePreview.defaultLabels.from")}
            </p>
            <p
              className="font-bold text-[1.1em] mb-1"
              style={{ color: "#111" }}
            >
              {s.company.displayName || "Ma Société"}
            </p>
            <div className="opacity-70 text-[0.9em] leading-relaxed">
              <p>123 Rue Exemple</p>
              <p>Tunis, Tunisie</p>
              {s.company.matriculeFiscale && (
                <p>MF: {s.company.matriculeFiscale}</p>
              )}
            </div>
          </div>
          <div className="w-5/12 text-right">
            <p className="text-[0.75em] font-bold uppercase tracking-widest opacity-40 mb-2 pb-1 border-b border-gray-100">
              {s.labels.to || t("invoicePreview.defaultLabels.to")}
            </p>
            <p
              className="font-bold text-[1.1em] mb-1"
              style={{ color: "#111" }}
            >
              {data.recipient?.name || "Client Name"}
            </p>
            <div className="opacity-70 text-[0.9em] leading-relaxed">
              <p>{data.recipient?.email}</p>
              <p>{data.recipient?.phone}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-8 mt-6 pt-2">
          <div>
            <span className="font-bold opacity-50 text-[0.8em] uppercase mr-2">
              {t("invoicePreview.date")}:
            </span>
            <span className="font-medium">{formatDate(data.issueDate)}</span>
          </div>
          <div>
            <span className="font-bold opacity-50 text-[0.8em] uppercase mr-2">
              {t("invoicePreview.dueDate")}:
            </span>
            <span className="font-medium">{formatDate(data.dueDate)}</span>
          </div>
        </div>
      </div>
    ),

    items: (
      <div className="mb-6">
        <table
          className="w-full mt-2"
          style={{
            borderCollapse: s.table.rounded ? "separate" : "collapse",
            borderSpacing: 0,
          }}
        >
          <thead>
            <tr style={tableHeaderStyle}>
              {s.table.columns.description && (
                <th
                  className="py-3 px-4 text-left font-bold text-[0.85em] uppercase tracking-wider"
                  style={{
                    borderTopLeftRadius: s.table.rounded
                      ? s.layout.borderRadius
                      : 0,
                    borderBottomLeftRadius: s.table.rounded
                      ? s.layout.borderRadius
                      : 0,
                  }}
                >
                  {s.labels.item ||
                    t("invoicePreview.defaultLabels.description")}
                </th>
              )}
              {s.table.columns.quantity && (
                <th className="py-3 px-2 text-center font-bold text-[0.85em] uppercase tracking-wider">
                  {s.labels.quantity ||
                    t("invoicePreview.defaultLabels.quantity")}
                </th>
              )}
              {s.table.columns.rate && (
                <th className="py-3 px-2 text-right font-bold text-[0.85em] uppercase tracking-wider">
                  {s.labels.rate || t("invoicePreview.defaultLabels.price")}
                </th>
              )}
              {s.table.columns.total && (
                <th
                  className="py-3 px-4 text-right font-bold text-[0.85em] uppercase tracking-wider"
                  style={{
                    borderTopRightRadius: s.table.rounded
                      ? s.layout.borderRadius
                      : 0,
                    borderBottomRightRadius: s.table.rounded
                      ? s.layout.borderRadius
                      : 0,
                  }}
                >
                  {s.labels.total || t("invoicePreview.defaultLabels.total")}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="text-[0.95em]">
            {data.items?.map((item, idx) => (
              <tr
                key={idx}
                className={s.table.striped && idx % 2 !== 0 ? "bg-gray-50" : ""}
              >
                {s.table.columns.description && (
                  <td className="py-4 px-4 border-b border-gray-100">
                    <p className="font-bold text-gray-800">
                      {item.description}
                    </p>
                  </td>
                )}
                {s.table.columns.quantity && (
                  <td className="py-4 px-2 text-center border-b border-gray-100 opacity-70">
                    {item.quantity}
                  </td>
                )}
                {s.table.columns.rate && (
                  <td className="py-4 px-2 text-right border-b border-gray-100 opacity-70">
                    {formatCurrency(item.rate, s.currency.symbol)}
                  </td>
                )}
                {s.table.columns.total && (
                  <td className="py-4 px-4 text-right border-b border-gray-100 font-bold">
                    {formatCurrency(item.amount, s.currency.symbol)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),

    totals: (
      <div className="flex justify-end pt-2 mb-6">
        <div className="w-5/12 space-y-2">
          <div className="flex justify-between text-[0.9em] opacity-70 border-b border-gray-100 pb-2">
            <span>{t("invoicePreview.subtotal")}</span>
            <span>{formatCurrency(subtotal, s.currency.symbol)}</span>
          </div>
          <div className="flex justify-between text-[0.9em] opacity-70 border-b border-gray-100 pb-2">
            <span>
              {t("invoicePreview.tax")} ({data.taxRate || 19}%)
            </span>
            <span>{formatCurrency(taxAmount, s.currency.symbol)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-[0.9em] text-red-500 border-b border-gray-100 pb-2">
              <span>{t("invoicePreview.discount")}</span>
              <span>-{formatCurrency(discountAmount, s.currency.symbol)}</span>
            </div>
          )}
          <div
            className="flex justify-between text-[1.4em] font-extrabold pt-2"
            style={primaryText}
          >
            <span>
              {s.labels.total || t("invoicePreview.defaultLabels.total")}
            </span>
            <span>{formatCurrency(totalAmount, s.currency.symbol)}</span>
          </div>
        </div>
      </div>
    ),

    footer: s.paymentTerms.bankDetails ? (
      <div className="mt-8 pt-4">
        <div
          className="bg-gray-50 p-6 border border-gray-100"
          style={borderRadius}
        >
          <h4
            className="font-bold mb-3 uppercase text-[0.8em] tracking-wider"
            style={primaryText}
          >
            {s.labels.paymentInstructions ||
              t("invoicePreview.defaultLabels.paymentInstructions")}
          </h4>
          <div className="opacity-70 whitespace-pre-line leading-relaxed text-[0.9em] font-medium text-gray-600">
            {s.paymentTerms.bankDetails}
          </div>
        </div>
      </div>
    ) : null,
  };

  // ==========================================
  // SECTION MAPPING & SORTING
  // ==========================================

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

    if (onReorder) {
      onReorder(items);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="flex justify-center items-start overflow-auto p-8 bg-gray-800/50 min-h-full select-none relative">
      {/* Zoom Controls */}
      <ZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
      />

      {/* A4 PAGE CONTAINER with Zoom Transform */}
      <div
        className="shadow-2xl relative flex flex-col transition-all duration-300"
        style={{
          width: "794px",
          minHeight: "1123px",
          ...pageStyle,
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
        }}
      >
        {/* Watermark */}
        {settings?.branding?.watermark?.enabled &&
          settings.branding.watermark.url && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] z-0 overflow-hidden">
              <img
                src={settings.branding.watermark.url}
                className="w-2/3 object-contain"
                alt="Watermark"
              />
            </div>
          )}

        <div className="flex-1 z-10 flex flex-col h-full">
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
                        className={
                          section.id === "footer" &&
                          index === activeSections.length - 1
                            ? "mt-auto"
                            : ""
                        }
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

        {/* Page Numbers */}
        <div className="absolute bottom-6 left-0 right-0 text-center text-[10px] text-gray-400 uppercase tracking-widest">
          {t("invoicePreview.pageInfo", { current: 1, total: 1 })}
        </div>
      </div>
    </div>
  );
};

export default LiveInvoicePreview;