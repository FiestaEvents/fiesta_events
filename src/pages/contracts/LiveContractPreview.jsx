import React from "react";
import { Edit2, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useTranslation } from "react-i18next";
import formatCurrency from "../../utils/formatCurrency"; // Ensure path is correct

// ==========================================
// HELPER: DRAGGABLE + EDITABLE WRAPPER
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
          className={`relative group mb-4 transition-all duration-200 ${
            snapshot.isDragging
              ? "z-50 shadow-2xl scale-105 bg-white ring-2 ring-orange-400 rounded-lg"
              : ""
          } ${className}`}
          style={{ ...provided.draggableProps.style, ...style }}
        >
          {/* Action Overlay (Visible on Hover) */}
          <div className="absolute -left-12 top-0 bottom-0 w-10 flex flex-col items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity pr-2">
            {/* Drag Handle */}
            <div
              {...provided.dragHandleProps}
              className="p-1.5 bg-gray-200 hover:bg-orange-100 text-gray-500 hover:text-orange-600 rounded cursor-grab active:cursor-grabbing mb-1 shadow-sm"
              title={t("contracts.preview.tooltips.drag")}
            >
              <GripVertical size={16} />
            </div>

            {/* Edit Button */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onEdit(id);
              }}
              className="p-1.5 bg-gray-200 hover:bg-blue-100 text-gray-500 hover:text-blue-600 rounded cursor-pointer shadow-sm"
              title={t("contracts.preview.tooltips.edit")}
            >
              <Edit2 size={16} />
            </div>
          </div>

          {/* Dotted Border for visual boundary */}
          <div
            onClick={() => onEdit(id)}
            className="border-2 border-transparent hover:border-dashed hover:border-gray-300 rounded-sm p-1 transition-colors cursor-pointer"
          >
            {children}
          </div>
        </div>
      )}
    </Draggable>
  );
};

