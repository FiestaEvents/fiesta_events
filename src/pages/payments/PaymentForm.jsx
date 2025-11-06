import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { paymentService, eventService, clientService } from "../../api/index";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  DollarSign,
  Calendar,
  CreditCard,
  FileText,
  Users,
} from "lucide-react";

const PaymentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [formData, setFormData] = useState({
    type: "income",
    event: "",
    client: "",
    amount: "",
    method: "cash",
    status: "pending",
    reference: "",
    description: "",
    dueDate: "",
    paidDate: "",
    fees: {
      processingFee: 0,
      platformFee: 0,
      otherFees: 0,
    },
  });

  const [errors, setErrors] = useState({});

  // Fetch payment data if editing
  useEffect(() => {
    if (isEditMode) {
      fetchPayment();
    }
  }, [id, isEditMode]);

  // Fetch events and clients for dropdowns
  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getById(id);
      const payment = response.payment || response;

      setFormData({
        type: payment.type || "income",
        event: payment.event?._id || payment.event || "",
        client: payment.client?._id || payment.client || "",
        amount: payment.amount?.toString() || "",
        method: payment.method || "cash",
        status: payment.status || "pending",
        reference: payment.reference || "",
        description: payment.description || "",
        dueDate: payment.dueDate
          ? new Date(payment.dueDate).toISOString().split("T")[0]
          : "",
        paidDate: payment.paidDate
          ? new Date(payment.paidDate).toISOString().split("T")[0]
          : "",
        fees: {
          processingFee: payment.fees?.processingFee || 0,
          platformFee: payment.fees?.platformFee || 0,
          otherFees: payment.fees?.otherFees || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching payment:", error);
      toast.error(error.message || "Failed to load payment");
      navigate("/payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      const [eventsResponse, clientsResponse] = await Promise.all([
        eventService.getAll(),
        clientService.getAll(),
        console.log("dataaaaa", eventsResponse, clientsResponse),
      ]);

      setEvents(eventsResponse.events || eventsResponse || []);
      setClients(clientsResponse.clients || clientsResponse || []);
    } catch (error) {
      console.error("Error fetching options:", error);
      toast.error("Failed to load form options");
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("fees.")) {
      const feeField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        fees: {
          ...prev.fees,
          [feeField]: parseFloat(value) || 0,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!formData.method) {
      newErrors.method = "Please select a payment method";
    }

    if (!formData.type) {
      newErrors.type = "Please select a payment type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setSaving(true);

      const paymentData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        method: formData.method,
        status: formData.status,
        reference: formData.reference || undefined,
        description: formData.description || undefined,
        dueDate: formData.dueDate || undefined,
        paidDate: formData.paidDate || undefined,
        event: formData.event || undefined,
        client: formData.client || undefined,
        fees: {
          processingFee: parseFloat(formData.fees.processingFee) || 0,
          platformFee: parseFloat(formData.fees.platformFee) || 0,
          otherFees: parseFloat(formData.fees.otherFees) || 0,
        },
      };

      if (isEditMode) {
        await paymentService.update(id, paymentData);
        toast.success("Payment updated successfully");
      } else {
        await paymentService.create(paymentData);
        toast.success("Payment created successfully");
      }

      navigate("/payments");
    } catch (error) {
      console.error("Error saving payment:", error);
      toast.error(error.message || "Failed to save payment");
    } finally {
      setSaving(false);
    }
  };

  const calculateNetAmount = () => {
    const amount = parseFloat(formData.amount) || 0;
    const processingFee = parseFloat(formData.fees.processingFee) || 0;
    const platformFee = parseFloat(formData.fees.platformFee) || 0;
    const otherFees = parseFloat(formData.fees.otherFees) || 0;
    return amount - processingFee - platformFee - otherFees;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("tn-TN", {
      style: "currency",
      currency: "TND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/payments")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-8 h-8" />
              {isEditMode ? "Edit Payment" : "Add Payment"}
            </h1>
            <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
              {isEditMode
                ? "Update payment information"
                : "Record a new payment transaction"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Payment Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                error={errors.type}
                required
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </Select>

              <Input
                label="Amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleChange}
                error={errors.amount}
                placeholder="0.00"
                required
                icon={DollarSign}
              />

              <Select
                label="Payment Method"
                name="method"
                value={formData.method}
                onChange={handleChange}
                error={errors.method}
                required
                icon={CreditCard}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="mobile_payment">Mobile Payment</option>
              </Select>

              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </Select>

              <Input
                label="Reference Number"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="REF-001"
              />

              <div className="md:col-span-2">
                <Input
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the payment"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Related Information */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Related Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Related Event (Optional)"
                name="event"
                value={formData.event}
                onChange={handleChange}
                disabled={loadingOptions}
              >
                <option value="">Select an event</option>
                {events.map((event) => (
                  <option
                    key={event._id || event.id}
                    value={event._id || event.id}
                  >
                    {event.title}
                  </option>
                ))}
              </Select>

              <Select
                label="Client (Optional)"
                name="client"
                value={formData.client}
                onChange={handleChange}
                disabled={loadingOptions}
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option
                    key={client._id || client.id}
                    value={client._id || client.id}
                  >
                    {client.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {/* Dates */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Payment Dates
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Due Date"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
              />

              <Input
                label="Paid Date"
                name="paidDate"
                type="date"
                value={formData.paidDate}
                onChange={handleChange}
              />
            </div>
          </div>
        </Card>

        {/* Fees (Optional) */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Fees & Charges
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Processing Fee"
                name="fees.processingFee"
                type="number"
                step="0.01"
                min="0"
                value={formData.fees.processingFee}
                onChange={handleChange}
                placeholder="0.00"
              />

              <Input
                label="Platform Fee"
                name="fees.platformFee"
                type="number"
                step="0.01"
                min="0"
                value={formData.fees.platformFee}
                onChange={handleChange}
                placeholder="0.00"
              />

              <Input
                label="Other Fees"
                name="fees.otherFees"
                type="number"
                step="0.01"
                min="0"
                value={formData.fees.otherFees}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            {/* Net Amount Display */}
            {formData.amount && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Amount
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(parseFloat(formData.amount) || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Net Amount
                    </p>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(calculateNetAmount())}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <Card>
          <div className="p-6">
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/payments")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={Save}
                loading={saving}
              >
                {isEditMode ? "Update Payment" : "Create Payment"}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default PaymentForm;
