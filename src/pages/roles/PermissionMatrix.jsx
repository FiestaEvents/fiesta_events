import React from "react";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

// Define the order of modules in the UI
const MODULE_ORDER = [
  "events", "clients", "partners", "supplies", 
  "finance", "payments", "invoices", "contracts",
  "tasks", "reminders", "reports",
  "users", "roles", "venue", "settings"
];

// Define columns
const ACTIONS = [
  { key: "read", labelKey: "roles.matrix.view" },
  { key: "create", labelKey: "roles.matrix.create" },
  { key: "update", labelKey: "roles.matrix.edit" },
  { key: "delete", labelKey: "roles.matrix.delete" },
];

const PermissionMatrix = ({ availablePermissions, selectedIds, onChange, disabled = false }) => {
  const { t } = useTranslation();

  // Helper: Get Permission ID for a specific cell (module + action)
  const getPermissionId = (moduleKey, actionKey) => {
    const group = availablePermissions[moduleKey];
    if (!group) return null;
    // Match exact action OR special scopes (e.g., read.all counts as read)
    const perm = group.find(p => p.action === actionKey || p.name.includes(`${actionKey}.all`));
    return perm ? perm._id : null;
  };

  // Helper: Get ALL valid permission IDs for a specific row (module)
  const getRowPermissionIds = (moduleKey) => {
    const group = availablePermissions[moduleKey];
    if (!group) return [];
    
    // We only want the IDs for the standard CRUD actions in the table
    // (excludes extras like 'export' unless added to columns)
    return ACTIONS.map(action => getPermissionId(moduleKey, action.key)).filter(Boolean);
  };

  // Check if a specific permission ID is selected
  const isSelected = (id) => selectedIds.includes(id);

  // Check if entire row is selected
  const isRowSelected = (moduleKey) => {
    const rowIds = getRowPermissionIds(moduleKey);
    if (rowIds.length === 0) return false;
    return rowIds.every(id => selectedIds.includes(id));
  };

  // Toggle Single Permission
  const togglePermission = (id) => {
    if (disabled || !id) return;
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    onChange(Array.from(newSelection));
  };

  // Toggle Entire Row
  const toggleRow = (moduleKey) => {
    if (disabled) return;
    const rowIds = getRowPermissionIds(moduleKey);
    const allSelected = isRowSelected(moduleKey);
    const newSelection = new Set(selectedIds);

    if (allSelected) {
      // Deselect all in row
      rowIds.forEach(id => newSelection.delete(id));
    } else {
      // Select all in row
      rowIds.forEach(id => newSelection.add(id));
    }
    onChange(Array.from(newSelection));
  };

  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="px-6 py-4 min-w-[200px]">{t("roles.matrix.feature")}</th>
            
            {/* Full Access Column Header */}
            <th className="px-4 py-4 text-center w-32 border-l border-gray-200 dark:border-gray-700 bg-orange-50/50 dark:bg-orange-900/10">
              <span className="font-bold text-orange-700 dark:text-orange-400">
                {t("roles.matrix.fullAccess")}
              </span>
            </th>

            {/* Standard Action Headers */}
            {ACTIONS.map(action => (
              <th key={action.key} className="px-4 py-4 text-center w-24">
                {t(action.labelKey)}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
          {MODULE_ORDER.map((moduleKey) => {
            const rowSelected = isRowSelected(moduleKey);
            const rowHasPermissions = availablePermissions[moduleKey]?.length > 0;

            // If module has no permissions at all (e.g. not seeded), skip or show empty
            if (!rowHasPermissions) return null; 

            return (
              <tr key={moduleKey} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                
                {/* Module Label */}
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white capitalize">
                  {t(`roles.modules.${moduleKey}`)}
                </td>

                {/* Full Access Toggle */}
                <td className="px-4 py-4 text-center border-l border-gray-100 dark:border-gray-800 bg-orange-50/10 dark:bg-orange-900/5">
                  <button
                    type="button"
                    onClick={() => toggleRow(moduleKey)}
                    disabled={disabled}
                    className={`
                      w-5 h-5 rounded mx-auto flex items-center justify-center transition-all duration-200
                      ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                      ${rowSelected 
                        ? "bg-orange-600 border-orange-600 text-white shadow-sm scale-110" 
                        : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500"}
                    `}
                  >
                    {rowSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                  </button>
                </td>

                {/* Individual Action Checkboxes */}
                {ACTIONS.map((action) => {
                  const permId = getPermissionId(moduleKey, action.key);
                  const checked = permId && isSelected(permId);
                  const exists = !!permId;

                  return (
                    <td key={`${moduleKey}-${action.key}`} className="px-4 py-4 text-center">
                      {exists ? (
                        <button
                          type="button"
                          onClick={() => togglePermission(permId)}
                          disabled={disabled}
                          className={`
                            w-5 h-5 rounded mx-auto flex items-center justify-center transition-all duration-200
                            ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                            ${checked 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" 
                              : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-indigo-400"}
                          `}
                        >
                          {checked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                        </button>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 text-lg select-none">
                          -
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PermissionMatrix;