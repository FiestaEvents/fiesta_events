import React, { useEffect } from "react";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";
import { clientService } from "../../api/index";
import { useForm, Controller } from "react-hook-form";

const ClientForm = ({ client, onSuccess, onCancel }) => {
  const {
    register,
    handleSubmit,
    control,
    setError,
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

  useEffect(() => {
    if (client) {
      reset({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        company: client.company || "",
        address: client.address || "",
        notes: client.notes || "",
        status: client.status || "active",
      });
    }
  }, [client, reset]);

  const onSubmit = async (data) => {
    try {
      if (client?._id) {
        await clientService.update(client._id, data);
      } else {
        await clientService.create(data);
      }
      onSuccess?.();
    } catch (err) {
      console.error("Error saving client:", err);
      const serverMessage = err?.response?.data?.message;
      if (serverMessage) setError("root.server", { message: serverMessage });
      else
        setError("root.server", {
          message: "Failed to save client. Please try again.",
        });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              label="Email"
              placeholder="name@email.com"
              type="email"
              {...field}
              error={errors.email?.message}
              required
              fullWidth
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
              label="Phone"
              placeholder="Format xx-xxx-xxx"
              {...field}
              error={errors.phone?.message}
              required
              fullWidth
            />
          )}
        />
        <Input
          label="Company"
          placeholder="Company or organization"
          {...register("company")}
          fullWidth
        />
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
            />
          )}
        />
        <Input
          label="Address"
          placeholder="Street, city, state"
          {...register("address")}
          fullWidth
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Notes"
              placeholder="Optional notes about this client"
              rows={4}
              {...field}
              fullWidth
            />
          )}
        />
      </div>

      {errors.root?.server && (
        <p className="text-sm text-red-600">{errors.root.server.message}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : client
              ? "Update Client"
              : "Create Client"}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;
