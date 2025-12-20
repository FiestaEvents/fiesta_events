import React, { useMemo } from "react";
import {
  Clock,
  Calendar,
  Edit,
  CheckCircle,
  XCircle,
  Users,
  DollarSign,
  Activity,
  Plus,
  Package,
  TrendingUp,
  FileText
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../../utils/formatCurrency";

const EventActivityTab = ({ event, formatDateTime }) => {
  const { t } = useTranslation();

  // Generate activity timeline from event data
  const timeline = useMemo(() => {
    const items = [];

    // 1. Event Created
    if (event.createdAt) {
      items.push({
        id: "created",
        type: "created",
        title: t("eventActivityTab.activity.created.title"),
        description: t("eventActivityTab.activity.created.description", { eventTitle: event.title }),
        timestamp: event.createdAt,
        icon: Plus,
        color: "info",
      });
    }

    // 2. Client Added
    if (event.clientId?.name) {
      items.push({
        id: "client-added",
        type: "client",
        title: "Client Assigned",
        description: `Event assigned to ${event.clientId.name}`,
        timestamp: event.createdAt,
        icon: Users,
        color: "info",
      });
    }

    // 3. Partners Added
    if (event.partners && event.partners.length > 0) {
      const partnerCost = event.partners.reduce((sum, p) => sum + (p.cost || 0), 0);
      items.push({
        id: "partners",
        type: "partners",
        title: t("eventActivityTab.activity.partners.title"),
        description: `${event.partners.length} partner${event.partners.length > 1 ? 's' : ''} added for ${formatCurrency(partnerCost)}`,
        details: event.partners.map(p => `${p.service || 'Service'}: ${formatCurrency(p.cost || 0)}`),
        timestamp: event.createdAt,
        icon: Users,
        color: "purple",
      });
    }

    // 4. Pricing Set/Updated
    if (event.pricing?.totalPriceAfterTax || event.pricing?.totalAmount) {
      const totalAmount = event.pricing.totalPriceAfterTax || event.pricing.totalAmount;
      const hasDiscount = event.pricing.discount > 0;
      const hasTax = event.pricing.taxRate > 0;
      
      let pricingDetails = [];
      if (event.pricing.basePrice) {
        pricingDetails.push(`Base Price: ${formatCurrency(event.pricing.basePrice)}`);
      }
      if (event.pricing.additionalServices?.length > 0) {
        pricingDetails.push(`${event.pricing.additionalServices.length} additional services`);
      }
      if (hasDiscount) {
        pricingDetails.push(`Discount: ${event.pricing.discountType === 'percentage' ? event.pricing.discount + '%' : formatCurrency(event.pricing.discount)}`);
      }
      if (hasTax) {
        pricingDetails.push(`Tax: ${event.pricing.taxRate}%`);
      }

      items.push({
        id: "pricing",
        type: "pricing",
        title: "Pricing Configured",
        description: `Total amount set to ${formatCurrency(totalAmount)}`,
        details: pricingDetails,
        timestamp: event.updatedAt || event.createdAt,
        icon: DollarSign,
        color: "success",
      });
    }

    // 5. Additional Services Added
    if (event.pricing?.additionalServices && event.pricing.additionalServices.length > 0) {
      const servicesTotal = event.pricing.additionalServices.reduce((sum, s) => sum + (s.price || 0), 0);
      items.push({
        id: "services",
        type: "services",
        title: "Additional Services",
        description: `${event.pricing.additionalServices.length} service${event.pricing.additionalServices.length > 1 ? 's' : ''} added for ${formatCurrency(servicesTotal)}`,
        details: event.pricing.additionalServices.map(s => `${s.name}: ${formatCurrency(s.price || 0)}`),
        timestamp: event.updatedAt || event.createdAt,
        icon: Package,
        color: "info",
      });
    }

    // 6. Status Changes
    if (event.status) {
      const statusMap = {
        confirmed: {
          title: "Event Confirmed",
          description: "Event status changed to confirmed and ready to proceed",
          icon: CheckCircle,
          color: "success",
        },
        "in-progress": {
          title: "Event In Progress",
          description: "Event is currently ongoing",
          icon: Clock,
          color: "purple",
        },
        completed: {
          title: "Event Completed",
          description: "Event has been successfully completed",
          icon: CheckCircle,
          color: "success",
        },
        cancelled: {
          title: "Event Cancelled",
          description: "Event has been cancelled",
          icon: XCircle,
          color: "danger",
        },
      };

      if (statusMap[event.status] && event.status !== "pending") {
        items.push({
          id: `status-${event.status}`,
          type: "status",
          ...statusMap[event.status],
          timestamp: event.updatedAt || event.createdAt,
        });
      }
    }

    // 7. Payment Status
    if (event.paymentSummary) {
      const { totalAmount, paidAmount, status } = event.paymentSummary;
      if (paidAmount > 0) {
        const percentage = totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(0) : 0;
        items.push({
          id: "payment-status",
          type: "payment",
          title: status === 'paid' ? "Payment Completed" : "Payment Received",
          description: `${formatCurrency(paidAmount)} paid (${percentage}% of ${formatCurrency(totalAmount)})`,
          timestamp: event.updatedAt || event.createdAt,
          icon: TrendingUp,
          color: status === 'paid' ? 'success' : 'warning',
        });
      }
    }

    // 8. Description/Notes Added
    if (event.description || event.notes) {
      items.push({
        id: "notes",
        type: "notes",
        title: event.description ? "Event Description Added" : "Notes Added",
        description: event.description || event.notes,
        timestamp: event.createdAt,
        icon: FileText,
        color: "info",
      });
    }

    // 9. General Update (only if significantly later)
    if (event.updatedAt && event.createdAt && 
        new Date(event.updatedAt) - new Date(event.createdAt) > 60000) {
      items.push({
        id: "updated",
        type: "updated",
        title: "Event Updated",
        description: "Event details were modified",
        timestamp: event.updatedAt,
        icon: Edit,
        color: "warning",
      });
    }

    // Sort by timestamp (newest first)
    return items.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }, [event, t]);

  const getColorClasses = (color) => {
    const colors = {
      info: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      success: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      warning: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
      purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      danger: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[color] || colors.info;
  };

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-500" />
          {t("eventActivityTab.title")}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-7">
          Complete event timeline with {timeline.length} activities
        </p>
      </div>

      {timeline.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {t("eventActivityTab.noActivity")}
          </p>
        </div>
      ) : (
        <div className="relative pl-4">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[1.65rem] top-4 bottom-4 w-0.5 bg-gradient-to-b from-orange-200 via-gray-200 to-gray-100 dark:from-orange-800 dark:via-gray-700 dark:to-gray-800"></div>

          {/* Timeline items */}
          <div className="space-y-6">
            {timeline.map((item, index) => {
              const Icon = item.icon;
              const isFirst = index === 0;
              
              return (
                <div key={item.id} className="relative flex gap-6">
                  {/* Icon Circle */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 z-10 ring-4 ring-white dark:ring-gray-900 ${getColorClasses(
                      item.color
                    )} ${isFirst ? 'shadow-lg' : 'shadow-sm'}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content Card */}
                  <div className={`flex-1 bg-white dark:bg-gray-800 border-2 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-all ${
                    isFirst ? 'border-orange-200 dark:border-orange-800/50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">
                        {item.title}
                      </h4>
                      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2 font-medium bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded">
                        {formatDateTime(item.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      {item.description}
                    </p>

                    {/* Additional Details */}
                    {item.details && item.details.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <ul className="space-y-1.5">
                          {item.details.map((detail, idx) => (
                            <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event Metadata Footer */}
      <div className="mt-10 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          {t("eventActivityTab.metadata.title")}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800/30">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide block mb-2">
              {t("eventActivityTab.metadata.created")}
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {formatDateTime(event.createdAt)}
            </span>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/10 rounded-lg p-4 border border-purple-200 dark:border-purple-800/30">
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide block mb-2">
              {t("eventActivityTab.metadata.lastUpdated")}
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {formatDateTime(event.updatedAt)}
            </span>
          </div>
          
          {event._id && (
            <div className="col-span-1 md:col-span-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
                {t("eventActivityTab.metadata.eventId")}
              </span>
              <span className="font-mono text-xs text-gray-600 dark:text-gray-300 break-all">
                {event._id}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventActivityTab;