import React, { useState, useEffect } from "react";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";
import { clientService } from "../../api/index";
import { useForm, Controller } from "react-hook-form";
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  FileText, 
  Save,
  Calendar 
} from "lucide-react";

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
      address: "",
      notes: "",
      status: "active",
    },
  });

  // Fetch client data by ID when in edit mode
  useEffect(() => {
    const fetchClientData = async () => {
      if (client?._id) {
        try {
          setLoading(true);
          setError(null);
          console.log("📋 Fetching client data for ID:", client._id);

          const response = await clientService.getById(client._id);
          console.log("✅ Client data response:", response);

          // Handle different response structures
          let clientData = null;

          if (response?.data?.data?.client) {
            clientData = response.data.data.client;
          } else if (response?.data?.client) {
            clientData = response.data.client;
          } else if (response?.client) {
            clientData = response.client;
          } else if (response?.data) {
            clientData = response.data;
          } else {
            clientData = response;
          }

          console.log("👤 Extracted client data:", clientData);

          if (clientData) {
            reset({
              name: clientData.name || "",
              email: clientData.email || "",
              phone: clientData.phone || "",
              company: clientData.company || "",
              address: clientData.address || "",
              notes: clientData.notes || "",
              status: clientData.status || "active",
            });
          } else {
            throw new Error("Client data not found in response");
          }
        } catch (err) {
          console.error("❌ Error fetching client data:", err);
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Failed to load client data. Please try again.";
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      } else {
        // Reset form for new client
        reset({
          name: "",
          email: "",
          phone: "",
          company: "",
          address: "",
          notes: "",
          status: "active",
        });
      }
    };

    if (isOpen) {
      fetchClientData();
    }
  }, [client, reset, isOpen]);

  const onSubmit = async (data) => {
    try {
      setError(null);
      console.log("💾 Saving client data:", data);

      let response;
      if (client?._id) {
        response = await clientService.update(client._id, data);
        console.log("✅ Update response:", response);
      } else {
        response = await clientService.create(data);
        console.log("✅ Create response:", response);
      }

      onSuccess?.(response);
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
      if (e.key === 'Escape') {
        onCancel?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  // Loading state
  if (loading && client?._id) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
              Loading client data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
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
                {client?._id ? "Update client information" : "Create a new client profile"}
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
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-red-800 dark:text-red-200 font-medium">
                      {client?._id ? "Error Loading Client" : "Error Creating Client"}
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
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: "Full name is required" }}
                    render={({ field }) => (
                      <Input
                        label="Full Name"
                        placeholder="e.g. Jane Doe"
                        autoFocus
                        {...field}
                        error={errors.name?.message}
                        required
                        fullWidth
                        icon={User}
                        className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                      />
                    )}
                  />

                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address",
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        label="Email Address"
                        placeholder="name@company.com"
                        type="email"
                        {...field}
                        error={errors.email?.message}
                        required
                        fullWidth
                        icon={Mail}
                        className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                      />
                    )}
                  />

                  <Controller
                    name="phone"
                    control={control}
                    rules={{
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9+()\-\s]{7,20}$/,
                        message: "Please enter a valid phone number",
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        label="Phone Number"
                        placeholder="e.g. +1 (555) 123-4567"
                        {...field}
                        error={errors.phone?.message}
                        required
                        fullWidth
                        icon={Phone}
                        className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                      />
                    )}
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

              {/* Status & Address Section */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
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

                  <Input
                    label="Address"
                    placeholder="Street, city, state, zip code"
                    {...register("address")}
                    fullWidth
                    icon={MapPin}
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  Notes & Comments
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        label="Client Notes"
                        placeholder="Optional notes, comments, or additional information about this client..."
                        rows={4}
                        {...field}
                        fullWidth
                        className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  variant="outline" 
                  onClick={onCancel} 
                  type="button"
                  disabled={isSubmitting}
                  className="min-w-24"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
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