import React from "react";
import { Mail, Phone, MapPin, Tag, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

const ClientInfo = ({ client, formatDate }) => {
  const { t } = useTranslation();
  console.log("client", client);
  
  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide dark:text-white">
          {t("clientDetail.sections.contact")}
        </h3>
        <div className="space-y-3">
          {client.email && (
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a
                href={`mailto:${client.email}`}
                className="hover:text-orange-600 transition text-sm break-all dark:hover:text-orange-400"
              >
                {client.email}
              </a>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a
                href={`tel:${client.phone}`}
                className="hover:text-orange-600 transition text-sm dark:hover:text-orange-400"
              >
                {client.phone}
              </a>
            </div>
          )}

          {client.address &&
            Object.values(client.address).some(
              (value) => value && value.toString().trim() !== ""
            ) && (
              <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  {client.address.street && client.address.street.trim() && (
                    <div className="font-medium">{client.address.street}</div>
                  )}
                  <div>
                    {[
                      client.address.city,
                      client.address.state,
                      client.address.zipCode,
                    ]
                      .filter(
                        (value) => value && value.toString().trim() !== ""
                      )
                      .join(", ")}
                  </div>
                  {client.address.country && client.address.country.trim() && (
                    <div>{client.address.country}</div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Notes Section */}
      {client.notes && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide dark:text-white">
            {t("clientDetail.sections.notes")}
          </h3>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
            <p className="text-gray-700 text-sm leading-relaxed dark:text-gray-300">
              {client.notes}
            </p>
          </div>
        </div>
      )}

      {/* Tags */}
      {client.tags && client.tags.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide dark:text-white">
            {t("clientDetail.sections.tags")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {client.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1 dark:bg-blue-900 dark:text-blue-200"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Account Info */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide dark:text-white">
          {t("clientDetail.sections.accountInfo")}
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {t("clientDetail.labels.clientSince")}:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatDate(client.createdAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {t("clientDetail.labels.lastUpdated")}:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatDate(client.updatedAt)}
            </span>
          </div>
          {client.createdBy && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t("clientDetail.labels.createdBy")}:
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