import React, { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Trash2, Plus, X, User, Save, AlertCircle } from "lucide-react";
import { partnerService } from "../../../../api/index";
import { FormInput } from "../../../../components/forms/FormInput";

export const PartnerSelector = () => {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "partners",
  });

  const [dbPartners, setDbPartners] = useState([]);
  const [showBrowser, setShowBrowser] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  const [newPartner, setNewPartner] = useState({
    name: "",
    category: "Catering",
    email: "",
    phone: "",
    priceType: "fixed",
    fixedRate: 0,
    hourlyRate: 0,
  });

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const openBrowser = async () => {
    setShowBrowser(true);
    setViewMode("list");
    setError("");
    if (dbPartners.length === 0) {
      try {
        const res = await partnerService.getAll();
        setDbPartners(res.partners || res.data?.partners || []);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSelect = (p) => {
    append({
      partner: p._id,
      partnerName: p.name,
      service: p.category,
      priceType: p.priceType,
      rate: p.priceType === "hourly" ? p.hourlyRate : p.fixedRate,
      cost: 0,
    });
    setShowBrowser(false);
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleQuickCreate = async (e) => {
    // 🛑 1. STOP EVERYTHING
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // 🛑 2. Validation
    setError("");
    if (!newPartner.name.trim()) return setError("Name is required");
    if (!newPartner.email.trim()) return setError("Email is required");
    if (!validateEmail(newPartner.email))
      return setError("Invalid email format");

    setCreating(true);
    try {
      const payload = {
        ...newPartner,
        hourlyRate:
          newPartner.priceType === "hourly"
            ? Number(newPartner.hourlyRate)
            : undefined,
        fixedRate:
          newPartner.priceType === "fixed"
            ? Number(newPartner.fixedRate)
            : undefined,
      };
      const res = await partnerService.create(payload);
      const created = res.partner || res.data || res.data?.partner;

      setDbPartners((prev) => [...prev, created]);
      handleSelect(created); // Select the new partner

      // Reset Inputs
      setNewPartner({
        name: "",
        category: "Catering",
        email: "",
        phone: "",
        priceType: "fixed",
        fixedRate: 0,
        hourlyRate: 0,
      });
      setViewMode("list");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to create partner";
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Service Partners
          </h3>
          <p className="text-xs text-gray-500">
            External services (Catering, Music, etc)
          </p>
        </div>

        {/* NATIVE HTML BUTTON - Prevents Default Submit */}
        <button
          type="button"
          onClick={() => (!showBrowser ? openBrowser() : setShowBrowser(false))}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold border border-gray-300 rounded hover:bg-gray-100 transition-colors bg-white dark:bg-transparent dark:text-white dark:border-gray-600"
        >
          {showBrowser ? <X size={14} /> : <Plus size={14} />}
          {showBrowser ? "Close" : "Add Partner"}
        </button>
      </div>

      {/* SELECTED LIST */}
      <div className="space-y-3">
        {fields.length === 0 && !showBrowser && (
          <p className="text-sm text-gray-400 italic py-2 border-l-2 border-gray-200 pl-3">
            No partners added.
          </p>
        )}
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <User size={14} />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  {field.partnerName}
                </p>
                <p className="text-xs text-gray-500">
                  {field.service} ({field.priceType})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24">
                <FormInput
                  name={`partners.${index}.rate`}
                  type="number"
                  className="text-xs mb-0"
                  placeholder="Price"
                  // Prevent Enter key in this input from submitting form
                  onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                />
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-2 text-gray-400 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* BROWSER / CREATOR */}
      {showBrowser && (
        <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 animate-in fade-in slide-in-from-top-2">
          {/* Header Toggles - NATIVE BUTTONS */}
          <div className="flex justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`text-xs font-bold px-3 py-1.5 rounded transition-all ${viewMode === "list" ? "bg-white shadow text-black" : "text-gray-500"}`}
              >
                Select Existing
              </button>
              <button
                type="button"
                onClick={() => setViewMode("create")}
                className={`text-xs font-bold px-3 py-1.5 rounded transition-all ${viewMode === "create" ? "bg-orange-100 text-orange-700" : "text-gray-500"}`}
              >
                Create New
              </button>
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {dbPartners.length === 0 ? (
                <p className="text-xs text-center col-span-2 text-gray-400">
                  No partners in database.
                </p>
              ) : (
                dbPartners.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => handleSelect(p)}
                    className="p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:border-orange-500 text-left transition-colors"
                  >
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-[10px] text-gray-500">
                      {p.category} • {p.email || "No email"}
                    </p>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* FORM WRAPPER DIV (Not a form tag) */
            <div
              className="space-y-3"
              onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            >
              {error && (
                <div className="flex items-center gap-2 p-2 bg-red-100 text-red-700 rounded text-xs">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  className="p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Partner Name *"
                  value={newPartner.name}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, name: e.target.value })
                  }
                />

                <select
                  className="p-2 border rounded text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={newPartner.category}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, category: e.target.value })
                  }
                >
                  <option value="catering">Catering</option>
                  <option value="photography">Photography</option>
                  <option value="music">Music</option>
                  <option value="decoration">Decoration</option>
                  <option value="security">Security</option>
                  <option value="driver">Driver</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="other">Other</option>
                </select>

                {/* EMAIL INPUT */}
                <input
                  className="p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  type="email"
                  placeholder="Email Address *"
                  value={newPartner.email}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, email: e.target.value })
                  }
                />

                <input
                  className="p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Phone"
                  value={newPartner.phone}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, phone: e.target.value })
                  }
                />

                <select
                  className="p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={newPartner.priceType}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, priceType: e.target.value })
                  }
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                </select>

                <input
                  className="p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  type="number"
                  placeholder="Rate (TND)"
                  value={
                    newPartner.priceType === "hourly"
                      ? newPartner.hourlyRate
                      : newPartner.fixedRate
                  }
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    newPartner.priceType === "hourly"
                      ? setNewPartner({ ...newPartner, hourlyRate: val })
                      : setNewPartner({ ...newPartner, fixedRate: val });
                  }}
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                {/* NATIVE SAVE BUTTON */}
                <button
                  type="button"
                  onClick={handleQuickCreate}
                  disabled={creating}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded text-sm font-bold hover:bg-orange-700 disabled:opacity-50"
                >
                  {creating ? "Saving..." : "Save & Select"}
                  {!creating && <Save size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
