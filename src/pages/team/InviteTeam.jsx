import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Copy, Check, ArrowLeft, RotateCcw, Loader2 } from "lucide-react";

import { teamService, roleService } from "../../api/index";
import { usePermission } from "../../hooks/usePermission"; 
import Button from "../../components/common/Button";

const InviteTeam = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Use permission hook
  const canInvite = usePermission("users.create"); 
  
  const [roles, setRoles] = useState([]);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const res = await roleService.getAll(); 
      const rolesList = res.data?.roles || res.roles || res.data || [];
      setRoles(rolesList); 
    } catch (err) {
      console.error(err);
      toast.error(t("team.alerts.loadRolesError") || "Failed to load roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    
    if (!email || !roleId) {
      toast.error(t("venueSettings.validation.required"));
      return;
    }

    setLoading(true);
    setGeneratedLink(null);

    try {
      const res = await teamService.invite({ email, roleId });
      const link = res.data?.invitationLink || res.invitationLink;

      if (link) {
        setGeneratedLink(link);
        toast.success(t("team.alerts.inviteSuccess"));
      } else {
        toast.success(t("team.alerts.sentSuccess") || "Invitation sent via email.");
        navigate("/team");
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Failed to send invitation";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success(t("team.alerts.linkCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setEmail("");
    setRoleId("");
    setGeneratedLink(null);
    setCopied(false);
  };

  if (!canInvite) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">You do not have permission to invite users.</p>
        <Button className="mt-4" onClick={() => navigate("/team")}>
          {t("common.back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate("/team")} 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-400"
          type="button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("team.inviteTitle")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("team.inviteSubtitle")}
          </p>
        </div>
      </div>

      <form onSubmit={handleInvite} className="space-y-6">
        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t("team.emailLabel")}
          </label>
          <input
            type="email"
            required
            disabled={!!generatedLink}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:dark:bg-gray-800 outline-none transition-all placeholder:text-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@example.com"
          />
        </div>

        {/* Role Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t("team.roleLabel")}
          </label>
          <div className="relative">
            <select
              required
              disabled={!!generatedLink || loadingRoles}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:dark:bg-gray-800 outline-none transition-all appearance-none"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
            >
              <option value="" className="dark:bg-gray-800">{loadingRoles ? t("common.loading") : "Select a role..."}</option>
              {roles.map((role) => (
                <option key={role._id || role.id} value={role._id || role.id} className="dark:bg-gray-800">
                  {role.name}
                </option>
              ))}
            </select>
            {/* Arrow Icon */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4">
          {!generatedLink ? (
            <button
              type="submit"
              disabled={loading || loadingRoles}
              className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {t("common.loading")}
                </>
              ) : (
                t("team.sendInvite")
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 py-3 px-6 rounded-xl font-medium transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Send Another Invitation
            </button>
          )}
        </div>
      </form>

      {/* Link Display */}
      {generatedLink && (
        <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-xl border border-green-200 dark:border-green-800">
            <h3 className="text-green-800 dark:text-green-300 font-semibold mb-2 flex items-center gap-2">
              <Check className="w-5 h-5" />
              {t("team.alerts.inviteSuccess")}
            </h3>
            <p className="text-sm text-green-700 dark:text-green-400 mb-4">
              Copy the link below and send it to the team member:
            </p>
            
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={generatedLink} 
                className="w-full p-3 text-sm bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800 rounded-lg text-gray-600 dark:text-gray-300 focus:outline-none select-all"
                onClick={(e) => e.target.select()}
              />
              <button 
                onClick={copyToClipboard}
                className="p-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-green-200 dark:border-green-800 rounded-lg transition-colors group"
                title={t("team.copyLink")}
                type="button"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-green-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteTeam;