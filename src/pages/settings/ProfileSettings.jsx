import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { User, Lock, Save, Eye, EyeOff } from "lucide-react";

import { useTheme } from "../../context/ThemeContext"; 
import { authService } from "../../api/index";
import SettingsLayout from "../../components/shared/SettingsLayout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import OrbitLoader from "../../components/common/LoadingSpinner";

// --- Tab Components ---

const PersonalTab = ({ user, onSave, saving, t, darkMode }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      avatar: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
      });
    }
  }, [user, reset]);

  const getRoleName = () => {
    if (user?.roleId?.name) return user.roleId.name;
    if (user?.role) {
      return typeof user.role === "object" ? user.role.name : user.role;
    }
    return "User";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Profile Sidebar (Left) */}
      <div className="lg:col-span-1 text-center">
        <div
          className={`w-32 h-32 rounded-full mx-auto border-4 overflow-hidden mb-4 transition-colors duration-300 ${
            darkMode
              ? "border-gray-700 bg-gray-800 shadow-none"
              : "border-white shadow-lg bg-gray-100"
          }`}
        >
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=random`
            }
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        
        <h3
          className={`font-bold text-xl mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          {user?.name}
        </h3>
        <p
          className={`text-sm mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          {user?.email}
        </p>

        <div className="flex justify-center">
          <Badge variant="purple" size="md">
            {getRoleName()}
          </Badge>
        </div>
      </div>

      {/* Edit Form (Right) */}
      <div className="lg:col-span-2">
        <Card title={t("profileSettings.personal.title")} darkMode={darkMode}>
          <div className="p-6 space-y-5">
            <Input
              label={t("profileSettings.personal.fields.fullName")}
              {...register("name", {
                required: t("profileSettings.validation.required"),
              })}
              error={errors.name?.message}
              darkMode={darkMode}
            />
            <Input
              label={t("profileSettings.personal.fields.phone")}
              {...register("phone")}
              darkMode={darkMode}
            />
            {/* Conditional styling for disabled input in Dark Mode */}
            <Input
              label={t("profileSettings.personal.fields.email")}
              value={user?.email || ""}
              disabled
              className={`opacity-60 cursor-not-allowed ${
                  darkMode ? "bg-gray-700 text-gray-400 border-gray-600" : "bg-gray-100 text-gray-500"
              }`}
              darkMode={darkMode}
            />
            <Input
              label={t("profileSettings.personal.fields.avatar")}
              {...register("avatar")}
              placeholder="https://example.com/avatar.jpg"
              darkMode={darkMode}
            />

            <p
              className={`mt-2 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              {t("profileSettings.personal.avatarHint")}{" "}
              <a
                href="https://avatar-placeholder.iran.liara.run/avatars"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-600 underline"
              >
                avatar-placeholder
              </a>
            </p>

            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSubmit(onSave)}
                loading={saving}
                icon={Save}
                darkMode={darkMode}
              >
                {t("profileSettings.common.saveChanges")}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const SecurityTab = ({ onSave, saving, t, darkMode }) => {
  const [showPwd, setShowPwd] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const toggle = (field) => setShowPwd((p) => ({ ...p, [field]: !p[field] }));

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error(t("profileSettings.validation.passwordMismatch"));
      return;
    }
    const success = await onSave(data);
    if (success) reset();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card
        title={t("profileSettings.security.title")}
        description={t("profileSettings.security.description")}
        darkMode={darkMode}
      >
        <div className="p-6 space-y-5">
          <Input
            type={showPwd.current ? "text" : "password"}
            label={t("profileSettings.security.fields.currentPassword")}
            {...register("currentPassword", {
              required: t("profileSettings.validation.required"),
            })}
            error={errors.currentPassword?.message}
            iconRight={showPwd.current ? EyeOff : Eye}
            onIconClick={() => toggle("current")}
            darkMode={darkMode}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type={showPwd.new ? "text" : "password"}
              label={t("profileSettings.security.fields.newPassword")}
              {...register("newPassword", {
                required: t("profileSettings.validation.required"),
                minLength: {
                  value: 6,
                  message: t("profileSettings.validation.minChar", { min: 6 }),
                },
              })}
              error={errors.newPassword?.message}
              iconRight={showPwd.new ? EyeOff : Eye}
              onIconClick={() => toggle("new")}
              darkMode={darkMode}
            />
            <Input
              type={showPwd.confirm ? "text" : "password"}
              label={t("profileSettings.security.fields.confirmPassword")}
              {...register("confirmPassword", {
                required: t("profileSettings.validation.required"),
              })}
              error={errors.confirmPassword?.message}
              iconRight={showPwd.confirm ? EyeOff : Eye}
              onIconClick={() => toggle("confirm")}
              darkMode={darkMode}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSubmit(onSubmit)}
              loading={saving}
              icon={Lock}
              darkMode={darkMode}
            >
              {t("profileSettings.security.updatePassword")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// --- Main Component ---

const ProfileSettings = () => {
  const { t } = useTranslation();
  
  // FIX: Using the Context definition you provided
  const { theme } = useTheme(); 
  const isDarkMode = theme === 'dark'; // Derive boolean
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authService.getMe();
        const userData = res.data?.user || res.user || res.data || res;
        setUser(userData);
      } catch (err) {
        console.error("Fetch profile error:", err);
        toast.error(t("profileSettings.errors.loadFailed"));
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [t]);

  const handleUpdateProfile = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data };
      if (!payload.avatar) delete payload.avatar;

      const res = await authService.updateProfile(payload);
      const updatedUser = res.data?.user || res.user || res.data;

      setUser((prev) => ({ ...prev, ...updatedUser }));

      toast.success(t("profileSettings.notifications.profileUpdated"));
      window.dispatchEvent(new Event("profileUpdated"));

      setTimeout(() => {
        window.location.reload();
      }, 1500);

      return true;
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || t("profileSettings.errors.updateFailed")
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (data) => {
    setSaving(true);
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast.success(t("profileSettings.notifications.passwordChanged"));
      return true;
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          t("profileSettings.errors.passwordFailed")
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div
        className={`h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
      >
        <OrbitLoader />
      </div>
    );

  const tabs = [
    { id: "personal", label: t("profileSettings.tabs.personal"), icon: User },
    { id: "security", label: t("profileSettings.tabs.security"), icon: Lock },
  ];

  return (
    <SettingsLayout
      title={t("profileSettings.title")}
      subtitle={t("profileSettings.subtitle")}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      darkMode={isDarkMode} 
    >
      {activeTab === "personal" && (
        <PersonalTab
          user={user}
          onSave={handleUpdateProfile}
          saving={saving}
          t={t}
          darkMode={isDarkMode}
        />
      )}
      {activeTab === "security" && (
        <SecurityTab
          onSave={handleChangePassword}
          saving={saving}
          t={t}
          darkMode={isDarkMode}
        />
      )}
    </SettingsLayout>
  );
};

export default ProfileSettings;