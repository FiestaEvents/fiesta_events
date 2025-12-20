import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  User,
  Lock,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

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

  // Pre-fill form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
      });
    }
  }, [user, reset]);

  // Helper to safely display role name
  const getRoleName = () => {
    if (user?.roleId?.name) return user.roleId.name;
    if (user?.role) {
      return typeof user.role === 'object' ? user.role.name : user.role;
    }
    return "User";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 text-center">
        <div
          className={`w-32 h-32 rounded-full mx-auto border-4 overflow-hidden mb-4 ${
            darkMode ? "border-gray-700" : "border-white shadow-lg"
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
        <h3 className="font-bold text-xl dark:text-white">{user?.name}</h3>
        <p className="text-sm text-gray-500">{user?.email}</p>
        
        <div className="mt-2 flex justify-center">
          <Badge variant="purple">
            {getRoleName()}
          </Badge>
        </div>
      </div>

      <div className="lg:col-span-2">
        <Card title={t("venueSettings.personal.title")} darkMode={darkMode}>
          <div className="p-6 space-y-5">
            <Input
              label={t("venueSettings.personal.fields.fullName")}
              {...register("name", { required: "Name is required" })}
              error={errors.name?.message}
              darkMode={darkMode}
            />
            <Input
              label={t("venueSettings.personal.fields.phone")}
              {...register("phone")}
              darkMode={darkMode}
            />
            <Input
              label={t("venueSettings.personal.fields.email")}
              value={user?.email || ""}
              disabled
              className="opacity-60"
              darkMode={darkMode}
            />
            <Input
              label={t("venueSettings.personal.fields.avatar")}
              {...register("avatar")}
              placeholder="https://example.com/avatar.jpg"
              darkMode={darkMode}
            />
                { /* Recommendation Link */}
              <p className="mt-2 text-xs text-gray-500">
                Need an avatar? Try{" "}
                <a
                  href="https://avatar-placeholder.iran.liara.run/avatars"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-600 underline"
                >
                  avatar-placeholder.iran.liara.run
                </a>
              </p>
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSubmit(onSave)}
                loading={saving}
                icon={Save}
                darkMode={darkMode}
              >
                {t("venueSettings.common.saveChanges")}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const SecurityTab = ({ onSave, saving, t, darkMode }) => {
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const toggle = (field) => setShowPwd((p) => ({ ...p, [field]: !p[field] }));

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error(t("venueSettings.validation.passwordMismatch") || "Passwords do not match");
      return;
    }
    const success = await onSave(data);
    if (success) reset(); 
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card
        title={t("venueSettings.security.title")}
        description={t("venueSettings.security.description")}
        darkMode={darkMode}
      >
        <div className="p-6 space-y-5">
          <Input
            type={showPwd.current ? "text" : "password"}
            label={t("venueSettings.security.fields.currentPassword")}
            {...register("currentPassword", { required: "Required" })}
            iconRight={showPwd.current ? EyeOff : Eye}
            onIconClick={() => toggle("current")}
            darkMode={darkMode}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type={showPwd.new ? "text" : "password"}
              label={t("venueSettings.security.fields.newPassword")}
              {...register("newPassword", {
                required: "Required",
                minLength: { value: 6, message: "Min 6 chars" },
              })}
              error={errors.newPassword?.message}
              iconRight={showPwd.new ? EyeOff : Eye}
              onIconClick={() => toggle("new")}
              darkMode={darkMode}
            />
            <Input
              type={showPwd.confirm ? "text" : "password"}
              label={t("venueSettings.security.fields.confirmPassword")}
              {...register("confirmPassword", { required: "Required" })}
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
              {t("venueSettings.security.updatePassword")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// --- Main Component ---

const ProfileSettings = ({ darkMode = false }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  // Fetch User Data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authService.getMe();
        const userData = res.data?.user || res.user || res.data || res;
        setUser(userData);
      } catch (err) {
        console.error("Fetch profile error:", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Update Profile Info
  const handleUpdateProfile = async (data) => {
    setSaving(true);
    try {
      // 1. Clean payload: remove empty strings to prevent backend validation issues
      const payload = { ...data };
      if (!payload.avatar) delete payload.avatar;

      // 2. Call API
      const res = await authService.updateProfile(payload);
      const updatedUser = res.data?.user || res.user || res.data;
      
      // 3. Update State
      setUser((prev) => ({ ...prev, ...updatedUser }));
      
      // 4. Success Toast
      toast.success(t("venueSettings.notifications.profileUpdated") || "Profile updated successfully! Refreshing...");
      
      // 5. Notify App & Refresh
      window.dispatchEvent(new Event("profileUpdated"));
      
      // Delay refresh slightly so user sees the success toast
      setTimeout(() => {
        window.location.reload();
      }, 1500);

      return true;
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to update profile";
      toast.error(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async (data) => {
    setSaving(true);
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast.success(t("venueSettings.notifications.passwordChanged") || "Password changed successfully");
      return true;
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Failed to change password";
      toast.error(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <OrbitLoader />
      </div>
    );

  const tabs = [
    { id: "personal", label: t("venueSettings.tabs.personal") || "Personal", icon: User },
    { id: "security", label: t("venueSettings.tabs.security") || "Security", icon: Lock },
  ];

  return (
    <SettingsLayout
      title={t("profileSettings.title") || "My Profile"}
      subtitle={t("profileSettings.subtitle") || "Manage your personal information"}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      darkMode={darkMode}
    >
      {activeTab === "personal" && (
        <PersonalTab
          user={user}
          onSave={handleUpdateProfile}
          saving={saving}
          t={t}
          darkMode={darkMode}
        />
      )}
      {activeTab === "security" && (
        <SecurityTab
          onSave={handleChangePassword}
          saving={saving}
          t={t}
          darkMode={darkMode}
        />
      )}
    </SettingsLayout>
  );
};

export default ProfileSettings;