import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle, Globe, ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import useToast from "../../hooks/useToast";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

// --- Internal Language Switcher ---
const AuthLanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇹🇳' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find(l => l.code === currentLanguage) || languages[0];
  const isRTL = currentLanguage === 'ar';

  return (
    <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-50`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm border border-orange-100 hover:border-orange-300 rounded-full shadow-sm text-gray-700 transition-all duration-200 hover:shadow-md"
      >
        <Globe className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-medium">{currentLang.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-orange-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isRTL ? 'left-0' : 'right-0'}`}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-start text-sm flex items-center justify-between hover:bg-orange-50 transition-colors ${
                currentLanguage === lang.code ? 'text-orange-600 font-semibold bg-orange-50/50' : 'text-gray-600'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{lang.flag}</span> {lang.name}
              </span>
              {currentLanguage === lang.code && <Check className="w-3 h-3 text-orange-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Login Component ---
const Login = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const { success, apiError } = useToast();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const isRTL = i18n.dir() === "rtl";

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, user, navigate, authLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.email) newErrors.email = t("auth.login.errors.emailRequired");
    if (!formData.password) newErrors.password = t("auth.login.errors.passwordRequired");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await login(formData.email, formData.password);
      success(t("auth.login.success"));
    } catch (err) {
      console.log("err", err);
      apiError(err, t("auth.login.errors.invalidCredentials"));
      setErrors({
        email: t("auth.login.errors.invalidEmail"),
        password: t("auth.login.errors.invalidPassword"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
            <p className="mt-4 text-gray-600">{t("common.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      
      {/* Language Switcher */}
      <AuthLanguageSwitcher />

      <div className="flex-1 flex items-center justify-center p-0 md:p-4 relative z-10">
        
        {/* Animated Background Blob */}
        <div className="hidden md:block absolute inset-0 pointer-events-none">
           <div className={`absolute top-[-10%] ${isRTL ? 'left-[-10%]' : 'right-[-10%]'} w-96 h-96 bg-orange-200/40 rounded-full blur-3xl animate-pulse`}></div>
           <div className={`absolute bottom-[-10%] ${isRTL ? 'right-[-10%]' : 'left-[-10%]'} w-96 h-96 bg-orange-300/30 rounded-full blur-3xl animate-pulse delay-700`}></div>
        </div>

        {/* Login Card */}
        <div className="w-full h-full md:max-w-md md:h-auto bg-white md:rounded-3xl shadow-2xl flex flex-col justify-center relative z-20 border border-white/50 backdrop-blur-xl">
          <div className="px-8 py-10 space-y-8">
            
            {/* Logo */}
            <div className="flex justify-center">
              <img
                src="fiesta logo-01.png"
                alt="Fiesta Logo"
                className="h-16 w-auto object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Title Section - Fixed Alignment */}
            <div className="text-start space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                {t("auth.login.title")}
              </h2>
              <p className="text-gray-500 text-sm font-medium">
                {t("auth.login.subtitle")}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email */}
              <div className="relative">
                <Input
                  label={t("auth.login.emailLabel")}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("auth.login.emailPlaceholder")}
                  required
                  className={`bg-white w-full border-gray-200 focus:bg-white transition-all ${errors.email ? '!border-red-500 focus:!ring-red-200' : ''}`}
               
                  dir="ltr" // Keep input LTR for emails
                />
                {errors.email && (
                  <p className="text-xs text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={12} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <div className="relative">
                  <Input
                    label={t("auth.login.passwordLabel")}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t("auth.login.passwordPlaceholder")}
                    required
                    // Adjust padding for eye icon based on direction
                    className={`bg-white w-full  border-gray-200 focus:bg-white transition-all ${isRTL ? 'pl-10' : 'pr-10'} ${errors.password ? '!border-red-500 focus:!ring-red-200' : ''}`}
             
             />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-[38px] text-gray-400 hover:text-gray-600 transition-colors`}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={12} /> {errors.password}
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center cursor-pointer group select-none">
                  <div className="relative flex items-center">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="w-4 h-4 border-2 border-gray-300 rounded peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all"></div>
                    <Check size={10} className="absolute top-0.5 left-0.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="mx-2 text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                    {t("auth.login.rememberMe")}
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-all"
                >
                  {t("auth.login.forgotPassword")}
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                className="w-full py-3 text-base font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all duration-300"
              >
                {submitting ? t("auth.login.submitting") : t("auth.login.submit")}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center border-t border-gray-100 pt-6">
              <p className="text-sm text-gray-500">
                {t("auth.login.noAccount")}{" "}
                <Link
                  to="/register"
                  className="text-orange-600 hover:text-orange-700 font-bold hover:underline transition-all ml-1"
                >
                  {t("auth.login.signUp")}
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;