import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus, Search, Filter, Eye, Edit, Trash2, Users, Mail, 
 FolderOpen, X, Copy, Check, AlertTriangle
} from "lucide-react"; 

// ✅ API & Permissions
import { teamService } from "../../api/index";
import PermissionGuard from "../../components/auth/PermissionGuard";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Table from "../../components/common/NewTable"; 
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal"; 
import { toast } from "react-hot-toast";

const TeamList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Data State
  const [teamMembers, setTeamMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Interaction State
  const [copiedId, setCopiedId] = useState(null); // Track which row shows "Copied!"
  const [revokeModal, setRevokeModal] = useState({ isOpen: false, id: null, email: "" });

  // Filters (Active)
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localRole, setLocalRole] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Stats
  const activeMembers = teamMembers.filter((m) => m.isActive).length;
  const pendingCount = invitations.length;

  // ==========================================
  // FETCH DATA
  // ==========================================
  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page, limit,
        ...(search.trim() && { search: search.trim() }),
        ...(role !== "all" && { role }),
      };
      
      const res = await teamService.getAll(params);
      const dataPayload = res.data || res; 
      
      if (dataPayload.users) {
        setTeamMembers(dataPayload.users);
        if (dataPayload.pagination) setTotalItems(dataPayload.pagination.total);
      } else if (Array.isArray(dataPayload)) {
        setTeamMembers(dataPayload);
        setTotalItems(dataPayload.length);
      } else {
        setTeamMembers([]);
        setTotalItems(0);
      }
    } catch (err) {
      setError(t("team.errors.loadMembers"));
      setTeamMembers([]);
    } finally {
      setLoading(false);
      setHasInitialLoad(true);
    }
  }, [search, role, page, limit, t]);

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await teamService.getInvitations();
      const dataPayload = res.data || res;
      setInvitations(dataPayload.invitations || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchTeamMembers();
    fetchInvitations();
  }, [fetchTeamMembers, fetchInvitations]);

  // ==========================================
  // HANDLERS
  // ==========================================
  
  const handleRefresh = () => { fetchTeamMembers(); fetchInvitations(); };
  const handleApplyFilters = () => { setRole(localRole); setPage(1); setIsFilterOpen(false); };
  const handleClearFilters = () => { setSearch(""); setRole("all"); setLocalRole("all"); setPage(1); };

  // ✅ 1. Enhanced Resend/Copy Handler
  const handleResendInvite = async (id) => {
    try {
      const res = await teamService.resendInvitation(id);
      const link = res.data?.invitationLink || res.invitationLink;

      if (link) {
        navigator.clipboard.writeText(link);
        toast.success(t("team.alerts.linkCopied") || "Link copied to clipboard!");
        
        // Trigger Animation
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000); // Revert after 2s
      } else {
        toast.success(t("team.alerts.resentSuccess"));
      }
    } catch (err) {
      toast.error(t("team.alerts.resentError"));
    }
  };

  // ✅ 2. Open Revoke Modal
  const openRevokeModal = (id, email) => {
    setRevokeModal({ isOpen: true, id, email });
  };

  // ✅ 3. Confirm Revoke Action
  const handleConfirmRevoke = async () => {
    if (!revokeModal.id) return;
    try {
      await teamService.revokeInvitation(revokeModal.id);
      toast.success(t("team.alerts.revokedSuccess"));
      fetchInvitations();
      setRevokeModal({ isOpen: false, id: null, email: "" });
    } catch (err) {
      toast.error(t("team.alerts.revokedError"));
    }
  };

  // Logic States
  const hasActiveFilters = search.trim() !== "" || role !== "all";
  const showEmptyState = !loading && teamMembers.length === 0 && !hasActiveFilters && hasInitialLoad;
  const showNoResults = !loading && teamMembers.length === 0 && hasActiveFilters && hasInitialLoad;
  const showData = hasInitialLoad && (teamMembers.length > 0 || (loading && totalItems > 0));

  // ==========================================
  // TABLE COLUMNS
  // ==========================================
  
  const invitationColumns = [
    { header: t("team.table.email"), accessor: "email", width: "35%" },
    { 
      header: t("team.table.role"), accessor: "role", width: "20%",
      render: (row) => <Badge variant="purple">{row.roleId?.name || t("common.unknown")}</Badge>
    },
    { 
      header: t("team.table.sentDate"), accessor: "createdAt", width: "20%",
      render: (row) => <span className="text-gray-500 dark:text-gray-400 text-sm font-mono">{new Date(row.createdAt).toLocaleDateString()}</span>
    },
    {
      header: t("team.table.actions"), accessor: "actions", width: "25%", className: "text-center",
      render: (row) => {
        const isCopied = copiedId === row._id;
        
        return (
          <div className="flex gap-2 justify-end">
            <PermissionGuard permission="users.create">
               <Button 
                 size="md" 
                 variant="outline" 
                 onClick={() => handleResendInvite(row._id)} 
                 className={`transition-all duration-300 ${isCopied ? "bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" : ""}`}
                 title={t("team.copyLink")}
               >
                 {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span className="ml-2 font-medium">{t("common.copied") || "Copied!"}</span>
                    </>
                 ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="ml-2 hidden sm:inline">{t("team.copyLink")}</span>
                    </>
                 )}
               </Button>
            </PermissionGuard>
            
            <PermissionGuard permission="users.delete.all">
               <Button 
                 size="md" 
                 variant="danger" 
                 onClick={() => openRevokeModal(row._id, row.email)} 
                 title={t("team.actions.revoke")}
               >
                 <Trash2 className="w-5 h-5" />
               </Button>
            </PermissionGuard>
          </div>
        )
      }
    }
  ];

  const memberColumns = [
    { header: t("team.table.name"), accessor: "name", width: "25%" },
    { header: t("team.table.email"), accessor: "email", width: "30%", render: (row) => <span className="text-gray-600 dark:text-gray-400">{row.email}</span> },
    { 
      header: t("team.table.role"), accessor: "role", width: "15%",
      render: (row) => <Badge variant="info">{row.roleId?.name || row.role?.name || t("common.unknown")}</Badge>
    },
    { 
      header: t("team.table.status"), accessor: "status", width: "15%",
      render: (row) => <Badge color={row.isActive ? "green" : "red"}>{row.isActive ? t("common.active") : t("common.inactive")}</Badge>
    },
    {
      header: t("team.table.actions"), accessor: "actions", width: "15%", className: "text-center",
      render: (row) => (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={() => navigate(`/team/${row._id}/`)} title={t("common.view")}>
            <Eye className="w-4 h-4 text-orange-500" />
          </Button>

          <PermissionGuard permission="users.update.all">
             <Button size="sm" variant="outline" onClick={() => navigate(`/team/${row._id}/edit`)} title={t("common.edit")}>
               <Edit className="w-4 h-4 text-blue-500" />
             </Button>
          </PermissionGuard>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md min-h-[500px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="text-orange-600 w-8 h-8" />
            {t("team.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("team.subtitle")}
            {hasInitialLoad && totalItems > 0 && ` • ${t("clients.toast.showingResults", { count: teamMembers.length, total: totalItems })}`}
          </p>
        </div>

        <div className="flex gap-3">           
            <PermissionGuard permission="users.create">
               <Button variant="primary" onClick={() => navigate("/team/invite")}>
                 <Plus className="w-5 h-5 mr-2 inline-block" />
                 {t("team.invite")}
               </Button>
            </PermissionGuard>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("team.stats.total")}</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{totalItems}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("team.stats.active")}</div>
          <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{activeMembers}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("team.stats.pending")}</div>
          <div className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</div>
        </div>
      </div>

      {/* PENDING INVITATIONS SECTION */}
      {invitations.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-500" />
            {t("team.sections.pending")}
          </h2>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Table
              columns={invitationColumns}
              data={invitations}
              pagination={false}
            />
          </div>
        </div>
      )}

      {/* ACTIVE MEMBERS SECTION & FILTERS */}
      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
           <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
             {t("team.sections.active")}
           </h2>
           
           <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button variant={hasActiveFilters ? "primary" : "outline"} onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center gap-2 transition-all ${isFilterOpen ? "ring-2 ring-orange-500 ring-offset-2" : ""}`}>
                <Filter className="w-4 h-4" />
                {t("clients.filters.advanced") || "Filters"}
              </Button>
              {hasActiveFilters && <Button variant="outline" icon={X} onClick={handleClearFilters} className="text-gray-500">{t("clients.buttons.clear")}</Button>}
           </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                 <Input icon={Search} label={t("team.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white dark:bg-gray-900" />
                 <Select label={t("team.table.role")} value={localRole} onChange={(e) => setLocalRole(e.target.value)} options={[{ value: "all", label: t("team.filters.allRoles") }, { value: "manager", label: "Manager" }, { value: "staff", label: "Staff" }]} className="w-full bg-white dark:bg-gray-900" />
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                 <Button variant="primary" onClick={handleApplyFilters}>{t("clients.buttons.apply")}</Button>
              </div>
            </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col relative">
            {showData && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table
                  columns={memberColumns}
                  data={teamMembers}
                  loading={loading}
                  pagination={true}
                  currentPage={page}
                  pageSize={limit}
                  totalItems={totalItems}
                  totalPages={Math.ceil(totalItems / limit)}
                  onPageChange={setPage}
                  onPageSizeChange={(newSize) => { setLimit(newSize); setPage(1); }}
                  emptyMessage={t("team.noData")}
                />
              </div>
            )}

            {showNoResults && (
              <div className="flex flex-col items-center justify-center flex-1 py-12">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4"><FolderOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" /></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("clients.search.noResults")}</h3>
                <Button onClick={handleClearFilters} variant="outline" icon={X}>{t("clients.buttons.clearAllFilters")}</Button>
              </div>
            )}

            {showEmptyState && (
               <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("team.noData")}</h3>
                  <PermissionGuard permission="users.create">
                     <Button onClick={() => navigate("/team/invite")} variant="primary" icon={<Plus className="size-4" />}>
                       {t("team.invite")}
                     </Button>
                  </PermissionGuard>
               </div>
            )}
        </div>
      </div>

      {/* ✅ Revoke Confirmation Modal */}
      <Modal 
        isOpen={revokeModal.isOpen} 
        onClose={() => setRevokeModal({ isOpen: false, id: null, email: "" })}
        title={t("team.actions.revoke")}
        size="sm"
      >
        <div className="p-6">
           <div className="flex items-start gap-4 mb-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800/50">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-300 mb-1">{t("common.warning")}</h3>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {t("team.alerts.confirmRevoke")}
                </p>
                <p className="text-sm font-medium mt-2 text-gray-900 dark:text-white">{revokeModal.email}</p>
              </div>
           </div>
           
           <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setRevokeModal({ isOpen: false, id: null, email: "" })}>
                {t("common.cancel")}
              </Button>
              <Button variant="danger" icon={Trash2} onClick={handleConfirmRevoke}>
                {t("team.actions.revoke")}
              </Button>
           </div>
        </div>
      </Modal>

    </div>
  );
};

export default TeamList;