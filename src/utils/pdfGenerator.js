import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import { format } from "date-fns";

export const generateEventSupplyPDF = (event, supplies) => {
  const doc = new jsPDF();

  // --- Header ---
  doc.setFontSize(20);
  doc.setTextColor(234, 88, 12); // Orange color
  doc.text("Event Supplies Report", 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 28);

  // --- Event Details Section ---
  doc.setFillColor(249, 250, 251); // Gray background
  doc.rect(14, 35, 182, 40, "F");
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(event.title || "Untitled Event", 20, 45);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Client: ${event.clientId?.name || "N/A"}`, 20, 52);
  doc.text(`Type: ${event.type || "-"}`, 20, 59);
  
  if (event.startDate) {
    doc.text(`Date: ${format(new Date(event.startDate), "dd/MM/yyyy HH:mm")}`, 100, 52);
  }
  doc.text(`Guests: ${event.guestCount || 0}`, 100, 59);

  // --- Supplies Table ---
  const tableColumn = ["Item Name", "Category", "Quantity", "Unit", "Cost/Unit", "Total Cost"];
  const tableRows = [];

  let totalCost = 0;

  supplies.forEach((supply) => {
    const qty = supply.quantity || supply.currentStock || 0;
    const cost = supply.costPerUnit || 0;
    const lineTotal = qty * cost;
    totalCost += lineTotal;

    const supplyData = [
      supply.name,
      supply.categoryId?.name || "Uncategorized",
      qty,
      supply.unit,
      `${cost.toFixed(2)} TND`,
      `${lineTotal.toFixed(2)} TND`,
    ];
    tableRows.push(supplyData);
  });

  autoTable(doc, {
    startY: 85,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: { fillColor: [234, 88, 12] }, // Orange header
    styles: { fontSize: 9 },
  });

  // --- Footer Total ---
  // Access finalY from the doc object (it's attached by the plugin)
  const finalY = (doc.lastAutoTable?.finalY || 85) + 10;
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Estimated Cost: ${totalCost.toFixed(3)} TND`, 14, finalY);

  // --- Signature Zone ---
  let signatureY = finalY + 40; // Spacing below total
  
  // Check if we need to add a new page for signatures
  if (signatureY > 270) {
    doc.addPage();
    signatureY = 40;
  }

  doc.setDrawColor(150); // Gray lines
  doc.setLineWidth(0.5);
  doc.setFontSize(10);

  // 1. Client Signature (Left)
  doc.line(20, signatureY, 90, signatureY); // Line
  doc.setFont("helvetica", "bold");
  doc.text("Client Signature", 20, signatureY + 6);
  
  // Print Client Name below label if available
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  if (event.clientId?.name) {
      doc.text(`Signed by: ${event.clientId.name}`, 20, signatureY + 12);
  }

  // 2. Venue Owner Signature (Right)
  doc.line(120, signatureY, 190, signatureY); // Line
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text("Venue Representative", 120, signatureY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("Approved by Management", 120, signatureY + 12);

  // Save
  doc.save(`${(event.title || "Event").replace(/\s+/g, "_")}_Supplies.pdf`);
};