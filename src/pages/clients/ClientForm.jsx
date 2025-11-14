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

const ClientForm = ({ client, onSuccess, onCancel, isOpen = true }) => {
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

        // Simplified response handling - use the handleResponse utility from your API
        let clientData = null;

        // Your API service uses handleResponse which returns response.data?.data || response.data
        // So we should get the data directly
        if (response) {
          clientData = response.client;
        }

        if (!clientData) {
          throw new Error("Client data not found in response");
        }

        console.log("👤 Extracted client data:", clientData);

        console.log("clientData", clientData);
        // Format the data for the form
        const formData = {
          name: clientData.name || "",
          email: clientData.email || "",
          phone: clientData.phone || "",
          company: clientData.company || "",
          // Handle address object safely
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

        // Handle abort errors differently
        if (err.name === "AbortError") {
          console.log("Client fetch cancelled");
          return;
        }

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load client data. Please try again.";

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
  }, [client, reset, isOpen]);

  const onSubmit = async (data) => {
    try {
      setError(null);
      console.log("💾 Form data to save:", data);

      // Validate required fields
      if (!data.name.trim()) {
        setError("Full name is required");
        return;
      }

      if (!data.email.trim()) {
        setError("Email is required");
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        setError("Please enter a valid email address");
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
        // Create address object from individual fields
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

      // Check if response indicates success
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
        "Failed to save client. Please try again.";
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
                {client?._id ? "Edit Client" : "Add New Client"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {client?._id
                  ? "Update client information"
                  : "Create a new client profile"}
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
                        ? "Error Loading Client"
                        : "Error Creating Client"}
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
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    defaultValue={client?.name}
                    label="Full Name"
                    placeholder="e.g. Jane Doe"
                    autoFocus
                    {...register("name", {
                      required: "Full name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                    })}
                    error={errors.name?.message}
                    required
                    fullWidth
                    icon={User}
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />

                  <Input
                    label="Email Address"
                    placeholder="name@company.com"
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address",
                      },
                    })}
                    error={errors.email?.message}
                    required
                    fullWidth
                    icon={Mail}
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />

                  <Input
                    label="Phone Number"
                    placeholder="e.g. 12345678"
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9+()\-\s]{7,20}$/,
                        message: "Please enter a valid phone number",
                      },
                    })}
                    error={errors.phone?.message}
                    required
                    fullWidth
                    icon={Phone}
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />

                  <Input
                    label="Company"
                    placeholder="Company or organization"
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
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Street Address"
                    placeholder="123 Main Street"
                    {...register("street")}
                    fullWidth
                    icon={MapPin}
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-600 md:col-span-2"
                  />

                  <Input
                    label="City"
                    placeholder="New York"
                    {...register("city")}
                    fullWidth
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />

                  <Input
                    label="State/Province"
                    placeholder="NY"
                    {...register("state")}
                    fullWidth
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />

                  <Input
                    label="ZIP/Postal Code"
                    placeholder="10001"
                    {...register("zipCode")}
                    fullWidth
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />

                  <Input
                    label="Country"
                    placeholder="United States"
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
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Status"
                        options={[
                          { value: "active", label: "Active" },
                          { value: "inactive", label: "Inactive" },
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
                      label="Client Notes"
                      placeholder="Optional notes, comments, or additional information about this client..."
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
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="min-w-32 flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {client?._id ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {client?._id ? "Update Client" : "Create Client"}
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
