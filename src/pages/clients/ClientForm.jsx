import {
  Building2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

// ✅ Generic Components & Hooks
import { clientService } from "../../api/index";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Modal from "../../components/common/Modal";
import { useToast } from "../../hooks/useToast"; // Updated path

const ClientForm = ({ client, onSuccess, onCancel, isOpen = true }) => {
  const { t } = useTranslation();
  const { showSuccess, apiError } = useToast();
  const [loadingData, setLoadingData] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      notes: "",
      status: "active",
    },
  });

  // Fetch client data by ID when in edit mode
  useEffect(() => {
    if (!isOpen) return;

    const fetchClientData = async () => {
      // If no ID, just reset to empty defaults for creation
      if (!client?._id) {
        reset({
          name: "",
          email: "",
          phone: "",
          company: "",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
          notes: "",
          status: "active",
        });
        return;
      }

      try {
        setLoadingData(true);
        const response = await clientService.getById(client._id);
        const clientData = response?.client || response; // Handle potential response structure variations

        if (!clientData) throw new Error("Client data not found");

        // Format the data for the form
        reset({
          name: clientData.name || "",
          email: clientData.email || "",
          phone: clientData.phone || "",
          company: clientData.company || "",
          street: clientData.address?.street || "",
          city: clientData.address?.city || "",
          state: clientData.address?.state || "",
          zipCode: clientData.address?.zipCode || "",
          country: clientData.address?.country || "",
          notes: clientData.notes || "",
          status: clientData.status || "active",
        });
      } catch (err) {
        apiError(err, t("clientForm.errors.loading"));
        onCancel(); // Close modal on critical load error
      } finally {
        setLoadingData(false);
      }
    };

    fetchClientData();
  }, [client, reset, isOpen, t, apiError, onCancel]);

  const onSubmit = async (data) => {
    try {
      // Format the data for API
      const apiData = {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || "",
        company: data.company?.trim() || "",
        status: data.status,
        notes: data.notes?.trim() || "",
        address: {
          street: data.street?.trim() || "",
          city: data.city?.trim() || "",
          state: data.state?.trim() || "",
          zipCode: data.zipCode?.trim() || "",
          country: data.country?.trim() || "",
        },
      };

      let response;
      if (client?._id) {
        response = await clientService.update(client._id, apiData);
        showSuccess(t("clients.toast.updateSuccess"));
      } else {
        response = await clientService.create(apiData);
        showSuccess(t("clients.toast.createSuccess"));
      }

      if (response) {
        onSuccess?.(response);
      }
    } catch (err) {
      apiError(err, t("clientForm.errors.saving"));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={client?._id ? t("clientForm.title.edit") : t("clientForm.title.add")}
      size="lg"
    >
      {/* Loading State for Edit Mode */}
      {loadingData ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-2" />
          <p className="text-gray-500">{t("clientDetail.loading")}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
              <User className="w-4 h-4 text-orange-500" />
              {t("clientForm.sections.personal")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t("clientForm.fields.name")}
                placeholder={t("clientForm.placeholders.name")}
                autoFocus
                {...register("name", {
                  required: t("clientForm.errors.nameRequired"),
                  minLength: {
                    value: 2,
                    message: t("clientForm.errors.nameMinLength"),
                  },
                })}
                error={errors.name?.message}
                required
                fullWidth
                icon={User}
              />

              <Input
                label={t("clientForm.fields.email")}
                placeholder={t("clientForm.placeholders.email")}
                type="email"
                {...register("email", {
                  required: t("clientForm.errors.emailRequired"),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t("clientForm.errors.emailInvalid"),
                  },
                })}
                error={errors.email?.message}
                required
                fullWidth
                icon={Mail}
              />

              <Input
                label={t("clientForm.fields.phone")}
                placeholder={t("clientForm.placeholders.phone")}
                {...register("phone", {
                  required: t("clientForm.errors.phoneRequired"),
                  pattern: {
                    value: /^[0-9]{8}$/,
                    message: t("clientForm.errors.phoneInvalid"),
                  },
                })}
                onChange={(e) => {
                  const numbersOnly = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 8);
                  e.target.value = numbersOnly;
                  const { onChange } = register("phone");
                  onChange(e);
                }}
                error={errors.phone?.message}
                required
                fullWidth
                icon={Phone}
                type="tel"
              />

              <Input
                label={t("clientForm.fields.company")}
                placeholder={t("clientForm.placeholders.company")}
                {...register("company")}
                fullWidth
                icon={Building2}
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
              <MapPin className="w-4 h-4 text-orange-500" />
              {t("clientForm.sections.address")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label={t("clientForm.fields.street")}
                  placeholder={t("clientForm.placeholders.street")}
                  {...register("street")}
                  fullWidth
                  icon={MapPin}
                />
              </div>

              <Input
                label={t("clientForm.fields.city")}
                placeholder={t("clientForm.placeholders.city")}
                {...register("city")}
                fullWidth
              />

              <Input
                label={t("clientForm.fields.state")}
                placeholder={t("clientForm.placeholders.state")}
                {...register("state")}
                fullWidth
              />

              <Input
                label={t("clientForm.fields.zipCode")}
                placeholder={t("clientForm.placeholders.zipCode")}
                {...register("zipCode")}
                fullWidth
              />

              <Input
                label={t("clientForm.fields.country")}
                placeholder={t("clientForm.placeholders.country")}
                {...register("country")}
                fullWidth
              />
            </div>
          </div>

          {/* Status & Notes Section */}
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
              <FileText className="w-4 h-4 text-orange-500" />
              {t("clientForm.sections.additional")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t("clientForm.fields.status")}
                    options={[
                      { value: "active", label: t("clients.status.active") },
                      { value: "inactive", label: t("clients.status.inactive") },
                    ]}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    fullWidth
                  />
                )}
              />

              <div className="md:col-span-2">
                <Textarea
                  label={t("clientForm.fields.notes")}
                  placeholder={t("clientForm.placeholders.notes")}
                  rows={4}
                  {...register("notes")}
                  fullWidth
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={onCancel}
              type="button"
              disabled={isSubmitting}
            >
              {t("clientForm.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              icon={isSubmitting ? Loader2 : Save}
              className={isSubmitting ? "opacity-80" : ""}
            >
              {isSubmitting
                ? client?._id
                  ? t("clientForm.buttons.updating")
                  : t("clientForm.buttons.creating")
                : client?._id
                ? t("clientForm.buttons.update")
                : t("clientForm.buttons.create")}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ClientForm;