// src/pages/contracts/ContractDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Edit, Send, Copy, Trash2, Archive, Download, Mail, MoreHorizontal,
  FileSignature, Users, Briefcase, Calendar, Clock, CheckCircle,
  XCircle, Eye, AlertTriangle, PenTool, Building2, Phone, MapPin, FileText, Scale
} from "lucide-react";
import { useTranslation } from "react-i18next";

// Services
import { contractService } from "../../api/index";

// Components
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmDialog from "../../components/common/ConfirmDialog";

// Hooks & Utils
import { useToast } from "../../hooks/useToast";
import formatCurrency from "../../utils/formatCurrency";

// ============================================
// STATUS CONFIG
// ============================================
const statusConfig = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300", icon: FileText },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Send },
  viewed: { label: "Viewed", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: Eye },
  signed: { label: "Signed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  expired: { label: "Expired", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

// ============================================
// INFO CARD
// ============================================
const InfoCard = ({ icon: Icon, label, value, subValue, iconColor = "text-gray-400" }) => (
  <div className="flex items-start gap-3">
    <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700 ${iconColor}`}>
      <Icon size={18} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mb-0.5">{label}</p>
      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate" title={value}>{value || "-"}</p>
      {subValue && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subValue}</p>}
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
const ContractDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const { showSuccess, apiError } = useToast();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: "" });
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch Contract
  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const res = await contractService.getById(id);
        // Handle nested response structure safely
        const data = res.data || res;
        setContract(data.contract || data);
      } catch (err) {
        console.error(err);
        apiError(err, "Failed to load contract");
        navigate("/contracts");
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [id, navigate, apiError]);

  // Handlers
  const handleAction = async (action) => {
    setMenuOpen(false);
    if (["delete", "send", "archive"].includes(action)) {
      setConfirmDialog({ open: true, action });
      return;
    }

    try {
      setActionLoading(true);
      if (action === "duplicate") {
        const res = await contractService.duplicate(id);
        showSuccess("Contract duplicated");
        const newId = res.data?.contract?._id || res.contract?._id;
        navigate(`/contracts/${newId}/edit`);
      }
    } catch (err) {
      apiError(err, `Failed to ${action} contract`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    const { action } = confirmDialog;
    try {
      setActionLoading(true);
      if (action === "delete") {
        await contractService.delete(id);
        showSuccess("Contract deleted");
        navigate("/contracts");
      } else if (action === "send") {
        await contractService.send(id);
        showSuccess("Contract sent for signing");
        // Refresh data
        const res = await contractService.getById(id);
        const data = res.data || res;
        setContract(data.contract || data);
      } else if (action === "archive") {
        await contractService.archive(id);
        showSuccess("Contract archived");
        navigate("/contracts");
      }
    } catch (err) {
      apiError(err, `Failed to ${action} contract`);
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, action: "" });
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";
  const formatDateTime = (d) => d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: '2-digit', minute:'2-digit' }) : "-";

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!contract) return null;

  const status = statusConfig[contract.status] || statusConfig.draft;
  const StatusIcon = status.icon;
  
  // Determine Party Type & Icon
  const isCompany = contract.party?.type === 'company';
  const PartyIcon = isCompany ? Building2 : Users;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/contracts")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {contract.title}
              </h1>
              <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${status.color}`}>
                <StatusIcon size={14} />
                {status.label}
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-mono">
              {contract.contractNumber} • Created {formatDate(contract.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {contract.status === "draft" && (
            <>
              <Button variant="outline" icon={Edit} onClick={() => navigate(`/contracts/${id}/edit`)}>
                Edit
              </Button>
              <Button variant="primary" icon={Send} onClick={() => handleAction("send")} loading={actionLoading}>
                Send
              </Button>
            </>
          )}
          {["sent", "viewed"].includes(contract.status) && (
            <Button variant="primary" icon={PenTool} onClick={() => navigate(`/contracts/${id}/sign`)}>
              Sign
            </Button>
          )}
          
          <div className="relative">
            <Button variant="ghost" icon={MoreHorizontal} onClick={() => setMenuOpen(!menuOpen)} />
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20 overflow-hidden">
                  <button onClick={() => handleAction("duplicate")} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Copy size={14} /> Duplicate
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Download size={14} /> Download PDF
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  <button onClick={() => handleAction("archive")} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Archive size={14} /> Archive
                  </button>
                  {contract.status === "draft" && (
                    <button onClick={() => handleAction("delete")} className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600">
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Party Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PartyIcon size={18} className="text-orange-500" />
              {contract.party?.type === 'company' ? "Company Details" : "Individual Details"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
              <InfoCard 
                icon={PartyIcon} 
                label={contract.party?.type === 'company' ? "Company Name" : "Full Name"} 
                value={contract.party?.name} 
                iconColor="text-orange-500" 
              />
              <InfoCard 
                icon={FileText} 
                label={contract.party?.type === 'company' ? "Matricule Fiscale" : "CIN / ID"} 
                value={contract.party?.identifier} 
                iconColor="text-blue-500" 
              />
              <InfoCard 
                icon={Mail} 
                label="Email" 
                value={contract.party?.email} 
                iconColor="text-purple-500" 
              />
              <InfoCard 
                icon={Phone} 
                label="Phone" 
                value={contract.party?.phone} 
                iconColor="text-green-500" 
              />
              {contract.party?.address && (
                <div className="md:col-span-2">
                   <InfoCard icon={MapPin} label="Address" value={contract.party.address} iconColor="text-red-500" />
                </div>
              )}
            </div>
          </div>

          {/* Logistics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-blue-500" /> Logistics & Schedule
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <p className="text-xs uppercase text-gray-500 mb-1">Start Date</p>
                  <p className="font-bold text-gray-900 dark:text-white">{formatDate(contract.logistics?.startDate)}</p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                     <Clock size={12}/> Check-in: {contract.logistics?.checkInTime || "10:00"}
                  </p>
               </div>
               <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <p className="text-xs uppercase text-gray-500 mb-1">End Date</p>
                  <p className="font-bold text-gray-900 dark:text-white">{formatDate(contract.logistics?.endDate)}</p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                     <Clock size={12}/> Check-out: {contract.logistics?.checkOutTime || "00:00"}
                  </p>
               </div>
            </div>
          </div>

          {/* Legal Clauses */}
          {contract.legal && (
             <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
               <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                 <Scale size={18} className="text-purple-500" /> Legal Clauses
               </h2>
               <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                     <span className="text-gray-500">Jurisdiction</span>
                     <span className="font-medium text-gray-900 dark:text-white">{contract.legal.jurisdiction}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                     <span className="text-gray-500">Cancellation Policy</span>
                     <span className="font-medium capitalize text-gray-900 dark:text-white">{contract.legal.cancellationPolicy}</span>
                  </div>
                  {contract.legal.specialConditions && (
                    <div className="pt-2">
                       <span className="block text-gray-500 mb-1">Special Conditions</span>
                       <p className="p-3 bg-gray-50 dark:bg-gray-900 rounded text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                          {contract.legal.specialConditions}
                       </p>
                    </div>
                  )}
               </div>
             </div>
          )}

          {/* Signatures */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
               <FileSignature size={18} className="text-green-500" /> Signatures
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Venue Representative</p>
                {contract.signatures?.venueSignedAt ? (
                  <div>
                    <p className="font-semibold text-green-600 flex items-center gap-1"><CheckCircle size={14}/> Signed</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(contract.signatures.venueSignedAt)}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-sm">Pending signature</p>
                )}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Client / Partner</p>
                {contract.signatures?.clientSignedAt ? (
                  <div>
                    <p className="font-semibold text-green-600 flex items-center gap-1"><CheckCircle size={14}/> Signed</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(contract.signatures.clientSignedAt)}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-sm">Pending signature</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FINANCIAL SUMMARY */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
               <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Financial Breakdown</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Amount HT</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(contract.financials?.amountHT)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">TVA ({contract.financials?.vatRate}%)</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(contract.financials?.taxAmount)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Timbre Fiscal</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(contract.financials?.stampDuty)}</span>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-white">Total TTC</span>
                <span className="text-2xl font-bold text-orange-600">{formatCurrency(contract.financials?.totalTTC)}</span>
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/10 p-4 border-t border-orange-100 dark:border-orange-900/20">
               <div className="flex justify-between text-sm text-orange-800 dark:text-orange-300 mb-2">
                  <span>Deposit (Avance)</span>
                  <span className="font-medium">{formatCurrency(contract.paymentTerms?.depositAmount)}</span>
               </div>
               <div className="flex justify-between text-sm text-orange-800 dark:text-orange-300">
                  <span>Security (Caution)</span>
                  <span className="font-medium">{formatCurrency(contract.paymentTerms?.securityDeposit)}</span>
               </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Activity</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                <div>
                   <p className="text-sm text-gray-900 dark:text-white font-medium">Contract Created</p>
                   <p className="text-xs text-gray-500">{formatDateTime(contract.createdAt)}</p>
                </div>
              </div>
              {contract.sentAt && (
                <div className="flex gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <div>
                     <p className="text-sm text-gray-900 dark:text-white font-medium">Sent to Client</p>
                     <p className="text-xs text-gray-500">{formatDateTime(contract.sentAt)}</p>
                  </div>
                </div>
              )}
              {contract.viewedAt && (
                <div className="flex gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  <div>
                     <p className="text-sm text-gray-900 dark:text-white font-medium">Viewed by Client</p>
                     <p className="text-xs text-gray-500">{formatDateTime(contract.viewedAt)}</p>
                  </div>
                </div>
              )}
              {contract.status === 'signed' && (
                <div className="flex gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <div>
                     <p className="text-sm text-gray-900 dark:text-white font-medium">Contract Signed</p>
                     <p className="text-xs text-gray-500">{formatDateTime(contract.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: "" })}
        onConfirm={handleConfirmAction}
        title={
          confirmDialog.action === "delete" ? "Delete Contract" :
          confirmDialog.action === "send" ? "Send Contract" : "Archive Contract"
        }
        message={
          confirmDialog.action === "delete" ? "Are you sure you want to delete this contract? This action cannot be undone." :
          confirmDialog.action === "send" ? "Send this contract for signing? The recipient will receive an email." :
          "Archive this contract? It will be moved to the archive."
        }
        confirmText={confirmDialog.action === "delete" ? "Delete" : confirmDialog.action === "send" ? "Send" : "Archive"}
        variant={confirmDialog.action === "delete" ? "danger" : "primary"}
      />
    </div>
  );
};

export default ContractDetailPage;