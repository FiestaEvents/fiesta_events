// EventForm.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import {
  X, Save, Plus, Trash2, Calendar, Clock, Users, DollarSign,
  ChevronRight, ChevronLeft, UserPlus, Building, Tag, FileText,
  Search, Check, User
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
    pricing: { basePrice: '', discount: '' },
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

  // ✅ Options for Select component
  const eventTypeOptions = [
    { value: '', label: 'Select Event Type' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'conference', label: 'Conference' },
    { value: 'party', label: 'Party' },
    { value: 'other', label: 'Other' }
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
    const partnersCost = formData.partners.reduce((total, partner) => 
      total + (parseFloat(partner.cost) || 0), 0);
    return basePrice + partnersCost - discount;
  };

  const totalPrice = calculateTotalPrice();

  // Filter clients
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
          if (response[key] && Array.isArray(response[key])) return response[key];
          if (response?.data?.[key] && Array.isArray(response.data[key])) return response.data[key];
        }
        if (Array.isArray(response.data)) return response.data;
        for (const key in response) {
          if (Array.isArray(response[key])) return response[key];
        }
        return [];
      };

      setClients(extractArrayData(clientsRes, ['clients', 'data']));
      setPartners(extractArrayData(partnersRes, ['partners', 'data']));
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      toast.error('Failed to load clients and partners');
      setClients([]);
      setPartners([]);
    }
  };

  // Effects
  useEffect(() => {
    if (isOpen) fetchDropdownData();
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
      setFormData(prev => ({ ...prev, startDate: dateString, endDate: dateString }));
    }
  }, [initialDate, isOpen, isEditMode]);

  // Event handlers
  const handleChange = (e ) => {
    const { name, value } = e.target;
    console.log('haamaaaaaa',e)
    console.log(name ,e, value)
    if (name.startsWith('pricing.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, [field]: value } }));
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
        const partnerCost = selectedPartner.hourlyRate || 0;
        const isAlreadyAdded = formData.partners.some(p => p.partner === newPartner.partner);
        if (isAlreadyAdded) {
          toast.error(`${selectedPartner.name} is already added to this event`);
          return;
        }
        setFormData(prev => ({
          ...prev,
          partners: [...prev.partners, {
            partner: newPartner.partner,
            partnerName: selectedPartner.name,
            service: selectedPartner.services?.[0] || 'General Service',
            cost: partnerCost,
            status: 'pending'
          }]
        }));
        setNewPartner({ partner: '', cost: '' });
        toast.success(`${selectedPartner.name} added to event`);
      }
    } else {
      toast.error('Please select a partner first');
    }
  };

  const handleRemovePartner = (index) => {
    const partnerToRemove = formData.partners[index];
    setFormData(prev => ({ ...prev, partners: prev.partners.filter((_, i) => i !== index) }));
    toast.success(`${partnerToRemove.partnerName || 'Partner'} removed`);
  };

  // ✅ FIXED: Client creation with proper state management
  const handleCreateClient = async () => {
    if (!newClient.name.trim()) {
      toast.error('Client name is required');
      return;
    }

    try {
      setIsCreatingClient(true);
      const response = await clientService.create(newClient);

      let createdClient = null;
      if (response?.client) {
        createdClient = response.client;
      } else if (response?.data?.client) {
        createdClient = response.data.client;
      } else if (response?.data) {
        createdClient = response.data;
      } else if (response) {
        createdClient = response;
      }
      
      if (!createdClient || !createdClient._id) {
        console.error('Invalid client response:', response);
        throw new Error('Invalid client response structure');
      }

      // Add to list, select it, and clear error
      setClients(prev => [...prev, createdClient]);
      setSelectedClient(createdClient._id);
      setFormData(prev => ({ ...prev, clientId: createdClient._id }));
      
      // ✅ Clear the clientId error immediately
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.clientId;
        return newErrors;
      });
      
      setNewClient({ name: '', email: '', phone: '' });
      toast.success(`Client "${createdClient.name}" created and selected!`);
      
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error(error.response?.data?.message || 'Failed to create client');
    } finally {
      setIsCreatingClient(false);
    }
  };

  // ✅ FIXED: Handle client selection with error clearing
  const handleSelectClient = (clientId) => {
    setSelectedClient(clientId);
    setFormData(prev => ({ ...prev, clientId }));
    
    // Clear the error when a client is selected
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.clientId;
      return newErrors;
    });
  };

  // ✅ FIXED: Validation that checks both formData and selectedClient
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
      // Check both for reliability
      if (!formData.clientId && !selectedClient) {
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
      title: '', description: '', type: '', clientId: '',
      startDate: '', endDate: '', startTime: '', endTime: '',
      guestCount: '', status: 'pending',
      pricing: { basePrice: '', discount: '' },
      partners: [], notes: ''
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

  const stepConfigs = {
    1: { title: "Event Details", icon: Calendar, description: "Set up the core details of your event" },
    2: { title: "Client Selection", icon: UserPlus, description: "Select existing client or create a new one" },
    3: { title: "Pricing & Partners", icon: DollarSign, description: "Configure pricing and add service partners" },
    4: { title: "Review & Notes", icon: FileText, description: "Final review and additional notes" }
  };

  const currentStepConfig = stepConfigs[currentStep];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
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
              <Button variant="ghost" size="sm" icon={X} onClick={handleClose} />
            </div>

            {/* Progress Steps */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        step === currentStep ? 'bg-orange-500 border-orange-500 text-white' :
                        step < currentStep ? 'bg-green-500 border-green-500 text-white' :
                        'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500'
                      }`}>
                        {step < currentStep ? '✓' : step}
                      </div>
                      <span className={`text-xs mt-1 font-medium ${
                        step === currentStep ? 'text-orange-600' :
                        step < currentStep ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {stepConfigs[step].title}
                      </span>
                    </div>
                    {step < totalSteps && (
                      <div className={`flex-1 h-1 mx-1 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800">
            <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
              
              {/* Step 1: Event Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                      <div className="p-5">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Event Details</h4>
                        <div className="space-y-4">
                          <Input label="Event Title " name="title" value={formData.title} 
                            onChange={handleChange} error={errors.title} required />
                          
                          <Select label="Event Type " name="type" value={formData.type} 
                            onChange={handleChange} options={eventTypeOptions} error={errors.type} required />
                          
                          <Select label="Status" name="status" value={formData.status} 
                            onChange={handleChange} options={statusOptions} />
                        </div>
                      </div>
                    </Card>

                    <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                      <div className="p-5">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Date & Time</h4>
                        <div className="space-y-4">
                          <Input label="Start Date *" name="startDate" type="date" value={formData.startDate} 
                            onChange={handleChange} error={errors.startDate} required />
                          <Input label="End Date *" name="endDate" type="date" value={formData.endDate} 
                            onChange={handleChange} error={errors.endDate} required />
                          <div className="grid grid-cols-2 gap-3">
                            <Input label="Start Time" name="startTime" type="time" value={formData.startTime} onChange={handleChange} />
                            <Input label="End Time" name="endTime" type="time" value={formData.endTime} onChange={handleChange} />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                    <div className="p-5">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Additional Details</h4>
                      <div className="space-y-4">
                        <Input label="Guest Count" name="guestCount" type="number" min="1" 
                          value={formData.guestCount} onChange={handleChange} />
                        <Textarea name="description" value={formData.description} onChange={handleChange} rows={3} 
                          placeholder="Event description..." />
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Step 2: Client Selection */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                    <div className="p-5">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Create New Client</h4>
                      <div className="space-y-4">
                        <Input label="Client Name *" value={newClient.name} 
                          onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))} />
                        <Input label="Email" type="email" value={newClient.email} 
                          onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))} />
                        <Input label="Phone" value={newClient.phone} 
                          onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))} />
                        <Button type="button" variant="primary" icon={Plus} onClick={handleCreateClient} 
                          loading={isCreatingClient} className="w-full">
                          Create Client
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                    <div className="p-5">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Select Existing Client</h4>
                      <Input icon={Search} placeholder="Search clients..." value={clientSearch} 
                        onChange={(e) => setClientSearch(e.target.value)} />
                      
                      <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                        {filteredClients.length > 0 ? (
                          filteredClients.map((client) => (
                            <div key={client._id} onClick={() => handleSelectClient(client._id)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedClient === client._id
                                  ? 'bg-orange-100 border-orange-300 dark:bg-orange-900'
                                  : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-600'
                              }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">
                                    {client.name?.charAt(0).toUpperCase() || 'C'}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">{client.name}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                      {client.email} • {client.phone}
                                    </div>
                                  </div>
                                </div>
                                {selectedClient === client._id && <Check className="w-5 h-5 text-green-500" />}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No clients found</p>
                          </div>
                        )}
                      </div>
                      {errors.clientId && <div className="mt-2 text-red-600 text-sm">{errors.clientId}</div>}
                    </div>
                  </Card>
                </div>
              )}

              {/* Step 3: Pricing & Partners */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                      <div className="p-5">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Base Pricing</h4>
                        <div className="space-y-4">
                          <Input label="Base Price *" name="pricing.basePrice" type="number" step="0.01" 
                            value={formData.pricing.basePrice} onChange={handleChange} 
                            error={errors['pricing.basePrice']} required prefix="$" />
                          <Input label="Discount" name="pricing.discount" type="number" step="0.01" 
                            value={formData.pricing.discount} onChange={handleChange} prefix="$" />
                        </div>
                      </div>
                    </Card>

                    <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                      <div className="p-5">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Service Partners</h4>
                        <div className="space-y-3">
                          <Select placeholder="Select Partner" value={newPartner.partner} 
                            onChange={(e) => {
                              const partnerId = e.target.value;
                              const selectedPartner = partners.find(p => p._id === partnerId);
                              if (selectedPartner) {
                                setNewPartner({ partner: partnerId, cost: selectedPartner.hourlyRate || 0 });
                              }
                            }}
                            options={[
                              { value: '', label: 'Select Partner' },
                              ...partners.map(p => ({ value: p._id, label: `${p.name} - $${p.hourlyRate || 0}` }))
                            ]} />
                          
                          <Button type="button" variant="outline" icon={Plus} onClick={handleAddPartner} 
                            className="w-full" disabled={!newPartner.partner}>
                            Add Partner
                          </Button>

                          {formData.partners.length > 0 && (
                            <div className="space-y-2">
                              {formData.partners.map((partner, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {partner.partnerName}
                                    </div>
                                    <div className="text-orange-600">${partner.cost}</div>
                                  </div>
                                  <Button type="button" variant="ghost" size="sm" icon={Trash2} 
                                    onClick={() => handleRemovePartner(idx)} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>

                  <Card className="border-0 shadow-sm bg-orange-50 dark:bg-gray-700">
                    <div className="p-5">
                      <h4 className="font-semibold mb-3">Price Summary</h4>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-white dark:bg-gray-600 rounded">
                          <div className="text-sm text-gray-600">Base</div>
                          <div className="font-bold">${(parseFloat(formData.pricing.basePrice) || 0).toFixed(2)}</div>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-600 rounded">
                          <div className="text-sm text-gray-600">Partners</div>
                          <div className="font-bold">
                            ${formData.partners.reduce((t, p) => t + (parseFloat(p.cost) || 0), 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded">
                          <div className="text-sm text-gray-600">Total</div>
                          <div className="font-bold text-orange-600">${totalPrice.toFixed(2)}</div>
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
                    <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                      <div className="p-5">
                        <h4 className="font-semibold mb-4">Event Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Title:</span>
                            <span className="font-medium">{formData.title}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Type:</span>
                            <Badge className="capitalize">{formData.type}</Badge>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Date:</span>
                            <span>{formData.startDate}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-gray-600">Client:</span>
                            <span>{clients.find(c => c._id === formData.clientId)?.name || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                      <div className="p-5">
                        <h4 className="font-semibold mb-4">Financial Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-2">
                            <span>Base Price:</span>
                            <span>${(parseFloat(formData.pricing.basePrice) || 0).toFixed(2)}</span>
                          </div>
                          {formData.partners.map((p, idx) => (
                            <div key={idx} className="flex justify-between py-1 text-xs text-gray-600">
                              <span>{p.partnerName}:</span>
                              <span>${p.cost?.toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between pt-2 border-t font-bold text-lg">
                            <span>Total:</span>
                            <span className="text-orange-600">${totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                    <div className="p-5">
                      <h4 className="font-semibold mb-4">Additional Notes</h4>
                      <Textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} 
                        placeholder="Add notes..." maxLength={1000} showCount />
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" icon={ChevronLeft} onClick={prevStep}>
                      Previous
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {currentStep >= 3 && (
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Total</div>
                      <div className="text-xl font-bold text-orange-600">${totalPrice.toFixed(2)}</div>
                    </div>
                  )}
                  {currentStep < totalSteps ? (
                    <Button type="button" variant="primary" icon={ChevronRight} onClick={nextStep}>
                      Continue
                    </Button>
                  ) : (
                    <Button type="submit" variant="primary" icon={Save} loading={loading}>
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