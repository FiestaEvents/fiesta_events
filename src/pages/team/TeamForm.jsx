import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Save, ArrowLeft, Shield, User, Mail, Phone, Lock } from "lucide-react";

import { teamService, roleService } from "../../api/index";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import OrbitLoader from "../../components/common/LoadingSpinner";

const TeamForm = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);

  // Use watch to ensure Select components update correctly when values change
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      roleId: "",
      isActive: "active"
    }
  });

  // Watch values for controlled Select components
  const currentRoleId = watch("roleId");
  const currentStatus = watch("isActive");

  useEffect(() => {
    const init = async () => {
      try {
        const [userRes, rolesRes] = await Promise.all([
          teamService.getById(id),
          roleService.getAll(),
        ]);

        const user = userRes.data?.user || userRes.user;
        const roleList = rolesRes.data?.roles || rolesRes.roles || [];

        setRoles(roleList);

        // Populate Form
        setValue("name", user.name);
        setValue("email", user.email);
        setValue("phone", user.phone);
        
        // Handle Role ID extraction safely
        const roleId = typeof user.roleId === 'object' ? user.roleId._id : user.roleId;
        setValue("roleId", roleId);
        
        setValue("isActive", user.isActive ? "active" : "inactive");
      } catch (err) {
        console.error(err);
        toast.error(t("team.notifications.loadError"));
        navigate("/team");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, navigate, setValue, t]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        name: data.name,
        phone: data.phone,
        roleId: data.roleId,
        isActive: data.isActive === "active",
      };

      await teamService.update(id, payload);
      toast.success(t("team.notifications.updated"));
      navigate("/team");
    } catch (err) {
      toast.error(err.message || t("team.notifications.updateError"));
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

  return (
    <div className="bg-white max-w-5xl mx-auto p-6 md:p-8 dark:bg-gray-900 rounded-lg">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/team")}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("team.form.editTitle")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update team member details and permissions.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Personal Info */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-700">
              <User className="w-5 h-5 text-blue-500" />
              {t("team.form.personalInfo")}
            </h3>
            
            <div className="space-y-5">
              <Input
                label={t("team.form.name")}
                {...register("name", { required: true })}
                error={errors.name && t("venueSettings.validation.required")}
                darkMode
                placeholder="Ex: John Doe"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label={t("team.form.email")}
                  {...register("email")}
                  disabled
                  className="bg-gray-50 dark:bg-gray-900 opacity-70 cursor-not-allowed"
                  icon={Mail}
                  darkMode
                />
                <Input 
                  label={t("team.form.phone")} 
                  {...register("phone")} 
                  icon={Phone}
                  darkMode 
                  placeholder="99 999 999"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Access Control */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6 h-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-700">
                <Shield className="w-5 h-5 text-orange-500" />
                {t("team.form.accessControl")}
              </h3>

              <div className="space-y-5">
                <Select
                  label={t("team.form.role")}
                  value={currentRoleId} // Controlled value
                  {...register("roleId", { required: true })}
                  onChange={(e) => setValue("roleId", e.target.value)}
                  options={roles.map((r) => ({ value: r._id, label: r.name }))}
                  darkMode
                  className="w-full"
                />
                
                <Select
                  label={t("team.form.status")}
                  value={currentStatus} // Controlled value
                  {...register("isActive")}
                  onChange={(e) => setValue("isActive", e.target.value)}
                  options={[
                    { value: "active", label: t("team.form.active") },
                    { value: "inactive", label: t("team.form.inactive") },
                  ]}
                  darkMode
                  className="w-full"
                />
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex gap-3 text-sm text-blue-700 dark:text-blue-300">
                  <Lock className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>Changing the role will immediately update the user's permissions across the platform.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={() => navigate("/team")}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={saving} icon={Save}>
            {t("common.saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TeamForm;