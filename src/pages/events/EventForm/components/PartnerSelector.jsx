//src/pages/events/EventForm/components/PartnerSelector.jsx
import {
  Briefcase,
  Clock,
  DollarSign,
  Mail,
  Phone,
  Plus,
  Save,
  Tag,
  User,
  X,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { partnerService } from "../../../../api/index";
import { useToast } from "../../../../hooks/useToast";

// ✅ Generic Components
import Badge from "../../../../components/common/Badge";
import Button from "../../../../components/common/Button";
import Input from "../../../../components/common/Input";
import Select from "../../../../components/common/Select";

const PartnerSelector = ({
  partners,
  selectedPartners,
  onAddPartner,
  onRemovePartner,
  calculateEventHours,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();

  // --- STATE ---
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Quick Create Form State
  const [newPartner, setNewPartner] = useState({
    name: "",
    email: "", // ✅ Added
    phone: "", // ✅ Added
    category: "",
    priceType: "hourly",
    hourlyRate: "",
    fixedRate: "",
    location: "",
  });

  // --- OPTIONS ---
  const categoryOptions = [
    { value: "driver", label: "Driver" },
    { value: "bakery", label: "Bakery" },
    { value: "catering", label: "Catering" },
    { value: "decoration", label: "Decoration" },
    { value: "photography", label: "Photography" },
    { value: "music", label: "Music" },
    { value: "security", label: "Security" },
    { value: "cleaning", label: "Cleaning" },
    { value: "audio_visual", label: "Audio/Visual" },
    { value: "floral", label: "Floral" },
    { value: "entertainment", label: "Entertainment" },
    { value: "hairstyling", label: "Hair Styling" },
    { value: "other", label: "Other" },
  ];

  // --- HANDLERS ---

  const handleSelect = (e) => {
    const partnerId = e.target.value;
    if (!partnerId) return;

    const p = partners.find((x) => x._id === partnerId);
    if (p) {
      addPartnerToEvent(p);
    }
  };

  const addPartnerToEvent = (p) => {
    const hours =
      typeof calculateEventHours === "function" ? calculateEventHours() : 1;
    const rate =
      p.priceType === "hourly" ? p.hourlyRate || 0 : p.fixedRate || 0;
    const cost = p.priceType === "hourly" ? rate * hours : rate;

    onAddPartner({
      partner: p._id,
      partnerName: p.name,
      service: p.category || "Service",
      priceType: p.priceType || "fixed",
      rate: rate,
      hours: p.priceType === "hourly" ? 1 : undefined,
      cost: cost,
      status: "confirmed",
    });
  };

  const handleCreatePartner = async () => {
    // Validation
    if (!newPartner.name.trim()) return showError("Partner Name is required");
    if (!newPartner.email.trim()) return showError("Email is required"); // ✅ Added Validation
    if (!newPartner.phone.trim()) return showError("Phone is required"); // ✅ Added Validation
    if (!newPartner.category) return showError("Category is required");

    const rateCheck =
      newPartner.priceType === "hourly"
        ? newPartner.hourlyRate
        : newPartner.fixedRate;
    if (!rateCheck || parseFloat(rateCheck) <= 0)
      return showError("Valid rate is required");

    try {
      setLoading(true);

      // Construct API Payload
      const payload = {
        name: newPartner.name,
        email: newPartner.email, // ✅ Added
        phone: newPartner.phone, // ✅ Added
        category: newPartner.category,
        priceType: newPartner.priceType,
        location: newPartner.location,
        status: "active",
        hourlyRate:
          newPartner.priceType === "hourly"
            ? parseFloat(newPartner.hourlyRate)
            : undefined,
        fixedRate:
          newPartner.priceType === "fixed"
            ? parseFloat(newPartner.fixedRate)
            : undefined,
      };

      const response = await partnerService.create(payload);
      const createdPartner = response.partner || response.data;

      // Add to event immediately
      addPartnerToEvent(createdPartner);

      // Reset & UI Feedback
      showSuccess(`Partner "${createdPartner.name}" created and added.`);
      setIsCreating(false);
      setNewPartner({
        name: "",
        email: "",
        phone: "",
        category: "",
        priceType: "hourly",
        hourlyRate: "",
        fixedRate: "",
        location: "",
      });
    } catch (error) {
      console.error(error);
      // Display the specific error message from backend if available
      const msg = error.response?.data?.message || "Failed to create partner";
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const availablePartners = partners.filter(
    (p) => !selectedPartners.some((sp) => sp.partner === p._id)
  );

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
      {/* --- Header / Toggle --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100 dark:border-gray-700">
        <h5 className="font-semibold text-gray-900 dark:text-white text-sm">
          {isCreating
            ? t("eventForm.step3.createNewPartner")
            : t("eventForm.step3.selectPartners")}
        </h5>
        <Button
          type="button"
          variant={isCreating ? "outline" : "primary"}
          size="lg"
          icon={isCreating ? <XIcon size={16} /> : <Plus size={16} />}
          onClick={() => setIsCreating(!isCreating)}
          className="text-xs"
        >
          {isCreating ? t("common.cancel") : t("eventForm.step3.createAndAdd")}
        </Button>
      </div>

      {/* --- Main Interaction Area --- */}
      {isCreating ? (
        /* --- QUICK CREATE FORM --- */
        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-600 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <Input
              label={t("eventForm.step3.partnerName")}
              placeholder="e.g. DJ Khaled"
              value={newPartner.name}
              onChange={(e) =>
                setNewPartner({ ...newPartner, name: e.target.value })
              }
              icon={User}
              className="bg-white dark:bg-gray-800 w-full"
            />

            {/* Category */}
            <Select
              label={t("eventForm.step3.category")}
              options={[
                { value: "", label: t("eventForm.step3.selectCategory") },
                ...categoryOptions,
              ]}
              value={newPartner.category}
              onChange={(e) =>
                setNewPartner({ ...newPartner, category: e.target.value })
              }
              icon={Briefcase}
              className="bg-white dark:bg-gray-800 w-full"
            />
          </div>

          {/* ✅ NEW ROW: Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="partner@example.com"
              value={newPartner.email}
              onChange={(e) =>
                setNewPartner({ ...newPartner, email: e.target.value })
              }
              icon={Mail}
              className="bg-white dark:bg-gray-800 w-full"
            />
            <Input
              label={t("eventForm.step3.partnerPhone")}
              type="tel"
              placeholder="12 345 678"
              value={newPartner.phone}
              onChange={(e) =>
                setNewPartner({ ...newPartner, phone: e.target.value })
              }
              icon={Phone}
              className="bg-white dark:bg-gray-800 w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price Type Toggle */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t("eventForm.step3.priceModel")}
              </label>
              <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-600">
                <button
                  type="button"
                  onClick={() =>
                    setNewPartner({ ...newPartner, priceType: "hourly" })
                  }
                  className={`flex-1 py-2 text-xs font-medium rounded transition-colors ${newPartner.priceType === "hourly" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" : "text-gray-500"}`}
                >
                  {t("eventForm.step3.hourly")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNewPartner({ ...newPartner, priceType: "fixed" })
                  }
                  className={`flex-1 py-2 text-xs font-medium rounded transition-colors ${newPartner.priceType === "fixed" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" : "text-gray-500"}`}
                >
                  {t("eventForm.step3.fixed")}
                </button>
              </div>
            </div>

            {/* Rate Input */}
            <div>
              <Input
                label={
                  newPartner.priceType === "hourly"
                    ? t("eventForm.step3.hourlyRate")
                    : t("eventForm.step3.fixedCost")
                }
                type="number"
                placeholder="0.00"
                value={
                  newPartner.priceType === "hourly"
                    ? newPartner.hourlyRate
                    : newPartner.fixedRate
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (newPartner.priceType === "hourly")
                    setNewPartner({ ...newPartner, hourlyRate: val });
                  else setNewPartner({ ...newPartner, fixedRate: val });
                }}
                icon={newPartner.priceType === "hourly" ? Clock : DollarSign}
                className="bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleCreatePartner}
              loading={loading}
              icon={<Save />}
            >
              {t("eventForm.step3.createAndAdd")}
            </Button>
          </div>
        </div>
      ) : (
        /* --- SELECT DROPDOWN --- */
        <Select
          value=""
          onChange={handleSelect}
          options={[
            {
              value: "",
              label:
                t("eventForm.components.partnerSelector.selectPartner") ||
                "Select Partner...",
            },
            ...availablePartners.map((p) => ({
              value: p._id,
              label: `${p.name} - ${p.category} (${p.priceType === "hourly" ? p.hourlyRate + "/hr" : p.fixedRate})`,
            })),
          ]}
        />
      )}

      {/* --- SELECTED LIST --- */}
      <div className="space-y-2.5">
        {selectedPartners.length > 0
          ? selectedPartners.map((p, idx) => (
              <div
                key={idx}
                className="group flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:border-blue-300 dark:hover:border-blue-500 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Tag size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {p.partnerName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {p.service}
                      </span>
                      <Badge
                        variant="secondary"
                        size="sm"
                        className="px-1.5 py-0 text-[10px] uppercase"
                      >
                        {p.priceType}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 pl-2">
                  <div className="text-right">
                    <p className="font-bold text-orange-600 dark:text-orange-400 text-sm">
                      {p.cost.toFixed(2)}{" "}
                      <span className="text-xs text-gray-400 font-normal">
                        TND
                      </span>
                    </p>
                    {p.priceType === "hourly" && (
                      <p className="text-[10px] text-gray-400">{p.rate}/hr</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<XIcon size={16} />}
                    onClick={() => onRemovePartner(idx)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                  ></Button>
                </div>
              </div>
            ))
          : !isCreating && (
              <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                <Briefcase className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  {t("eventForm.step3.noPartnersSelected")}
                </p>
              </div>
            )}
      </div>
    </div>
  );
};

export default PartnerSelector;
