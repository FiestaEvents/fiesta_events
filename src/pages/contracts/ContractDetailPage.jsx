import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Send,
  Copy,
  Trash2,
  Download,
  FileSignature,
  Users,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  PenTool,
  Building2,
  Phone,
  MapPin,
  FileText,
  Scale,
  Receipt,
  Shield,
  FileCheck,
  Mail,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// Services & Utils
import { contractService } from "../../api/index";
import { useToast } from "../../hooks/useToast";
import formatCurrency from "../../utils/formatCurrency";

// Components
import Button from "../../components/common/Button";
import OrbitLoader from "../../components/common/LoadingSpinner";
import ConfirmDialog from "../../components/common/ConfirmDialog";

// --- SUB-COMPONENTS ---

const StatusTracker = ({ currentStatus, t }) => {
  const steps = [
    { id: "draft", label: t("contracts.detail.status.draft"), icon: FileText },
    { id: "sent", label: t("contracts.detail.status.sent"), icon: Send },
    {
      id: "signed",
      label: t("contracts.detail.status.signed"),
      icon: FileCheck,
    },
  ];

  let activeIndex = 0;
  if (["sent", "viewed"].includes(currentStatus)) activeIndex = 1;
  if (currentStatus === "signed") activeIndex = 2;

  const isDead = ["cancelled", "expired"].includes(currentStatus);

  if (isDead) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-700 mb-6">
        <XCircle size={24} />
        <div>
          <h3 className="font-bold uppercase text-sm">
            {t("contracts.detail.tracker.inactiveTitle", {
              status: t(`contracts.detail.status.${currentStatus}`),
            })}
          </h3>
          <p className="text-xs opacity-80">
            {t("contracts.detail.tracker.inactiveDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700 -z-0 rounded-full" />
        {steps.map((step, index) => {
          const isCompleted = index <= activeIndex;
          const isCurrent = index === activeIndex;
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center bg-white dark:bg-gray-800 px-4"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-orange-600 border-orange-600 text-white"
                    : "bg-white border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600"
                }`}
              >
                {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
              </div>
              <span
                className={`mt-2 text-xs font-bold uppercase tracking-wide ${
                  isCurrent ? "text-orange-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DetailCard = ({ title, icon: Icon, children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm ${className}`}
  >
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-2">
      <Icon size={16} className="text-orange-500" />
      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
        {title}
      </h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
      {Icon && <Icon size={14} />}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">
      {value || "-"}
    </span>
  </div>
);

// ============================================
// MAIN PAGE
// ============================================
const ContractDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { showSuccess, apiError, showInfo } = useToast();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: "",
  });

  // Fetch Data
  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const res = await contractService.getById(id);
        const data =
          res.message?.contract || res.data?.contract || res.contract || res;
        setContract(data);
      } catch (err) {
        console.error(err);
        apiError(err, t("contracts.detail.messages.loadError"));
        navigate("/contracts");
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [id, navigate, apiError, t]);

  // Handlers
  const handleAction = async (action) => {
    if (action === "download") {
      handleDownload();
      return;
    }
    if (["delete", "send"].includes(action)) {
      setConfirmDialog({ open: true, action });
      return;
    }
    try {
      setActionLoading(true);
      if (action === "duplicate") {
        const res = await contractService.duplicate(id);
        showSuccess(t("contracts.detail.messages.duplicateSuccess"));
        const newContract =
          res.message?.contract || res.data?.contract || res.contract;
        if (newContract?._id) navigate(`/contracts/${newContract._id}/edit`);
      }
    } catch (err) {
      apiError(err, `Error: ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      showInfo(t("contracts.detail.messages.downloadStart"));
      const response = await contractService.download(id);
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `contract-${contract.contractNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showSuccess(t("contracts.detail.messages.downloadSuccess"));
    } catch (err) {
      apiError(err, "Download failed");
    }
  };

  const handleConfirmAction = async () => {
    const { action } = confirmDialog;
    try {
      setActionLoading(true);
      if (action === "delete") {
        await contractService.archive(id);
        showSuccess(t("contracts.detail.messages.deleteSuccess"));
        navigate("/contracts");
      } else if (action === "send") {
        await contractService.send(id);
        showSuccess(t("contracts.detail.messages.sendSuccess"));
        const res = await contractService.getById(id);
        setContract(
          res.message?.contract || res.data?.contract || res.contract
        );
      }
    } catch (err) {
      apiError(err, "Action failed");
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, action: "" });
    }
  };

  // Formatters
  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString(i18n.language, {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";
  const formatDateTime = (d) =>
    d
      ? new Date(d).toLocaleString(i18n.language, {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <OrbitLoader />
      </div>
    );
  if (!contract) return null;

  const isDraft = contract.status === "draft";
  const isSigned = contract.status === "signed";
  const isCompany = contract.party?.type === "company";
  const isRTL = i18n.dir() === "rtl";

  return (
    <div
      className="min-h-screen bg-white rounded-xl dark:bg-gray-900 font-sans pb-20"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* --- HEADER --- */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/contracts")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft size={20} className={isRTL ? "rotate-180" : ""} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {contract.title}
                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-xs font-mono text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                  {contract.contractNumber}
                </span>
              </h1>
            </div>
          </div>

          {/* ACTIONS BAR */}
          <div className="flex items-center gap-2">
            {isDraft && (
              <>
                <Button
                  size="sm"
                  variant="danger"
                  icon={Trash2}
                  onClick={() => handleAction("delete")}
                  disabled={actionLoading}
                  className="hidden sm:flex"
                >
                  {t("contracts.detail.actions.delete")}
                </Button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />
                <Button
                  size="sm"
                  variant="outline"
                  icon={Edit}
                  onClick={() => navigate(`/contracts/${id}/edit`)}
                >
                  {t("contracts.detail.actions.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  icon={Send}
                  onClick={() => handleAction("send")}
                  loading={actionLoading}
                >
                  {t("contracts.detail.actions.send")}
                </Button>
              </>
            )}

            {!isDraft && !isSigned && (
              <Button
                size="sm"
                variant="success"
                icon={PenTool}
                onClick={() => navigate(`/contracts/${id}/sign`)}
              >
                {t("contracts.detail.actions.sign")}
              </Button>
            )}

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

            <Button
              size="sm"
              variant="outline"
              icon={Copy}
              onClick={() => handleAction("duplicate")}
              title={t("contracts.detail.actions.duplicate")}
            />
            <Button
              size="sm"
              variant="outline"
              icon={Download}
              onClick={() => handleAction("download")}
            >
              {t("contracts.detail.actions.download")}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 1. LIFECYCLE TRACKER */}
        <StatusTracker currentStatus={contract.status} t={t} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT COLUMN: CONTENT --- */}
          <div className="lg:col-span-2 space-y-8">
            {/* PARTY DETAILS */}
            <DetailCard
              title={t("contracts.detail.sections.party")}
              icon={isCompany ? Building2 : Users}
            >
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white ${isCompany ? "bg-blue-500" : "bg-orange-500"}`}
                    >
                      {contract.party?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        {contract.party?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isCompany
                          ? t("common.company")
                          : t("common.individual")}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-400 uppercase block mb-1">
                        {t("contracts.detail.fields.taxId")}
                      </span>
                      <span className="font-mono font-medium text-gray-700 dark:text-gray-200">
                        {contract.party?.identifier}
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-400 uppercase block mb-1">
                        {t("contracts.detail.fields.contact")}
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {contract.party?.representative || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />

                <div className="flex-1 space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Phone size={16} className="text-gray-400" />{" "}
                    {contract.party?.phone}
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Mail size={16} className="text-gray-400" />{" "}
                    {contract.party?.email}
                  </div>
                  <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <span className="flex-1">{contract.party?.address}</span>
                  </div>
                </div>
              </div>
            </DetailCard>

            {/* LOGISTICS */}
            <DetailCard
              title={t("contracts.detail.sections.logistics")}
              icon={Briefcase}
            >
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px] bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1 block">
                    {t("contracts.detail.fields.start")}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatDate(contract.logistics?.startDate)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {t("contracts.detail.fields.from")}{" "}
                      {contract.logistics?.checkInTime}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-[200px] bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800/30">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase mb-1 block">
                    {t("contracts.detail.fields.end")}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatDate(contract.logistics?.endDate)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {t("contracts.detail.fields.until")}{" "}
                      {contract.logistics?.checkOutTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* SERVICES TABLE */}
              <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 font-medium border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th
                        className={`px-4 py-3 w-1/2 ${isRTL ? "text-right" : "text-left"}`}
                      >
                        {t("contracts.detail.fields.description")}
                      </th>
                      <th className="px-4 py-3 text-center">
                        {t("contracts.detail.fields.qty")}
                      </th>
                      <th
                        className={`px-4 py-3 ${isRTL ? "text-left" : "text-right"}`}
                      >
                        {t("contracts.detail.fields.rate")}
                      </th>
                      <th
                        className={`px-4 py-3 bg-gray-100 dark:bg-gray-800 ${isRTL ? "text-left" : "text-right"}`}
                      >
                        {t("contracts.detail.fields.totalHT")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {contract.services?.map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                          {item.description}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-500">
                          {item.quantity}
                        </td>
                        <td
                          className={`px-4 py-3 text-gray-500 ${isRTL ? "text-left" : "text-right"}`}
                        >
                          {formatCurrency(item.rate)}
                        </td>
                        <td
                          className={`px-4 py-3 font-bold bg-gray-50/50 dark:bg-gray-800/50 ${isRTL ? "text-left" : "text-right"}`}
                        >
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DetailCard>

            {/* SIGNATURES */}
            <DetailCard
              title={t("contracts.detail.sections.signatures")}
              icon={FileSignature}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Venue */}
                <div
                  className={`relative p-6 rounded-xl border-2 ${contract.signatures?.venueSignedAt ? "border-green-500 bg-green-50 dark:bg-green-900/10" : "border-dashed border-gray-300 bg-gray-50"}`}
                >
                  <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-4">
                    {t("contracts.detail.signatures.venue")}
                  </p>
                  {contract.signatures?.venueSignedAt ? (
                    <>
                      <div
                        className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} text-green-600`}
                      >
                        <CheckCircle size={24} />
                      </div>
                      <p className="font-serif text-xl text-gray-800 dark:text-gray-200 italic mb-2">
                        {t("contracts.detail.signatures.electronic")}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        {t("contracts.detail.signatures.signedOn")}{" "}
                        {formatDateTime(contract.signatures.venueSignedAt)}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">
                        IP: {contract.signatures.venueSignerIp}
                      </p>
                    </>
                  ) : (
                    <div className="h-20 flex items-center justify-center text-gray-400 italic">
                      {t("contracts.detail.signatures.pending")}
                    </div>
                  )}
                </div>

                {/* Client */}
                <div
                  className={`relative p-6 rounded-xl border-2 ${contract.signatures?.clientSignedAt ? "border-green-500 bg-green-50 dark:bg-green-900/10" : "border-dashed border-gray-300 bg-gray-50"}`}
                >
                  <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-4">
                    {t("contracts.detail.signatures.client")}
                  </p>
                  {contract.signatures?.clientSignedAt ? (
                    <>
                      <div
                        className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} text-green-600`}
                      >
                        <CheckCircle size={24} />
                      </div>
                      <p className="font-serif text-xl text-gray-800 dark:text-gray-200 italic mb-2">
                        {t("contracts.detail.signatures.electronic")}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        {t("contracts.detail.signatures.signedOn")}{" "}
                        {formatDateTime(contract.signatures.clientSignedAt)}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">
                        IP: {contract.signatures.clientSignerIp}
                      </p>
                    </>
                  ) : (
                    <div className="h-20 flex items-center justify-center text-gray-400 italic">
                      {t("contracts.detail.signatures.pending")}
                    </div>
                  )}
                </div>
              </div>
            </DetailCard>
          </div>

          {/* --- RIGHT COLUMN: SIDEBAR --- */}
          <div className="space-y-6">
            {/* FINANCIAL SUMMARY */}
            <div className="sticky top-20">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-white text-gray-900 px-6 py-4 flex items-center justify-between">
                  <span className="font-bold uppercase text-sm tracking-wider">
                    {t("contracts.detail.sections.financial")}
                  </span>
                  <Receipt size={20} className="opacity-50" />
                </div>

                <div className="p-6 space-y-4">
                  <InfoRow
                    label={t("contracts.detail.fields.totalHT")}
                    value={formatCurrency(contract.financials?.amountHT)}
                  />
                  <InfoRow
                    label={`${t("contracts.detail.fields.vat")} (${contract.financials?.vatRate}%)`}
                    value={formatCurrency(contract.financials?.taxAmount)}
                  />
                  <InfoRow
                    label={t("contracts.detail.fields.stamp")}
                    value={formatCurrency(contract.financials?.stampDuty)}
                  />

                  <div className="pt-4 mt-4 border-t-2 border-gray-100 dark:border-gray-700 flex justify-between items-end">
                    <span className="text-gray-500 font-medium">
                      {t("contracts.detail.fields.netTTC")}
                    </span>
                    <span className="text-3xl font-black text-orange-600">
                      {formatCurrency(contract.financials?.totalTTC)}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">
                      {t("contracts.detail.fields.deposit")}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(contract.paymentTerms?.depositAmount)}
                    </span>
                  </div>
                  {contract.paymentTerms?.securityDeposit > 0 && (
                    <div className="flex justify-between text-sm text-orange-600">
                      <span className="flex items-center gap-1">
                        <AlertCircle size={12} />{" "}
                        {t("contracts.detail.fields.security")}
                      </span>
                      <span className="font-bold">
                        {formatCurrency(contract.paymentTerms?.securityDeposit)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* LEGAL SUMMARY */}
              <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-purple-600">
                  <Shield size={18} />
                  <span className="font-bold uppercase text-xs tracking-wide">
                    {t("contracts.detail.sections.legal")}
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-400 text-xs block">
                      {t("contracts.detail.fields.jurisdiction")}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {contract.legal?.jurisdiction}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">
                      {t("contracts.detail.fields.cancellation")}
                    </span>
                    <span className="capitalize font-medium text-gray-900 dark:text-white">
                      {contract.legal?.cancellationPolicy}
                    </span>
                  </div>
                  {contract.legal?.specialConditions && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                      <span className="text-gray-400 text-xs block mb-1">
                        {t("contracts.detail.fields.special")}
                      </span>
                      <p className="text-gray-600 dark:text-gray-300 italic text-xs leading-relaxed">
                        "{contract.legal.specialConditions}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: "" })}
        onConfirm={handleConfirmAction}
        title={
          confirmDialog.action === "delete"
            ? t("contracts.detail.dialog.deleteTitle")
            : t("contracts.detail.dialog.sendTitle")
        }
        message={
          confirmDialog.action === "delete"
            ? t("contracts.detail.dialog.deleteMsg")
            : t("contracts.detail.dialog.sendMsg")
        }
        confirmText={
          confirmDialog.action === "delete"
            ? t("contracts.detail.dialog.confirmDelete")
            : t("contracts.detail.dialog.confirmSend")
        }
        variant={confirmDialog.action === "delete" ? "danger" : "primary"}
      />
    </div>
  );
};

export default ContractDetailPage;
