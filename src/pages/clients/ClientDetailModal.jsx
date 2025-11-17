// ClientDetailModal.jsx
import React, { useState } from "react";
import {
  X,
  Trash2,
  Edit,
  Mail,
  Phone,
  MapPin,
  Building,
  Tag,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { clientService } from "../../api/index";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";

const ClientDetailModal = ({ isOpen, onClose, client, onEdit, refreshData }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError, promise } = useToast();

  if (!isOpen || !client) return null;

  const getStatusColor = (status) => {
    const colors = {
      active: "green",
      inactive: "red",
    };
    return colors[status] || "gray";
  };

  const formatDateLong = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const weekday = d.toLocaleString("en-GB", { weekday: "long" });
    const day = d.getDate();
    const month = d.toLocaleString("en-GB", { month: "long" });
    const year = d.getFullYear();
    return `${weekday}, ${day} ${month} ${year}`;
  };

  const handleDelete = async () => {
    if (!client._id) return;
    
    try {
      setIsDeleting(true);
      await promise(
        clientService.delete(client._id),
        {
          loading: `Deleting ${client.name || "Client"}...`,
          success: `${client.name || "Client"} deleted successfully`,
          error: `Failed to delete ${client.name || "Client"}`
        }
      );
      onClose();
      refreshData();
    } catch (error) {
      console.error("Failed to delete client:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle viewing full client details
  const handleViewFullDetails = () => {
    onClose();
    navigate(`/clients/${client._id}`, { state: { client } });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background Overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal Content */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="border-0">
            <div className="px-6 pt-5 pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3
                    className="text-2xl font-bold leading-6 text-gray-900 dark:text-white"
                    id="modal-title"
                  >
                    {client.name || "Unnamed Client"}
                  </h3>
                  <div className="mt-1">
                    <Badge color={getStatusColor(client.status)}>
                      {client.status || "Unknown"}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded bg-white hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors ml-4 flex-shrink-0"
                  title="Close"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="mt-6 space-y-4">
                {/* Contact Information */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                  {client.email && (
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <Mail className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  
                  {client.phone && (
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  
                  {client.company && (
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <Building className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span>{client.company}</span>
                    </div>
                  )}
                </div>

                {/* Address Information */}
                {client.address && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      Address
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {client.address.street && <div>{client.address.street}</div>}
                      <div>
                        {[client.address.city, client.address.state, client.address.zipCode]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                      {client.address.country && <div>{client.address.country}</div>}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                  {client.createdAt && (
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span>Created: {formatDateLong(client.createdAt)}</span>
                    </div>
                  )}
                  
                  {client.tags && client.tags.length > 0 && (
                    <div className="flex items-start gap-3 text-sm">
                      <Tag className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {client.tags.map((tag, index) => (
                          <Badge key={index} color="blue" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {client.notes && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Notes
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        {client.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between gap-3 rounded-b-xl">
              <Button
                variant="danger"
                icon={Trash2}
                onClick={handleDelete}
                disabled={isDeleting}
                size="sm"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  icon={Edit}
                  onClick={() => onEdit(client)}
                  size="sm"
                >
                  Edit
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleViewFullDetails}
                  className="gap-2 flex items-center justify-center bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600"
                  title="View Full Details"
                >
                  More Details
                  <ArrowRight className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailModal;