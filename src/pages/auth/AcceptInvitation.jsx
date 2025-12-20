import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Building2, User, ShieldCheck } from "lucide-react";

import { teamService } from "../../api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import OrbitLoader from "../../components/common/LoadingSpinner";

const AcceptInvitation = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();

  const isRTL = i18n.dir() === "rtl";

  // State
  const [token, setToken] = useState("");
  const [details, setDetails] = useState(null); // Stores fetched details
  const [isInvalid, setIsInvalid] = useState(false);
  const [validating, setValidating] = useState(true); // Loading state for initial check
  const [submitting, setSubmitting] = useState(false); // Loading state for form submit
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: ""
  });

  // --- 1. Verify Token on Mount ---
  useEffect(() => {
    const verifyToken = async () => {
      const queryToken = new URLSearchParams(location.search).get("token");
      
      if (!queryToken) {
        setIsInvalid(true);
        setValidating(false);
        return;
      }

      setToken(queryToken);

      try {
        // Call the new validation endpoint
        const res = await teamService.validateInvitation(queryToken);
        const data = res.data || res;
        
        setDetails({
          venueName: data.venueName,
          roleName: data.roleName,
          inviterName: data.inviterName,
          email: data.email
        });
        
        // Auto-fill email (read-only)
        setFormData(prev => ({ ...prev, name: "", email: data.email }));
        
      } catch (error) {
        console.error("Token verification failed:", error);
        setIsInvalid(true);
      } finally {
        setValidating(false);
      }
    };

    verifyToken();
  }, [location]);

  // --- 2. Handlers ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error(t("venueSettings.validation.passwordMismatch"));
    }

    setSubmitting(true);
    try {
      const res = await teamService.acceptInvitation({
        token,
        name: formData.name,
        password: formData.password
      });

      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        if (res.user?.venue?.id) localStorage.setItem("venueId", res.user.venue.id);
        
        if (updateUser) updateUser(res.user);
        toast.success(t("team.alerts.joinSuccess"));
        
        setTimeout(() => {
          window.location.href = "/home"; 
        }, 1000);
      }
    } catch (error) {
      const msg = error.response?.data?.message || t("team.alerts.acceptFailed");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // --- 3. Loading State ---
  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <OrbitLoader />
      </div>
    );
  }

  // --- 4. Invalid State ---
  if (isInvalid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center border border-white/50 backdrop-blur-xl">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("team.invitation.invalidTitle") || "Invalid Invitation"}
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {t("team.invitation.invalidDesc") || "This invitation link is missing, invalid, or has expired."}
          </p>
          <Button onClick={() => navigate("/login")} className="w-full py-3" variant="outline">
            {t("common.back")}
          </Button>
        </div>
      </div>
    );
  }

  // --- 5. Success State ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      
      {/* Background Decor */}
      <div className="hidden md:block absolute inset-0 pointer-events-none">
         <div className={`absolute top-[-10%] ${isRTL ? 'left-[-10%]' : 'right-[-10%]'} w-96 h-96 bg-orange-200/40 rounded-full blur-3xl animate-pulse`}></div>
         <div className={`absolute bottom-[-10%] ${isRTL ? 'right-[-10%]' : 'left-[-10%]'} w-96 h-96 bg-orange-300/30 rounded-full blur-3xl animate-pulse delay-700`}></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col justify-center relative z-20 border border-white/50 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-500">
          <div className="px-8 py-10 space-y-8">
            
            {/* Logo */}
            <div className="flex justify-center">
              <img src="/fiesta logo-01.png" alt="Fiesta Logo" className="h-14 w-auto object-contain" />
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                {t("team.invitation.joinTitle")}
              </h2>
              <p className="text-gray-500 text-sm font-medium">
                {t("team.invitation.joinSubtitle")}
              </p>
            </div>

            {/* Dynamic Invitation Details */}
            {details && (
              <div className="bg-orange-50/50 rounded-xl p-5 border border-orange-100 space-y-4">
                 
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full text-orange-500 shadow-sm">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Venue</p>
                      <p className="text-sm font-semibold text-gray-800">{details.venueName}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full text-orange-500 shadow-sm">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Invited By</p>
                      <p className="text-sm font-semibold text-gray-800">{details.inviterName}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full text-orange-500 shadow-sm">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Role</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {details.roleName}
                      </span>
                    </div>
                 </div>

              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Read-only Email display */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                 <p className="text-xs text-gray-400">Registering as</p>
                 <p className="text-sm font-semibold text-gray-700">{details?.email}</p>
              </div>

              <Input
                label={t("venueSettings.personal.fields.fullName")}
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: John Doe"
                required
                className="bg-white w-full"
              />

              <div className="relative">
                <Input
                  label={t("auth.login.passwordLabel")}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="******"
                  required
                  className={`bg-white w-full ${isRTL ? 'pl-10' : 'pr-10'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-[38px] text-gray-400 hover:text-gray-600 transition-colors`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label={t("venueSettings.security.fields.confirmPassword")}
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="******"
                  required
                  className={`bg-white w-full ${isRTL ? 'pl-10' : 'pr-10'}`}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                className="w-full py-3 text-base font-bold shadow-lg mt-4"
              >
                {t("team.invitation.createAccount")}
              </Button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;