const LiveContractPreview = ({ settings, data, onEditSection, onReorder }) => {
  const { t, i18n } = useTranslation();

  // Safe Defaults
  const s = {
    colors: settings?.branding?.colors || {
      primary: "#F18237",
      text: "#1F2937",
    },
    company: settings?.companyInfo || {},
    labels: settings?.labels || {},
    layout: settings?.layout || {},
    logo: settings?.branding?.logo?.url,
    blockOrder: settings?.layout?.blockOrder,
  };

  const isPartner = data.contractType === "partner";

  // Dynamic Date Formatter based on current language
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

  // Styles
  const primaryStyle = { color: s.colors.primary };
  const borderStyle = { borderColor: s.colors.primary };

  // ==========================================
  // BLOCK RENDERERS
  // ==========================================

  const renderers = {
    header: (
      <div
        className="flex justify-between items-start pb-4 border-b-2"
        style={borderStyle}
      >
        <div className="flex-1">
          {s.logo ? (
            <img src={s.logo} alt="Logo" className="h-16 object-contain mb-2" />
          ) : (
            <h1 className="text-xl font-bold uppercase" style={primaryStyle}>
              {s.company.displayName || t("contracts.preview.defaultCompany")}
            </h1>
          )}
          <div className="text-[10px] text-gray-500 leading-tight mt-1">
            <p className="font-bold text-gray-700">{s.company.legalName}</p>
            <p>{s.company.address}</p>
            {s.company.matriculeFiscale && (
              <p>MF: {s.company.matriculeFiscale}</p>
            )}
            <p>{s.company.email}</p>
          </div>
        </div>
        <div className="text-right">
          <h2
            className="text-lg font-black uppercase mb-1"
            style={primaryStyle}
          >
            {s.labels.contractTitle || t("contracts.preview.defaultTitle")}
          </h2>
          <p className="font-mono text-[10px] text-gray-600">
            {t("contracts.preview.ref")}: {data.contractNumber}
          </p>
          {s.layout.showDate && (
            <p className="text-[10px] text-gray-600">
              {t("contracts.preview.date")}: {formatDate(new Date())}
            </p>
          )}
        </div>
      </div>
    ),

    parties: (
      <div>
        <h3 className="text-xs font-bold uppercase mb-2 tracking-wide text-gray-400 border-b pb-1">
          {s.labels.partiesTitle || t("contracts.preview.partiesTitle")}
        </h3>
        <div className="flex gap-8">
          <div className="flex-1 pl-3 border-l-2" style={borderStyle}>
            <p className="font-bold text-sm">
              {s.company.legalName || t("contracts.preview.providerDefault")}
            </p>
            <p className="text-xs text-gray-500">
              {t("contracts.preview.aka")} "
              {s.labels.serviceProvider || t("contracts.preview.providerLabel")}
              "
            </p>
          </div>
          <div className="flex-1 pl-3 border-l-2 border-gray-300">
            <p className="font-bold text-sm">
              {data.party?.name || t("contracts.preview.clientDefault")}
            </p>
            <p className="text-xs text-gray-500">
              {t("contracts.preview.aka")} "
              {isPartner
                ? s.labels.partnerLabel || t("contracts.preview.partnerLabel")
                : s.labels.clientLabel || t("contracts.preview.clientLabel")}
              "
            </p>
          </div>
        </div>
      </div>
    ),

    scope: (
      <div>
        <h3
          className="text-xs font-bold uppercase mb-2 tracking-wide"
          style={primaryStyle}
        >
          {s.labels.servicesTitle || t("contracts.preview.objectTitle")}
        </h3>
        <p className="text-justify mb-2">
          {t("contracts.preview.objectIntro")} <strong>{data.title}</strong>.
        </p>
        <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-2 rounded border border-gray-100">
          <div className="flex justify-between">
            <span className="text-gray-500">
              {t("contracts.preview.start")}:
            </span>
            <span className="font-bold">
              {formatDate(data.logistics?.startDate)} (
              {data.logistics?.checkInTime})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t("contracts.preview.end")}:</span>
            <span className="font-bold">
              {formatDate(data.logistics?.endDate)} (
              {data.logistics?.checkOutTime})
            </span>
          </div>
        </div>
      </div>
    ),

    financials: (
      <div>
        <h3
          className="text-xs font-bold uppercase mb-2 tracking-wide"
          style={primaryStyle}
        >
          {s.labels.paymentTitle || t("contracts.preview.financialsTitle")}
        </h3>
        {isPartner ? (
          <div className="text-xs">
            <ul className="list-disc list-inside space-y-1">
              {data.services?.map((svc, i) => (
                <li key={i}>
                  <strong>{svc.description}</strong> :{" "}
                  {formatCurrency(svc.amount)}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr
                className="text-white"
                style={{ backgroundColor: s.colors.primary }}
              >
                <th className="p-2 text-left">
                  {t("contracts.preview.table.description")}
                </th>
                <th className="p-2 text-center">
                  {t("contracts.preview.table.qty")}
                </th>
                <th className="p-2 text-right">
                  {t("contracts.preview.table.totalHT")}
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {data.services?.map((svc, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-2 border-b border-gray-100">
                    {svc.description}
                  </td>
                  <td className="p-2 border-b border-gray-100 text-center">
                    {svc.quantity}
                  </td>
                  <td className="p-2 border-b border-gray-100 text-right">
                    {formatCurrency(svc.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="flex justify-end mt-4">
          <div className="w-48 text-xs space-y-1">
            <div
              className="flex justify-between font-bold"
              style={primaryStyle}
            >
              <span>{t("contracts.preview.netToPay")}:</span>
              <span>{formatCurrency(data.financials?.totalTTC)}</span>
            </div>
          </div>
        </div>
      </div>
    ),

    clauses: (
      <div className="min-h-[100px]">
        <h3
          className="text-xs font-bold uppercase mb-2 tracking-wide"
          style={primaryStyle}
        >
          {t("contracts.preview.generalConditions")}
        </h3>
        <div className="space-y-3">
          {settings.defaultSections?.length > 0 ? (
            settings.defaultSections.map((sec, i) => (
              <div key={i}>
                <p className="font-bold text-[10px] uppercase mb-0.5">
                  {sec.title}
                </p>
                <p className="text-[10px] text-justify text-gray-600 leading-relaxed">
                  {sec.content}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 italic py-4">
              {t("contracts.preview.noClauses")}
            </p>
          )}
          <div className="mt-4 pt-2 border-t border-gray-100">
            <p className="font-bold text-[10px] uppercase">
              {t("contracts.preview.jurisdiction")}
            </p>
            <p className="text-[10px]">
              {t("contracts.preview.jurisdictionText")}{" "}
              {data.legal?.jurisdiction}.
            </p>
          </div>
        </div>
      </div>
    ),

    signatures: (
      <div>
        <h3 className="text-xs font-bold uppercase mb-6 text-center opacity-50 tracking-widest">
          {s.labels.signaturesTitle || t("contracts.preview.signaturesTitle")}
        </h3>
        <div className="flex justify-between gap-10">
          <div className="flex-1 h-24 border border-dashed border-gray-300 rounded p-2 relative">
            <p className="text-[9px] uppercase font-bold text-gray-400 mb-1">
              {t("contracts.preview.for")} {s.company.displayName}
            </p>
          </div>
          <div className="flex-1 h-24 border border-dashed border-gray-300 rounded p-2 relative">
            <p className="text-[9px] uppercase font-bold text-gray-400 mb-1">
              {t("contracts.preview.for")}{" "}
              {isPartner
                ? t("contracts.preview.partnerLabel")
                : t("contracts.preview.clientLabel")}
            </p>
          </div>
        </div>
      </div>
    ),

    footer: (
      <div className="text-center border-t border-gray-100 pt-2 mt-auto">
        <p className="text-[9px] text-gray-400">
          {s.company.legalName} - MF: {s.company.matriculeFiscale}
        </p>
      </div>
    ),
  };

  // Determine current order, fallback to default if settings missing
  const blockOrder =
    s.blockOrder && s.blockOrder.length > 0
      ? s.blockOrder
      : [
          "header",
          "parties",
          "scope",
          "financials",
          "clauses",
          "signatures",
          "footer",
        ];

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const newOrder = Array.from(blockOrder);
    const [moved] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, moved);

    if (onReorder) {
      onReorder(newOrder);
    }
  };

  return (
    <div className="w-full h-full flex justify-center items-start overflow-hidden bg-gray-800/50 py-8 select-none">
      {/* A4 PAGE CONTAINER */}
      <div
        className="bg-white shadow-2xl origin-top transform-gpu transition-transform duration-300"
        style={{
          width: "794px",
          minHeight: "1123px",
          padding: "50px 60px",
          color: s.colors.text,
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: "11px",
          lineHeight: "1.5",
        }}
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="contract-preview-blocks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex flex-col h-full"
              >
                {blockOrder.map((blockId, index) => {
                  // Pass correct ID for "Click to Edit" mapping
                  let editId = blockId;
                  if (blockId === "header")
                    editId = s.logo ? "branding" : "company";
                  if (blockId === "parties") editId = "labels";
                  if (blockId === "scope") editId = "labels";
                  if (blockId === "financials") editId = "financials";
                  if (blockId === "footer") editId = "company";
                  if (blockId === "signatures") editId = "labels";
                  if (blockId === "clauses") editId = "sections";

                  return (
                    <DraggableBlock
                      key={blockId}
                      id={blockId}
                      index={index}
                      onEdit={() => onEditSection(editId)}
                      // Special styling for footer to push it down if it's the last item
                      className={
                        blockId === "footer" && index === blockOrder.length - 1
                          ? "mt-auto"
                          : ""
                      }
                    >
                      {renderers[blockId] || (
                        <div className="p-4 text-red-500">
                          Unknown Block: {blockId}
                        </div>
                      )}
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
  );
};

export default LiveContractPreview;
