import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { partnerService } from '../../api/index';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeft, Save, X, Building, User, MapPin, DollarSign, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PartnerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // State management
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: '',
    company: '',
    status: 'active',
    location: '',
    services: [],
    hourlyRate: '',
    rating: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    notes: ''
  });

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch partner data for edit mode
  useEffect(() => {
    const fetchPartner = async () => {
      if (!isEditMode) return;

      try {
        setLoading(true);
        console.log('🔄 Fetching partner for edit:', id);
        
        const response = await partnerService.getById(id);
        console.log('📋 Partner edit response:', response);

        let partnerData = null;
        
        // Handle different response structures
        if (response?.data?.data) {
          partnerData = response.data.data;
        } else if (response?.data) {
          partnerData = response.data;
        } else if (response) {
          partnerData = response;
        }

        if (partnerData) {
          setFormData({
            name: partnerData.name || '',
            email: partnerData.email || '',
            phone: partnerData.phone || '',
            type: partnerData.type || partnerData.category || '',
            company: partnerData.company || '',
            status: partnerData.status || 'active',
            location: partnerData.location || '',
            services: partnerData.services || [],
            hourlyRate: partnerData.hourlyRate || '',
            rating: partnerData.rating || '',
            address: {
              street: partnerData.address?.street || '',
              city: partnerData.address?.city || '',
              state: partnerData.address?.state || '',
              zipCode: partnerData.address?.zipCode || '',
              country: partnerData.address?.country || ''
            },
            notes: partnerData.notes || ''
          });
        }
      } catch (err) {
        console.error('❌ Error fetching partner:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load partner data';
        toast.error(errorMessage);
        navigate('/partners');
      } finally {
        setLoading(false);
      }
    };

    fetchPartner();
  }, [id, isEditMode, navigate]);

  // Form options
  const typeOptions = [
    { value: '', label: 'Select Type' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'supplier', label: 'Supplier' },
    { value: 'sponsor', label: 'Sponsor' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'catering', label: 'Catering' },
    { value: 'photography', label: 'Photography' },
    { value: 'music', label: 'Music' },
    { value: 'decoration', label: 'Decoration' },
    { value: 'security', label: 'Security' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'audio_visual', label: 'Audio Visual' },
    { value: 'floral', label: 'Floral' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const serviceOptions = [
    { value: 'wedding_planning', label: 'Wedding Planning' },
    { value: 'catering', label: 'Catering' },
    { value: 'photography', label: 'Photography' },
    { value: 'videography', label: 'Videography' },
    { value: 'music_dj', label: 'Music/DJ' },
    { value: 'decoration', label: 'Decoration' },
    { value: 'floral', label: 'Floral Arrangements' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'audio_visual', label: 'Audio Visual' },
    { value: 'security', label: 'Security' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'venue', label: 'Venue' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'other', label: 'Other' }
  ];

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleServicesChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      services: selectedOptions
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Partner name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    if (formData.hourlyRate && isNaN(formData.hourlyRate)) {
      newErrors.hourlyRate = 'Hourly rate must be a number';
    }

    if (formData.rating && (isNaN(formData.rating) || formData.rating < 0 || formData.rating > 5)) {
      newErrors.rating = 'Rating must be between 0 and 5';
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
      setSaving(true);

      // Prepare data for submission
      const submitData = {
        ...formData,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        rating: formData.rating ? parseFloat(formData.rating) : undefined
      };

      // Clean up empty address fields
      if (Object.values(submitData.address).every(val => !val)) {
        delete submitData.address;
      } else {
        // Remove empty address fields
        Object.keys(submitData.address).forEach(key => {
          if (!submitData.address[key]) {
            delete submitData.address[key];
          }
        });
      }

      console.log('📤 Submitting partner data:', submitData);

      let response;
      if (isEditMode) {
        response = await partnerService.update(id, submitData);
        toast.success('Partner updated successfully');
      } else {
        response = await partnerService.create(submitData);
        toast.success('Partner created successfully');
      }

      console.log('✅ Partner save response:', response);

      // Navigate to partner detail page
      const partnerId = isEditMode ? id : response?.data?._id || response?._id;
      if (partnerId) {
        navigate(`/partners/${partnerId}`);
      } else {
        navigate('/partners');
      }

    } catch (err) {
      console.error('❌ Error saving partner:', err);
      const errorMessage = err.response?.data?.message || err.message || `Failed to ${isEditMode ? 'update' : 'create'} partner`;
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/partners/${id}`);
    } else {
      navigate('/partners');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              icon={ArrowLeft}
            >
              Back to Partners
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? 'Edit Partner' : 'New Partner'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isEditMode 
                  ? 'Update partner information and details'
                  : 'Add a new partner to your network'
                }
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Partner Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                  placeholder="Enter partner name"
                />

                <Input
                  label="Email *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  placeholder="partner@example.com"
                />

                <Input
                  label="Phone *"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                  placeholder="+1 (555) 000-0000"
                />

                <Select
                  label="Type *"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  options={typeOptions}
                  error={errors.type}
                  required
                />

                <Input
                  label="Company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Company name (optional)"
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

          {/* Professional Details */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                Professional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, State"
                />

                <Input
                  label="Hourly Rate"
                  name="hourlyRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  error={errors.hourlyRate}
                  placeholder="0.00"
                  prefix="$"
                />

                <Input
                  label="Rating"
                  name="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={handleChange}
                  error={errors.rating}
                  placeholder="0.0 - 5.0"
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Services
                  </label>
                  <select
                    multiple
                    value={formData.services}
                    onChange={handleServicesChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white min-h-[100px]"
                  >
                    {serviceOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Hold Ctrl/Cmd to select multiple services
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Address Information */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Street Address"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="123 Main St"
                  />
                </div>

                <Input
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  placeholder="New York"
                />

                <Input
                  label="State/Province"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    placeholder="NY"
                  />

                  <Input
                    label="ZIP/Postal Code"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    placeholder="10001"
                  />

                  <Input
                    label="Country"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    placeholder="United States"
                  />
                </div>
              </div>
            </Card>

            {/* Additional Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Additional Information
                </h3>
                <Textarea
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Add any additional notes about this partner..."
                  maxLength={1000}
                  showCount
                />
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                icon={X}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={Save}
                loading={saving}
                disabled={saving}
              >
                {isEditMode ? 'Update Partner' : 'Create Partner'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default PartnerEdit;