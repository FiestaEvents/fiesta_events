// EventForm.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Users,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  UserPlus,
  Building,
  Tag,
  FileText,
  Search,
  Check,
  User
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { eventService, clientService, partnerService } from '../../api/index';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

const EventForm = ({ isOpen, onClose, eventId, onSuccess, initialDate }) => {
  const isEditMode = !!eventId;
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    clientId: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    guestCount: '',
    status: 'pending',
    pricing: {
      basePrice: '',
      discount: ''
    },
    partners: [],
    notes: ''
  });

  // UI state
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [newPartner, setNewPartner] = useState({ partner: '', cost: '' });
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  // Constants
  const eventTypeOptions = [
    { value: '', label: 'Select Event Type', icon: Tag },
    { value: 'wedding', label: 'Wedding', icon: Users },
    { value: 'birthday', label: 'Birthday', icon: Calendar },
    { value: 'corporate', label: 'Corporate', icon: Building },
    { value: 'conference', label: 'Conference', icon: Users },
    { value: 'party', label: 'Party', icon: Users },
    { value: 'other', label: 'Other', icon: Tag }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Calculations
  const calculateTotalPrice = () => {
    const basePrice = parseFloat(formData.pricing.basePrice) || 0;
    const discount = parseFloat(formData.pricing.discount) || 0;
    const partnersCost = formData.partners.reduce((total, partner) => total + (parseFloat(partner.cost) || 0), 0);
    
    return basePrice + partnersCost - discount;
  };

  const totalPrice = calculateTotalPrice();

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.email?.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.phone?.includes(clientSearch)
  );

  // Data fetching
  const fetchDropdownData = async () => {
    try {
      const [clientsRes, partnersRes] = await Promise.all([
        clientService.getAll({ limit: 100 }),
        partnerService.getAll({ limit: 100 })
      ]);

      const extractArrayData = (response, possibleKeys = ['clients', 'partners', 'data']) => {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        
        for (const key of possibleKeys) {
          if (response[key] && Array.isArray(response[key])) {
            return response[key];
          }
          if (response?.data?.[key] && Array.isArray(response.data[key])) {
            return response.data[key];
          }
        }
        
        if (Array.isArray(response.data)) return response.data;
        
        for (const key in response) {
          if (Array.isArray(response[key])) {
            return response[key];
          }
        }
        
        return [];
      };

      const clientsData = extractArrayData(clientsRes, ['clients', 'data']);
      const partnersData = extractArrayData(partnersRes, ['partners', 'data']);

      setClients(clientsData);
      setPartners(partnersData);

    } catch (error) {
      console.error('❌ Error fetching dropdown data:', error);
      toast.error('Failed to load clients and partners');
      setClients([]);
      setPartners([]);
    }
  };

  // Effects
  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!isEditMode || !isOpen) return;

      try {
        setFetchLoading(true);
        const response = await eventService.getById(eventId);
        const event = response.event || response;

        setFormData({
          title: event.title || '',
          description: event.description || '',
          type: event.type || '',
          clientId: event.clientId?._id || event.clientId || '',
          startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
          endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
          startTime: event.startTime || '',
          endTime: event.endTime || '',
          guestCount: event.guestCount || '',
          status: event.status || 'pending',
          pricing: {
            basePrice: event.pricing?.basePrice || '',
            discount: event.pricing?.discount || ''
          },
          partners: event.partners?.map(p => ({
            partner: p.partner?._id || p.partner,
            service: p.service,
            cost: p.cost,
            status: p.status || 'pending'
          })) || [],
          notes: event.notes || ''
        });

        // Set selected client for the client step
        if (event.clientId) {
          setSelectedClient(event.clientId._id || event.clientId);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event data');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, isEditMode, isOpen]);

  useEffect(() => {
    if (initialDate && isOpen && !isEditMode) {
      const dateString = initialDate.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        startDate: dateString,
        endDate: dateString
      }));
    }
  }, [initialDate, isOpen, isEditMode]);

  // Event handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('pricing.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        pricing: { ...prev.pricing, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddPartner = () => {
    if (newPartner.partner) {
      const selectedPartner = partners.find(p => p._id === newPartner.partner);
      
      if (selectedPartner) {
        // Use the partner's hourlyRate
        const partnerCost = selectedPartner.hourlyRate || 0;
        
        // Check if partner is already added
        const isAlreadyAdded = formData.partners.some(p => p.partner === newPartner.partner);
        if (isAlreadyAdded) {
          toast.error(`${selectedPartner.name} is already added to this event`);
          return;
        }
        
        setFormData(prev => ({
          ...prev,
          partners: [
            ...prev.partners,
            {
              partner: newPartner.partner,
              partnerName: selectedPartner.name,
              service: selectedPartner.services?.[0] || 'General Service',
              cost: partnerCost,
              status: 'pending'
            }
          ]
        }));
        
        // Reset the selection
        setNewPartner({ partner: '', cost: '' });
        toast.success(`${selectedPartner.name} added to event`);
      }
    } else {
      toast.error('Please select a partner first');
    }
  };

  const handleRemovePartner = (index) => {
    const partnerToRemove = formData.partners[index];
    setFormData(prev => ({
      ...prev,
      partners: prev.partners.filter((_, i) => i !== index)
    }));
    toast.success(`${partnerToRemove.partnerName || 'Partner'} removed`);
  };

  // ✅ SIMPLIFIED: Client creation - just create and continue
  const handleCreateClient = async () => {
    if (!newClient.name.trim()) {
      toast.error('Client name is required');
      return;
    }

    try {
      setIsCreatingClient(true);
      
      const response = await clientService.create(newClient);

      // Handle nested response structure
      let createdClient = null;
      
      if (response?.data?.data) {
        createdClient = response.data.data;
      } else if (response?.data) {
        createdClient = response.data;
      } else if (response) {
        createdClient = response;
      }
      
      if (!createdClient || !createdClient._id) {
        throw new Error('Invalid client response structure');
      }

      // Add to clients list and auto-select it
      setClients(prev => [...prev, createdClient]);
      setSelectedClient(createdClient._id);
      setFormData(prev => ({ ...prev, clientId: createdClient._id }));
      
      // Clear the form
      setNewClient({ name: '', email: '', phone: '' });
      
      toast.success(`Client "${createdClient.name}" created successfully`);
      
    } catch (error) {
      console.error('❌ Error creating client:', error);
      toast.error(error.response?.data?.message || 'Failed to create client');
    } finally {
      setIsCreatingClient(false);
    }
  };

  // ✅ SIMPLIFIED: Handle client selection
  const handleSelectClient = (clientId) => {
    setSelectedClient(clientId);
    setFormData(prev => ({ ...prev, clientId }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Event title is required';
      if (!formData.type) newErrors.type = 'Event type is required';
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (step === 2) {
      if (!formData.clientId) {
        newErrors.clientId = 'Please select or create a client';
      }
    }

    if (step === 3) {
      if (!formData.pricing.basePrice || formData.pricing.basePrice < 0) {
        newErrors['pricing.basePrice'] = 'Valid base price is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast.error('Please fix the form errors before continuing');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        guestCount: formData.guestCount ? parseInt(formData.guestCount) : undefined,
        pricing: {
          basePrice: parseFloat(formData.pricing.basePrice) || 0,
          discount: formData.pricing.discount ? parseFloat(formData.pricing.discount) : 0
        }
      };

      let response;
      if (isEditMode) {
        response = await eventService.update(eventId, submitData);
        toast.success('Event updated successfully');
      } else {
        response = await eventService.create(submitData);
        toast.success('Event created successfully');
      }

      onSuccess(response);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} event`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      type: '',
      clientId: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      guestCount: '',
      status: 'pending',
      pricing: {
        basePrice: '',
        discount: ''
      },
      partners: [],
      notes: ''
    });
    setErrors({});
    setCurrentStep(1);
    setSelectedClient(null);
    setNewClient({ name: '', email: '', phone: '' });
    setNewPartner({ partner: '', cost: '' });
    setClientSearch('');
    onClose();
  };

  if (!isOpen) return null;

  if (fetchLoading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step configurations
  const stepConfigs = {
    1: {
      title: "Event Details",
      icon: Calendar,
      description: "Set up the core details of your event"
    },
    2: {
      title: "Client Selection", 
      icon: UserPlus,
      description: "Select existing client or create a new one"
    },
    3: {
      title: "Pricing & Partners",
      icon: DollarSign,
      description: "Configure pricing and add service partners"
    },
    4: {
      title: "Review & Notes",
      icon: FileText,
      description: "Final review and additional notes"
    }
  };

  const currentStepConfig = stepConfigs[currentStep];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={handleClose}
        ></div>

        {/* Modal panel */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full max-h-[90vh] overflow-y-auto">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-600 px-6 py-5 border-b border-orange-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <currentStepConfig.icon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isEditMode ? 'Edit Event' : 'Create New Event'}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {currentStepConfig.description}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={handleClose}
                className="hover:bg-orange-100 dark:hover:bg-orange-900"
              />
            </div>

            {/* Enhanced Progress Steps */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        step === currentStep 
                          ? 'bg-orange-500 border-orange-500 text-white' 
                          : step < currentStep 
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                      }`}>
                        {step < currentStep ? '✓' : step}
                      </div>
                      <span className={`text-xs mt-1 font-medium ${
                        step === currentStep 
                          ? 'text-orange-600 dark:text-orange-400'
                          : step < currentStep
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {stepConfigs[step].title}
                      </span>
                    </div>
                    {step < totalSteps && (
                      <div className={`flex-1 h-1 mx-1 ${
                        step < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800">
            <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Step 1: Event Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                        <div className="p-5">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-orange-500" />
                            Event Details
                          </h4>
                          <div className="space-y-4">
                            <Input
                              label="Event Title *"
                              name="title"
                              value={formData.title}
                              onChange={handleChange}
                              error={errors.title}
                              required
                              placeholder="e.g., Smith Wedding Reception"
                            />

                            <Select
                              label="Event Type *"
                              name="type"
                              value={formData.type}
                              onChange={handleChange}
                              options={eventTypeOptions}
                              error={errors.type}
                              required
                            />

                            <Select
                              label="Status"
                              name="status"
                              value={formData.status}
                              onChange={handleChange}
                              options={statusOptions}
                            />
                          </div>
                        </div>
                      </Card>

                      <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                        <div className="p-5">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-orange-500" />
                            Guest Information
                          </h4>
                          <Input
                            label="Guest Count"
                            name="guestCount"
                            type="number"
                            min="1"
                            value={formData.guestCount}
                            onChange={handleChange}
                            error={errors.guestCount}
                            placeholder="Number of guests"
                          />
                        </div>
                      </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                        <div className="p-5">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-500" />
                            Date & Time
                          </h4>
                          <div className="grid grid-cols-1 gap-4">
                            <Input
                              label="Start Date *"
                              name="startDate"
                              type="date"
                              value={formData.startDate}
                              onChange={handleChange}
                              error={errors.startDate}
                              required
                            />

                            <Input
                              label="End Date *"
                              name="endDate"
                              type="date"
                              value={formData.endDate}
                              onChange={handleChange}
                              error={errors.endDate}
                              required
                            />

                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                label="Start Time"
                                name="startTime"
                                type="time"
                                value={formData.startTime}
                                onChange={handleChange}
                              />

                              <Input
                                label="End Time"
                                name="endTime"
                                type="time"
                                value={formData.endTime}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Description - Full Width */}
                  <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                    <div className="p-5">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-500" />
                        Event Description
                      </h4>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Describe the event, special requirements, or any important details..."
                        className="resize-none"
                      />
                    </div>
                  </Card>
                </div>
              )}

              {/* Step 2: Client Selection - SIMPLIFIED */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Create New Client */}
                  <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                    <div className="p-5">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-orange-500" />
                        Create New Client
                      </h4>
                      <div className="space-y-4">
                        <Input
                          label="Client Name *"
                          value={newClient.name}
                          onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter client name"
                        />
                        <Input
                          label="Email"
                          type="email"
                          value={newClient.email}
                          onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="client@example.com"
                        />
                        <Input
                          label="Phone"
                          value={newClient.phone}
                          onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+1 (555) 123-4567"
                        />
                        <Button
                          type="button"
                          variant="primary"
                          icon={Plus}
                          onClick={handleCreateClient}
                          loading={isCreatingClient}
                          className="w-full"
                        >
                          Create Client
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Right: Select Existing Client */}
                  <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                    <div className="p-5">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-orange-500" />
                        Select Existing Client
                      </h4>
                      
                      {/* Search */}
                      <div className="mb-4">
                        <Input
                          icon={Search}
                          placeholder="Search clients by name, email, or phone..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                        />
                      </div>

                      {/* Clients List */}
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {filteredClients.length > 0 ? (
                          filteredClients.map((client) => (
                            <div
                              key={client._id}
                              onClick={() => handleSelectClient(client._id)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedClient === client._id
                                  ? 'bg-orange-100 border-orange-300 dark:bg-orange-900 dark:border-orange-700'
                                  : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:hover:bg-gray-500'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                    {client.name?.charAt(0).toUpperCase() || 'C'}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {client.name}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                      {client.email} • {client.phone}
                                    </div>
                                  </div>
                                </div>
                                {selectedClient === client._id && (
                                  <Check className="w-5 h-5 text-green-500" />
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No clients found</p>
                            {clientSearch && (
                              <p className="text-sm">Try adjusting your search</p>
                            )}
                          </div>
                        )}
                      </div>

                      {errors.clientId && (
                        <div className="mt-2 text-red-600 text-sm">
                          {errors.clientId}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Step 3: Pricing & Partners */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pricing Section */}
                    <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                      <div className="p-5">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-orange-500" />
                          Base Pricing
                        </h4>
                        <div className="space-y-4">
                          <Input
                            label="Base Price *"
                            name="pricing.basePrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.pricing.basePrice}
                            onChange={handleChange}
                            error={errors['pricing.basePrice']}
                            required
                            placeholder="0.00"
                            prefix="$"
                          />

                          <Input
                            label="Discount"
                            name="pricing.discount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.pricing.discount}
                            onChange={handleChange}
                            placeholder="0.00"
                            prefix="$"
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Partners Section */}
                    <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                      <div className="p-5">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Building className="w-4 h-4 text-orange-500" />
                          Service Partners
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 gap-2">
                            <Select
                              placeholder={partners.length === 0 ? 'No partners available' : 'Select Partner'}
                              value={newPartner.partner}
                              onChange={(e) => {
                                const partnerId = e.target.value;
                                const selectedPartner = partners.find(p => p._id === partnerId);
                                
                                if (selectedPartner) {
                                  setNewPartner({ 
                                    partner: partnerId, 
                                    cost: selectedPartner.hourlyRate || 0
                                  });
                                }
                              }}
                              options={[
                                { value: '', label: partners.length === 0 ? 'No partners available' : 'Select Partner' },
                                ...partners.map(partner => ({
                                  value: partner._id,
                                  label: `${partner.name} - $${partner.hourlyRate || 0}`
                                }))
                              ]}
                            />
                            
                            {/* Display the cost */}
                            {newPartner.partner && (
                              <div className="p-3 bg-orange-50 dark:bg-orange-900 rounded-lg border border-orange-200 dark:border-orange-700">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Partner Cost:
                                  </span>
                                  <span className="text-lg font-bold text-orange-600">
                                    ${newPartner.cost}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  This cost is fixed and determined by the partner
                                </p>
                              </div>
                            )}
                            
                            <Button
                              type="button"
                              variant="outline"
                              icon={Plus}
                              onClick={handleAddPartner}
                              className="w-full"
                              disabled={!newPartner.partner}
                            >
                              Add Partner to Event
                            </Button>
                          </div>

                          {formData.partners.length > 0 && (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Added Partners ({formData.partners.length})
                              </h5>
                              {formData.partners.map((partner, index) => {
                                const partnerData = partners.find(p => p._id === partner.partner);
                                return (
                                  <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                                        <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <div className="text-sm">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                          {partner.partnerName || partnerData?.name || 'Unknown Partner'}
                                        </div>
                                        <div className="text-orange-600 font-semibold">
                                          ${parseFloat(partner.cost || 0).toFixed(2)}
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      icon={Trash2}
                                      onClick={() => handleRemovePartner(index)}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Price Summary */}
                  <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-600">
                    <div className="p-5">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Price Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                          <div className="text-gray-600 dark:text-gray-300">Base Price</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            ${(parseFloat(formData.pricing.basePrice) || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                          <div className="text-gray-600 dark:text-gray-300">Partners</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            ${formData.partners.reduce((total, p) => total + (parseFloat(p.cost) || 0), 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                          <div className="text-gray-600 dark:text-gray-300">Total</div>
                          <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                            ${totalPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Step 4: Review & Notes */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Event Summary */}
                    <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                      <div className="p-5">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          Event Summary
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-400">Title:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{formData.title}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-400">Type:</span>
                            <Badge color="orange" className="capitalize">{formData.type}</Badge>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-400">Dates:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formData.startDate} {formData.startTime && `at ${formData.startTime}`}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-400">Client:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {clients.find(c => c._id === formData.clientId)?.name || 'Not selected'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                            <Badge color={formData.status === 'confirmed' ? 'green' : 'yellow'} className="capitalize">
                              {formData.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Financial Summary */}
                    <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                      <div className="p-5">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-orange-500" />
                          Financial Summary
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                            <span>Base Price:</span>
                            <span>${(parseFloat(formData.pricing.basePrice) || 0).toFixed(2)}</span>
                          </div>
                          {formData.partners.map((partner, index) => {
                            const partnerData = partners.find(p => p._id === partner.partner);
                            return (
                              <div key={index} className="flex justify-between py-1 text-xs">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {partner.partnerName || partnerData?.name}:
                                </span>
                                <span>${partner.cost?.toFixed(2)}</span>
                              </div>
                            );
                          })}
                          {formData.partners.length > 0 && (
                            <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-600">
                              <span>Partners Total:</span>
                              <span>
                                ${formData.partners.reduce((total, p) => total + (parseFloat(p.cost) || 0), 0).toFixed(2)}
                              </span>
                            </div>
                          )}
                          {formData.pricing.discount > 0 && (
                            <div className="flex justify-between py-2 text-green-600">
                              <span>Discount:</span>
                              <span>-${(parseFloat(formData.pricing.discount) || 0).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600 font-semibold text-lg">
                            <span>Total:</span>
                            <span className="text-orange-600">${totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Notes */}
                  <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                    <div className="p-5">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-500" />
                        Additional Notes
                      </h4>
                      <Textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Add any additional notes, special instructions, or important information about this event..."
                        maxLength={1000}
                        showCount
                        className="resize-none"
                      />
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* Enhanced Footer Actions */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      icon={ChevronLeft}
                      onClick={prevStep}
                    >
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Total Price Display */}
                  {currentStep >= 3 && (
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Amount</div>
                      <div className="text-xl font-bold text-orange-600">${totalPrice.toFixed(2)}</div>
                    </div>
                  )}

                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      variant="primary"
                      icon={ChevronRight}
                      onClick={nextStep}
                      className="min-w-[120px]"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      icon={Save}
                      loading={loading}
                      className="min-w-[140px]"
                    >
                      {isEditMode ? 'Update Event' : 'Create Event'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventForm;