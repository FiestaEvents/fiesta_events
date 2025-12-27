import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  X,
  Save,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Services
import { venueSpacesService } from "../../api/index"; 

// Components
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import OrbitLoader from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal"; // ✅ Imported Custom Modal
import Badge from "../../components/common/Badge";

const FleetManagement = () => {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [saving, setSaving] = useState(false);

  // ✅ New Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Form
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch Data
  const fetchFleet = async () => {
    try {
      setLoading(true);
      const res = await venueSpacesService.getAll();
      setVehicles(res.spaces || res.data?.spaces || []);
    } catch (error) {
      toast.error(t("fleet.errors.loadFailed", "Failed to load fleet"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  // --- Handlers ---

  const handleOpenEditModal = (vehicle = null) => {
    setEditingVehicle(vehicle);
    if (vehicle) {
      reset({
        name: vehicle.name,
        description: vehicle.description,
        "capacity.max": vehicle.capacity?.max,
        basePrice: vehicle.basePrice,
      });
    } else {
      reset({
        name: "",
        description: "",
        "capacity.max": "",
        basePrice: "",
      });
    }
    setIsEditModalOpen(true);
  };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      const payload = {
        name: data.name,
        description: data.description,
        type: 'vehicle',
        capacity: { 
          min: 1, 
          max: Number(data.capacity.max) 
        },
        basePrice: Number(data.basePrice),
        isActive: true
      };

      if (editingVehicle) {
        await venueSpacesService.update(editingVehicle._id, payload);
        toast.success(t("fleet.notifications.updated", "Vehicle updated"));
      } else {
        await venueSpacesService.create(payload);
        toast.success(t("fleet.notifications.created", "Vehicle added"));
      }
      setIsEditModalOpen(false);
      fetchFleet();
    } catch (error) {
      toast.error(error.message || t("fleet.errors.saveFailed", "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  // ✅ Updated Delete Handler (Opens Modal)
  const handleDeleteClick = (id) => {
    setVehicleToDelete(id);
    setDeleteModalOpen(true);
  };

  // ✅ Confirm Delete Action
  const confirmDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      await venueSpacesService.delete(vehicleToDelete);
      toast.success(t("fleet.notifications.deleted", "Vehicle removed"));
      setVehicles(prev => prev.filter(v => v._id !== vehicleToDelete));
    } catch (error) {
      toast.error(t("fleet.errors.deleteFailed", "Failed to delete"));
    } finally {
      setDeleteModalOpen(false);
      setVehicleToDelete(null);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="h-screen flex items-center justify-center"><OrbitLoader /></div>;

  return (
    <div className="p-6 md:p-8 space-y-6 bg-white rounded-lg dark:bg-gray-800 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck className="text-orange-500" /> {t("fleet.title", "Fleet Management")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t("fleet.subtitle", "Manage your vehicles and transport assets")}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => handleOpenEditModal()}>
          {t("fleet.actions.addVehicle", "Add Vehicle")}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder={t("fleet.searchPlaceholder", "Search by model or name...")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredVehicles.map((vehicle) => (
            <motion.div
              key={vehicle._id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group"
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 relative overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                      <Truck size={24} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEditModal(vehicle)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-blue-500 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteClick(vehicle._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{vehicle.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10 mb-4">
                    {vehicle.description || "No description provided"}
                  </p>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <Badge variant="neutral" className="flex items-center gap-1.5">
                      <Users size={12} /> {vehicle.capacity?.max || 0} Seats
                    </Badge>
                    <div className="text-right">
                       <span className="block text-xs text-gray-400 uppercase font-bold">Rate</span>
                       <span className="font-bold text-orange-600 dark:text-orange-400">{vehicle.basePrice} TND</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {!loading && filteredVehicles.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <Truck className="w-16 h-16 mb-4 opacity-20 text-gray-500" />
            <p className="text-gray-500 font-medium">{t("fleet.emptyState", "No vehicles found. Add one to get started!")}</p>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <motion.div 
             initial={{ opacity: 0, y: 20 }} 
             animate={{ opacity: 1, y: 0 }} 
             className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 relative"
           >
              <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {editingVehicle ? t("fleet.modal.editTitle", "Edit Vehicle") : t("fleet.modal.addTitle", "Add Vehicle")}
              </h2>

              <div className="space-y-4">
                 <Input 
                   label={t("fleet.modal.nameLabel", "Vehicle Name / Model")} 
                   {...register("name", { required: "Name is required" })}
                   error={errors.name?.message}
                   placeholder="e.g. Mercedes Sprinter"
                 />

                 <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label={t("fleet.modal.seatsLabel", "Seats / Capacity")} 
                      type="number"
                      {...register("capacity.max", { required: "Capacity is required" })}
                      error={errors.capacity?.max?.message}
                      placeholder="e.g. 8"
                    />
                    <Input 
                      label={t("fleet.modal.priceLabel", "Standard Rate (TND)")} 
                      type="number"
                      {...register("basePrice", { required: "Price is required" })}
                      error={errors.basePrice?.message}
                      placeholder="0.00"
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                       {t("fleet.modal.descLabel", "Description / License Plate")}
                    </label>
                    <textarea 
                       {...register("description")}
                       rows={3}
                       className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                       placeholder="e.g. License: 123 TN 4567"
                    />
                 </div>

                 <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={() => setIsEditModalOpen(false)} type="button">
                       {t("common.cancel", "Cancel")}
                    </Button>
                    <Button onClick={handleSubmit(handleSave)} loading={saving} icon={Save}>
                       {t("common.save", "Save Vehicle")}
                    </Button>
                 </div>
              </div>
           </motion.div>
        </div>
      )}

      <Modal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        title={t("fleet.actions.confirmDelete", "Remove Vehicle")}
        size="sm"
      >
         <div className="p-6 space-y-4">
           <div className="flex items-center gap-3 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800">
             <AlertTriangle className="w-5 h-5"/> 
             <p className="font-bold">Warning</p>
           </div>
           <p className="text-gray-600 dark:text-gray-300">
             {t("fleet.actions.deleteMessage", "Are you sure you want to remove this vehicle from your fleet?")}
           </p>
           <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                 {t("common.cancel", "Cancel")}
              </Button>
              <Button variant="danger" onClick={confirmDelete} icon={Trash2}>
                 {t("common.delete", "Delete")}
              </Button>
           </div>
        </div>
      </Modal>

    </div>
  );
};

export default FleetManagement;