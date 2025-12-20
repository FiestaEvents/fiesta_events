import React from "react";
import { Mail, Phone, MapPin, Tag, Calendar, User, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

// ✅ Generic Components
import Badge from "../../../components/common/Badge";

const ClientInfo = ({ client, formatDate }) => {
  const { t } = useTranslation();

  // Helper to check if address has meaningful data
  const hasAddress = client.address && 
    Object.values(client.address).some(val => val && String(val).trim() !== "");

  return (
    <div className="space-y-6">
      
      {/* Contact Information */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
          {t("clientDetail.sections.contact")}
        </h3>
        <div className="space-y-3">
          {client.email && (
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 group">
              <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 transition-colors">
                <Mail className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
              </div>
              <a
                href={`mailto:${client.email}`}
                className="hover:text-orange-600 transition text-sm break-all dark:hover:text-orange-400 font-medium"
              >
                {client.email}
              </a>
            </div>
          )}

          {client.phone && (
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 group">
              <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 transition-colors">
                <Phone className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
              </div>
              <a
                href={`tel:${client.phone}`}
                className="hover:text-orange-600 transition text-sm dark:hover:text-orange-400 font-medium"
              >
                {client.phone}
              </a>
            </div>
          )}

          {hasAddress && (
            <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300 group">
              <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 transition-colors">
                <MapPin className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
              </div>
              <div className="text-sm pt-1.5">
                {client.address.street && client.address.street.trim() && (
                  <div className="font-medium text-gray-900 dark:text-white mb-0.5">
                    {client.address.street}
                  </div>
                )}
                <div className="text-gray-500 dark:text-gray-400">
                  {[
                    client.address.city,
                    client.address.state,
                    client.address.zipCode,
                  ]
                    .filter((val) => val && String(val).trim() !== "")
                    .join(", ")}
                </div>
                {client.address.country && client.address.country.trim() && (
                  <div className="text-gray-500 dark:text-gray-400">{client.address.country}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes Section */}
      {client.notes && (
        <div>
          <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
            {t("clientDetail.sections.notes")}
          </h3>
          <div className="p-4 bg-yellow-50/50 rounded-lg border border-yellow-100 dark:bg-gray-700/50 dark:border-gray-600 relative">
            <Info className="w-4 h-4 text-yellow-500 absolute top-4 left-4" />
            <p className="text-gray-700 text-sm leading-relaxed dark:text-gray-300 pl-6 italic">
              "{client.notes}"
            </p>
          </div>
        </div>
      )}

      {/* Tags */}
      {client.tags && client.tags.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
            {t("clientDetail.sections.tags")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {client.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="info" 
                size="sm" 
                rounded="md"
                icon={<Tag className="w-3 h-3" />}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Account Info */}
      <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
        <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">
          {t("clientDetail.sections.accountInfo")}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              {t("clientDetail.labels.clientSince")}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatDate(client.createdAt)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              {t("clientDetail.labels.lastUpdated")}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatDate(client.updatedAt)}
            </span>
          </div>

          {client.createdBy && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                {t("clientDetail.labels.createdBy")}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {client.createdBy.name || "System"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientInfo;