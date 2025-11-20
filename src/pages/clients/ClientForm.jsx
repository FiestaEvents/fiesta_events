import {
  Building2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { clientService } from "../../api/index";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import { useTranslation } from "react-i18next";

const ClientForm = ({ client, onSuccess, onCancel, isOpen = true }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    let isMounted = true;
    const abortController = new AbortController();

    const fetchClientData = async () => {
      if (!client?._id || !isOpen) {
        // Reset form for new client
        if (isMounted) {
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
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        console.log("📋 Fetching client data for ID:", client._id);

        const response = await clientService.getById(client._id);
        console.log("✅ Client data response:", response);

        if (!isMounted) return;

        let clientData = null;

        if (response) {
          clientData = response.client;
        }

        if (!clientData) {
          throw new Error("Client data not found in response");
        }

        console.log("👤 Extracted client data:", clientData);

        // Format the data for the form
        const formData = {
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
        };

        console.log("📝 Form data to reset:", formData);
        reset(formData);
      } catch (err) {
        if (!isMounted) return;

        console.error("❌ Error fetching client data:", err);

        if (err.name === "AbortError") {
          console.log("Client fetch cancelled");
          return;
        }

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          t("clientForm.errors.loading");

        setError(errorMessage);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (isOpen) {
      fetchClientData();
    }

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [client, reset, isOpen, t]);

  const onSubmit = async (data) => {
    try {
      setError(null);
      console.log("💾 Form data to save:", data);

      // Validate required fields
      if (!data.name.trim()) {
        setError(t("clientForm.errors.nameRequired"));
        return;
      }

      if (!data.email.trim()) {
        setError(t("clientForm.errors.emailRequired"));
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        setError(t("clientForm.errors.emailInvalid"));
        return;
      }

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

      console.log("🚀 API data to send:", apiData);

      let response;
      if (client?._id) {
        response = await clientService.update(client._id, apiData);
        console.log("✅ Update response:", response);
      } else {
        response = await clientService.create(apiData);
        console.log("✅ Create response:", response);
      }

      if (response) {
        onSuccess?.(response);
      } else {
        throw new Error("No response from server");
      }
    } catch (err) {
      console.error("❌ Error saving client:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        t("clientForm.errors.saving");
      setError(errorMessage);
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onCancel?.();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {client?._id ? t("clientForm.title.edit") : t("clientForm.title.add")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {client?._id
                  ? t("clientForm.description.edit")
                  : t("clientForm.description.add")}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6">
            {/* Loading State */}
            {loading && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="text-blue-800 dark:text-blue-200">
                    Loading client data...
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-red-800 dark:text-red-200 font-medium">
                      {client?._id
                        ? t("clientForm.errors.loading")
                        : t("clientForm.errors.creating")}
                    </p>
                    <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                      {error}
                    </p>
                  </div>
                  <Button
                    onClick={() => setError(null)}
                    size="sm"
                    variant="outline"
                    className="ml-4 flex-shrink-0"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information Section */}
              <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" />
                  {t("clientForm.sections.personal")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    defaultValue={client?.name}
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
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    type="tel"
                  />

                  <Input
                    label={t("clientForm.fields.company")}
                    placeholder={t("clientForm.placeholders.company")}
                    {...register("company")}
                    fullWidth
                    icon={Building2}
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  {t("clientForm.sections.address")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t("clientForm.fields.street")}
                    placeholder={t("clientForm.placeholders.street")}
                    {...register("street")}
                    fullWidth
                    icon={MapPin}
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-600 md:col-span-2"
                  />

                  <Input
                    label={t("clientForm.fields.city")}
                    placeholder={t("clientForm.placeholders.city")}
                    {...register("city")}
                    fullWidth
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />

                  <Input
                    label={t("clientForm.fields.state")}
                    placeholder={t("clientForm.placeholders.state")}
                    {...register("state")}
                    fullWidth
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />

                  <Input
                    label={t("clientForm.fields.zipCode")}
                    placeholder={t("clientForm.placeholders.zipCode")}
                    {...register("zipCode")}
                    fullWidth
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />

                  <Input
                    label={t("clientForm.fields.country")}
                    placeholder={t("clientForm.placeholders.country")}
                    {...register("country")}
                    fullWidth
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>

              {/* Status & Notes Section */}
              <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
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
                        className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
                      className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 p-4 mt-6 ">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  type="button"
                  disabled={isSubmitting || loading}
                  className="min-w-24"
                >
                  {t("clientForm.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="min-w-32 flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {client?._id ? t("clientForm.buttons.updating") : t("clientForm.buttons.creating")}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {client?._id ? t("clientForm.buttons.update") : t("clientForm.buttons.create")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;