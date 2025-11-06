import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { paymentService, eventService, clientService } from "../../api/index";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";
import {
  Save,
  X,
  DollarSign,
  Calendar,
  CreditCard,
  FileText,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";

const PaymentForm = ({ payment, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!payment || Boolean(id);

  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // State management
  const [formData, setFormData] = useState({
    type: "income",
    amount: "",
    method: "cash",
    status: "pending",
    reference: "",
    description: "",
    dueDate: "",
    paidDate: "",
    event: "",
    client: "",
    fees: {
      processingFee: "0",
      platformFee: "0",
      otherFees: "0",
    },
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [errors, setErrors] = useState({});

  // Load payment data for edit mode
  useEffect(() => {
    if (isEditMode) {
      if (payment) {
        loadPaymentData(payment);
      } else if (id) {
        fetchPayment();
      }
    }
  }, [isEditMode, payment, id]);

  // Fetch events and clients for dropdowns
  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getById(id);
      loadPaymentData(response.payment || response);
    } catch (error) {
      console.error("Error fetching payment:", error);
      toast.error(error.message || "Failed to load payment");
      navigate("/payments");
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentData = (paymentData) => {
    setFormData({
      type: paymentData.type || "income",
      amount: paymentData.amount?.toString() || "",
      method: paymentData.method || "cash",
      status: paymentData.status || "pending",
      reference: paymentData.reference || "",
      description: paymentData.description || "",
      dueDate: paymentData.dueDate
        ? new Date(paymentData.dueDate).toISOString().split("T")[0]
        : "",
      paidDate: paymentData.paidDate
        ? new Date(paymentData.paidDate).toISOString().split("T")[0]
        : "",
      event: paymentData.event?._id || paymentData.event || "",
      client: paymentData.client?._id || paymentData.client || "",
      fees: {
        processingFee: paymentData.fees?.processingFee?.toString() || "0",
        platformFee: paymentData.fees?.platformFee?.toString() || "0",
        otherFees: paymentData.fees?.otherFees?.toString() || "0",
      },
    });
  };

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      const [eventsResponse, clientsResponse] = await Promise.all([
        eventService.getAll(),
        clientService.getAll(),
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

  // Step configuration
  const steps = [
    {
      number: 1,
      title: "Basic Info",
      icon: DollarSign,
      color: "orange",
    },
    {
      number: 2,
      title: "Related Info",
      icon: Users,
      color: "orange",
    },
    {
      number: 3,
      title: "Dates",
      icon: Calendar,
      color: "orange",
    },
    {
      number: 4,
      title: "Fees & Review",
      icon: FileText,
      color: "orange",
    },
  ];

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("fees.")) {
      const feeField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        fees: {
          ...prev.fees,
          [feeField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = "Please enter a valid amount";
      }
      if (!formData.method) {
        newErrors.method = "Please select a payment method";
      }
      if (!formData.type) {
        newErrors.type = "Please select a payment type";
      }
    }

    if (step === 2) {
      // No required validations for optional fields
    }

    if (step === 3) {
      // Date validations if needed
      if (formData.paidDate && formData.dueDate) {
        const paidDate = new Date(formData.paidDate);
        const dueDate = new Date(formData.dueDate);
        if (paidDate < dueDate) {
          newErrors.paidDate = "Paid date cannot be before due date";
        }
      }
    }

    if (step === 4) {
      // Fee validations
      const processingFee = parseFloat(formData.fees.processingFee) || 0;
      const platformFee = parseFloat(formData.fees.platformFee) || 0;
      const otherFees = parseFloat(formData.fees.otherFees) || 0;
      const totalAmount = parseFloat(formData.amount) || 0;

      if (processingFee < 0 || platformFee < 0 || otherFees < 0) {
        newErrors.fees = "Fees cannot be negative";
      }

      if (processingFee + platformFee + otherFees > totalAmount) {
        newErrors.fees = "Total fees cannot exceed payment amount";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate all required fields
  const validateAllRequired = () => {
    const newErrors = {};

    // Step 1 validations
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

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast.error("Please fix the errors before proceeding");
    }
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Allow navigation to previous steps or if current step is valid
    if (step < currentStep || validateStep(currentStep)) {
      setCurrentStep(step);
    }
  };

  // Prevent Enter key from submitting form except on last step
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && currentStep < totalSteps) {
      e.preventDefault();
      handleNext(e);
    }
  };

  // Quick update handler
  const handleQuickUpdate = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateAllRequired()) {
      toast.error("Please fix all required fields before updating");
      setCurrentStep(1);
      return;
    }

    await handleSubmit(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // For create mode on non-final steps, validate current step only
    if (!isEditMode && currentStep < totalSteps) {
      if (!validateStep(currentStep)) {
        toast.error("Please fix the errors in the form");
        return;
      }
      handleNext(e);
      return;
    }

    // For final step or edit mode, validate all
    if (!validateAllRequired()) {
      toast.error("Please fix all required fields");
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
        const paymentId = payment?._id || id;
        await paymentService.update(paymentId, paymentData);
        toast.success("Payment updated successfully");
      } else {
        await paymentService.create(paymentData);
        toast.success("Payment created successfully");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/payments");
      }
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

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const StepIcon = step.icon;

          return (
            <React.Fragment key={step.number}>
              <button
                type="button"
                onClick={(e) => handleStepClick(step.number, e)}
                className={`flex flex-col items-center gap-2 transition-all ${
                  isCompleted || isCurrent
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-50"
                }`}
                disabled={!isCompleted && !isCurrent}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-orange-600 text-white"
                      : isCurrent
                        ? "bg-orange-600 text-white ring-4 ring-orange-200 dark:ring-orange-900"
                        : "bg-orange-200 dark:bg-orange-700 text-orange-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <StepIcon className="w-6 h-6" />
                  )}
                </div>
                <div className="text-center">
                  <div
                    className={`text-sm font-medium ${
                      isCompleted || isCurrent
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Step {step.number} of {totalSteps}
                  </div>
                </div>
              </button>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2 mb-8">
                  <div
                    className={`h-full transition-all duration-300 ${
                      step.number < currentStep
                        ? "bg-orange-600"
                        : "bg-transparent"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="p-2 bg-orange-600 rounded-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              Basic Information
            </h3>

            <Select
              label="Payment Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              error={errors.type}
              required
              className="w-full"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full"
              />

              <Select
                label="Payment Method"
                name="method"
                value={formData.method}
                onChange={handleChange}
                error={errors.method}
                required
                icon={CreditCard}
                className="w-full"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="mobile_payment">Mobile Payment</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full"
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
                className="w-full"
              />
            </div>

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of the payment..."
              maxLength={500}
              className="w-full dark:bg-gray-800"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              Related Information
              <span className="text-sm text-gray-500 dark:text-gray-400 font-normal ml-auto">
                Optional
              </span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <Select
                label="Related Event"
                name="event"
                value={formData.event}
                onChange={handleChange}
                disabled={loadingOptions}
                className="w-full"
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
                label="Client"
                name="client"
                value={formData.client}
                onChange={handleChange}
                disabled={loadingOptions}
                className="w-full"
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
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              Payment Dates
              <span className="text-sm text-gray-500 dark:text-gray-400 font-normal ml-auto">
                Optional
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Due Date"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full"
              />

              <Input
                label="Paid Date"
                name="paidDate"
                type="date"
                value={formData.paidDate}
                onChange={handleChange}
                error={errors.paidDate}
                className="w-full"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="p-2 bg-orange-600 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              Fees & Review
              <span className="text-sm text-gray-500 dark:text-gray-400 font-normal ml-auto">
                Optional
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Processing Fee"
                name="fees.processingFee"
                type="number"
                step="0.01"
                min="0"
                value={formData.fees.processingFee}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full"
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
                className="w-full"
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
                className="w-full"
              />
            </div>

            {errors.fees && (
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.fees}</p>
            )}

            {/* Summary */}
            {formData.amount && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
                  Payment Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(formData.amount) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Processing Fee:</span>
                    <span className="text-red-600 dark:text-red-400">-{formatCurrency(parseFloat(formData.fees.processingFee) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Platform Fee:</span>
                    <span className="text-red-600 dark:text-red-400">-{formatCurrency(parseFloat(formData.fees.platformFee) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Other Fees:</span>
                    <span className="text-red-600 dark:text-red-400">-{formatCurrency(parseFloat(formData.fees.otherFees) || 0)}</span>
                  </div>
                  <div className="border-t border-blue-200 dark:border-blue-700 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-blue-900 dark:text-blue-300">Net Amount:</span>
                      <span className="text-blue-600 dark:text-blue-400">{formatCurrency(calculateNetAmount())}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md">
      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="space-y-6"
      >
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <div className="min-h-[400px]">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="variant"
                onClick={handlePrevious}
                disabled={saving}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || (() => navigate("/payments"))}
              disabled={saving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>

            {/* Quick Update button - only show in edit mode and not on last step */}
            {isEditMode && currentStep < totalSteps && (
              <Button
                type="button"
                variant="outline"
                onClick={handleQuickUpdate}
                loading={saving}
                disabled={saving}
                className="bg-orange-500 text-white dark:bg-orange-600 dark:hover:bg-orange-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Update Now
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                disabled={saving}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? "Update Payment" : "Create Payment"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;