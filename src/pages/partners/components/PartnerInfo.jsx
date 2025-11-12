import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Calendar,
} from "lucide-react";

const PartnerInfo = ({ partner, formatDate, getCategoryColor }) => {
  return (
    <div className="space-y-6">
      {/* Partner Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-orange-600" />
          Partner Details
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Category
            </p>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium dark:text-white ${getCategoryColor(partner.type || partner.category)}`}
            >
              {(partner.type || partner.category)?.replace("_", " ") || "Other"}
            </span>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Member Since
            </p>
            <p className="text-gray-900 dark:text-white">
              {formatDate(partner.createdAt)}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Last Updated
            </p>
            <p className="text-gray-900 dark:text-white">
              {formatDate(partner.updatedAt)}
            </p>
          </div>

          {partner.specialties && (
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Specialties
              </p>
              <p className="text-gray-900 dark:text-white text-sm">
                {partner.specialties}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-orange-600" />
          Contact Info
        </h3>
        <div className="space-y-3">
          {partner.email && (
            <div className="flex items-start">
              <Mail className="w-4 h-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <a
                href={`mailto:${partner.email}`}
                className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm"
              >
                {partner.email}
              </a>
            </div>
          )}

          {partner.phone && (
            <div className="flex items-start">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <a
                href={`tel:${partner.phone}`}
                className="text-gray-900 dark:text-white text-sm"
              >
                {partner.phone}
              </a>
            </div>
          )}

          {partner.location && (
            <div className="flex items-start">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-900 dark:text-white text-sm">
                {partner.location}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerInfo;
