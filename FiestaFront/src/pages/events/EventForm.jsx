import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi, useApiMutation, usePaginationList } from '../../hooks/useApi';
import { eventService, clientService, partnerService } from '../../api/index';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: event, loading: fetchLoading } = useApi(
    () => isEditMode ? eventService.getById(id) : Promise.resolve(null),
    [id]
  );

  const { data: clients } = usePaginationList((params) => clientService.getAll({ ...params, limit: 100 }));
  const { data: partners } = usePaginationList((params) => partnerService.getAll({ ...params, limit: 100 }));

  const updateMutation = useApiMutation(eventService.update);
  const createMutation = useApiMutation(eventService.create);

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
      additionalServices: [],
      discount: ''
    },
    partners: [],
    requirements: {
      setup: '',
      catering: '',
      decoration: '',
      audioVisual: '',
      other: ''
    },
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [newService, setNewService] = useState({ name: '', price: '' });
  const [newPartner, setNewPartner] = useState({ partner: '', service: '', cost: '' });

  useEffect(() => {
    if (event) {
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
          additionalServices: event.pricing?.additionalServices || [],
          discount: event.pricing?.discount || ''
        },
        partners: event.partners?.map(p => ({
          partner: p.partner?._id || p.partner,
          service: p.service,
          cost: p.cost,
          status: p.status
        })) || [],
        requirements: {
          setup: event.requirements?.setup || '',
          catering: event.requirements?.catering || '',
          decoration: event.requirements?.decoration || '',
          audioVisual: event.requirements?.audioVisual || '',
          other: event.requirements?.other || ''
        },
        notes: event.notes || ''
      });
    }
  }, [event]);

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

  const partnerStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('pricing.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        pricing: { ...prev.pricing, [field]: value }
      }));
    } else if (name.startsWith('requirements.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        requirements: { ...prev.requirements, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddService = () => {
    if (newService.name && newService.price) {
      setFormData(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          additionalServices: [
            ...prev.pricing.additionalServices,
            { name: newService.name, price: parseFloat(newService.price) }
          ]
        }
      }));
      setNewService({ name: '', price: '' });
    }
  };

  const handleRemoveService = (index) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        additionalServices: prev.pricing.additionalServices.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddPartner = () => {
    if (newPartner.partner && newPartner.service && newPartner.cost) {
      setFormData(prev => ({
        ...prev,
        partners: [
          ...prev.partners,
          {
            partner: newPartner.partner,
            service: newPartner.service,
            cost: parseFloat(newPartner.cost),
            status: 'pending'
          }
        ]
      }));
      setNewPartner({ partner: '', service: '', cost: '' });
    }
  };

  const handleRemovePartner = (index) => {
    setFormData(prev => ({
      ...prev,
      partners: prev.partners.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.type) {
      newErrors.type = 'Event type is required';
    }

    if (!formData.clientId) {
      newErrors.clientId = 'Client is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.guestCount && formData.guestCount < 1) {
      newErrors.guestCount = 'Guest count must be at least 1';
    }

    if (!formData.pricing.basePrice || formData.pricing.basePrice < 0) {
      newErrors['pricing.basePrice'] = 'Base price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const submitData = {
        ...formData,
        guestCount: formData.guestCount ? parseInt(formData.guestCount) : undefined,
        pricing: {
          basePrice: parseFloat(formData.pricing.basePrice),
          additionalServices: formData.pricing.additionalServices,
          discount: formData.pricing.discount ? parseFloat(formData.pricing.discount) : 0
        }
      };

      if (isEditMode) {
        await updateMutation.mutate(id, submitData);
        toast.success('Event updated successfully');
        navigate(`/events/${id}`);
      } else {
        const response = await createMutation.mutate(submitData);
        toast.success('Event created successfully');
        navigate(`/events/${response._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save event');
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/events/${id}`);
    } else {
      navigate('/events');
    }
  };

  if (isEditMode && fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              icon={ArrowLeft}
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Event' : 'Create Event'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isEditMode 
                  ? 'Update event information'
                  : 'Create a new event booking'
                }
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Event Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    error={errors.title}
                    required
                    placeholder="e.g., Smith Wedding Reception"
                  />
                </div>

                <Select
                  label="Event Type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  options={eventTypeOptions}
                  error={errors.type}
                  required
                />

                <Select
                  label="Client"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select Client' },
                    ...(clients?.data || []).map(client => ({
                      value: client._id,
                      label: client.name
                    }))
                  ]}
                  error={errors.clientId}
                  required
                />

                <Select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={statusOptions}
                />

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

                <div className="md:col-span-2">
                  <Textarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Event description..."
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Date & Time */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Date & Time
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  error={errors.startDate}
                  required
                />

                <Input
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  error={errors.endDate}
                  required
                />

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
          </Card>

          {/* Pricing */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pricing
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Base Price"
                    name="pricing.basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricing.basePrice}
                    onChange={handleChange}
                    error={errors['pricing.basePrice']}
                    required
                    placeholder="0.00"
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
                  />
                </div>

                {/* Additional Services */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Services
                  </label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="Service name"
                      value={newService.name}
                      onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={newService.price}
                      onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      icon={Plus}
                      onClick={handleAddService}
                    >
                      Add
                    </Button>
                  </div>

                  {formData.pricing.additionalServices.length > 0 && (
                    <div className="space-y-2">
                      {formData.pricing.additionalServices.map((service, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">{service.name}</span>
                            <span className="text-gray-600 ml-3">${service.price.toFixed(2)}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleRemoveService(index)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Partners */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Partners
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Select
                    placeholder="Select partner"
                    value={newPartner.partner}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, partner: e.target.value }))}
                    options={[
                      { value: '', label: 'Select Partner' },
                      ...(partners?.data || []).map(partner => ({
                        value: partner._id,
                        label: partner.name
                      }))
                    ]}
                  />
                  <Input
                    placeholder="Service"
                    value={newPartner.service}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, service: e.target.value }))}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Cost"
                    value={newPartner.cost}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, cost: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    icon={Plus}
                    onClick={handleAddPartner}
                  >
                    Add Partner
                  </Button>
                </div>

                {formData.partners.length > 0 && (
                  <div className="space-y-2">
                    {formData.partners.map((partner, index) => {
                      const partnerData = partners?.data?.find(p => p._id === partner.partner);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">
                              {partnerData?.name || 'Unknown Partner'}
                            </span>
                            <span className="text-gray-600 mx-2">•</span>
                            <span className="text-gray-600">{partner.service}</span>
                            <span className="text-gray-600 ml-3">${partner.cost.toFixed(2)}</span>
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

          {/* Requirements */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Requirements
              </h3>
              <div className="space-y-4">
                <Textarea
                  label="Setup"
                  name="requirements.setup"
                  value={formData.requirements.setup}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Setup requirements..."
                />

                <Textarea
                  label="Catering"
                  name="requirements.catering"
                  value={formData.requirements.catering}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Catering requirements..."
                />

                <Textarea
                  label="Decoration"
                  name="requirements.decoration"
                  value={formData.requirements.decoration}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Decoration requirements..."
                />

                <Textarea
                  label="Audio/Visual"
                  name="requirements.audioVisual"
                  value={formData.requirements.audioVisual}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Audio/Visual requirements..."
                />

                <Textarea
                  label="Other"
                  name="requirements.other"
                  value={formData.requirements.other}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Other requirements..."
                />
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Notes
              </h3>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={5}
                placeholder="Add any additional notes about this event..."
                maxLength={1000}
                showCount
              />
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              icon={X}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              loading={updateMutation.loading || createMutation.loading}
            >
              {isEditMode ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;