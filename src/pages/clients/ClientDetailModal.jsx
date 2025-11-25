import React, { useState } from "react";
import {
  Trash2, Edit, Mail, Phone, MapPin, Building, Tag, Calendar, ArrowRight, AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Components
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Badge, { StatusBadge } from "../../components/common/Badge";

// Services
import { useToast } from "../../hooks/useToast";
import { clientService } from "../../api/index";

const ClientDetailModal = ({ isOpen, onClose, client, onEdit, refreshData }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { promise } = useToast();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!client) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit", month: "2-digit", year: "numeric"
    });
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await promise(
        clientService.delete(client._id),
        {
          loading: t("clients.toast.deleting", { name: client.name }),
          success: t("clients.toast.deleteSuccess", { name: client.name }),
          error: t("clients.toast.deleteError", { name: client.name })
        }
      );
      setShowDeleteConfirm(false);
      onClose();
      if (refreshData) refreshData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const InfoRow = ({ icon: Icon, label, value, color = "blue" }) => {
    if (!value) return null;
    const colors = {
      blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
      purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    };
    return (
      <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <div className={`p-2 rounded-lg ${colors[color] || colors.blue}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white break-words">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Main Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} title={client.name} size="md">
        <div className="space-y-6">
          
          {/* Header / Avatar */}
          <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mt-2 mb-2">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{client.name}</h3>
            <div className="mt-2">
              <StatusBadge status={client.status} />
            </div>
          </div>

          {/* Info Section */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {t("clientDetail.sections.contact")}
            </h4>
            <InfoRow icon={Mail} label={t("clientDetail.labels.email", "Email")} value={client.email} color="blue" />
            <InfoRow icon={Phone} label={t("clientDetail.labels.phone", "Phone")} value={client.phone} color="orange" />
            <InfoRow icon={Building} label={t("clientDetail.labels.company", "Company")} value={client.company} color="purple" />
            {client.address && (
              <InfoRow 
                icon={MapPin} 
                label={t("clientDetail.sections.address", "Address")} 
                value={[client.address.street, client.address.city].filter(Boolean).join(", ")} 
                color="blue" 
              />
            )}
            <InfoRow icon={Calendar} label={t("clientDetail.labels.created")} value={formatDate(client.createdAt)} color="purple" />
          </div>

          {/* Tags & Notes */}
          {(client.tags?.length > 0 || client.notes) && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {t("clientDetail.sections.notes", "Additional Info")}
              </h4>
              
              {client.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {client.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" icon={<Tag size={10}/>}>{tag}</Badge>
                  ))}
                </div>
              )}
              
              {client.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{client.notes}"</p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between gap-3 pt-2">
            <Button variant="ghost" className="text-red-600 hover:bg-red-50" icon={Trash2} onClick={() => setShowDeleteConfirm(true)}>
              {t("clientDetail.actions.delete")}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" icon={Edit} onClick={() => onEdit(client)}>
                {t("clientDetail.actions.edit")}
              </Button>
              <Button variant="primary" icon={ArrowRight} onClick={() => { onClose(); navigate(`/clients/${client._id}`, { state: { client } }); }}>
                {t("clientDetail.actions.moreDetails")}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title={t("clientDetail.modals.deleteClient")} size="sm">
        <div className="p-4 text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t("clientDetail.modals.deleteMessage", { name: client.name })}
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button variant="danger" loading={isDeleting} onClick={handleDelete}>
              {t("clientDetail.actions.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ClientDetailModal;