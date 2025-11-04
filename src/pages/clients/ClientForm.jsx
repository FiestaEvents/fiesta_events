import React, { useState, useEffect } from "react";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";
import { clientService } from "../../api/index";
import { useForm, Controller } from "react-hook-form";

const ClientForm = ({ client, onSuccess, onCancel }) => {
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

          // Handle different response structures similar to ClientList
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

    fetchClientData();
  }, [client, reset]);

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

      onSuccess?.();
    } catch (err) {
      console.error("❌ Error saving client:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to save client. Please try again.";
      setError(errorMessage);
    }
  };

  // Loading state
  if (loading && client?._id) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Loading client data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-white-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-between">
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
              className="ml-4"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
                  className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                />
              )}
            />

            <Input
              label="Company"
              placeholder="Company or organization"
              {...register("company")}
              fullWidth
              className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>

        {/* Status & Address Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
                    { value: "prospect", label: "Prospect" },
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
              className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>

        {/* Notes Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {client?._id ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                {client?._id ? "Update Client" : "Create Client"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;