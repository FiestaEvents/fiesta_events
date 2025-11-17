// components/partners/PartnerHeader.jsx
import React from "react";
import { Camera, Edit, Trash2, ArrowLeft, Star } from "lucide-react";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const PartnerHeader = ({
  partner,
  onBack,
  onEdit,
  onDelete,
  getStatusColor,
  getStatusLabel,
  getCategoryColor,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8 dark:bg-gray-800 dark:border-gray-700">
      {/* Action Buttons */}
      <div className="flex justify-between gap-2 mb-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center border border-gray-300 p-1 rounded-lg pr-2 gap-2 text-sm text-gray-600 hover:text-gray-900 transition dark:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Partners
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:bg-blue-50 rounded-lg transition dark:text-gray-400 dark:hover:bg-blue-900 dark:hover:text-white"
            title="Edit Partner"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition dark:text-red-400 dark:hover:bg-red-900"
            title="Delete Partner"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Partner Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
          {getInitials(partner.name) || "?"}
        </div>
        <h1 className="text-xl font-bold text-gray-900 mt-4 dark:text-white">
          {partner.name || "Unnamed Partner"}
        </h1>

        {partner.company && (
          <p className="text-gray-600 flex items-center justify-center gap-2 mt-1 dark:text-gray-400">
            <Camera className="w-4 h-4" />
            {partner.company}
          </p>
        )}

        {/* Status and Category Badges */}
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(partner.status)}`}
          >
            {getStatusLabel(partner.status)}
          </span>
          
          {partner.category && (
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(partner.category)}`}
            >
              {partner.category.replace('_', ' ')}
            </span>
          )}
          
          {partner.rating && (
            <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-300">
              <Star className="w-4 h-4 fill-current" />
              <span>{partner.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerHeader;