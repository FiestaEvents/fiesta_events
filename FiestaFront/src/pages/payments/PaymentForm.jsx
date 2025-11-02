import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi, useMutation } from '../../hooks/useApi';
import { partnerService } from '../../api/services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';
import { ArrowLeft, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PartnerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: partner, loading: fetchLoading } = useApi(
    () => isEditMode ? partnerService.getById(id) : Promise.resolve(null),
    [id]
  );

  const updateMutation = useMutation(partnerService.update);
  const createMutation = useMutation(partnerService.create);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    company: '',
    status: 'active',
    location: '',
    specialties: '',
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

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name || '',
        email: partner.email || '',
        phone: partner.phone || '',
        category: partner.category || '',
        company: partner.company || '',
        status: partner.status || 'active',
        location: partner.location || '',
        specialties: partner.specialties || '',
        hourlyRate: partner.hourlyRate || '',
        rating: partner.rating || '',
        address: {
          street: partner.address?.street || '',
          city: partner.address?.city || '',
          state: partner.address?.state || '',
          zipCode: partner.address?.zipCode || '',
          country: partner.address?.country || ''
        },
        notes: partner.notes || ''
      });
    }
  }, [partner]);

  const categoryOptions = [
    { value: '', label: 'Select Category' },
    { value: 'catering', label: 'Catering' },
    { value: 'decoration', label: 'Decoration' },
    { value: 'photography', label: 'Photography' },
    { value: 'music', label: 'Music' },
    { value: 'security', label: 'Security' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'audio_visual', label: 'Audio Visual' },
    { value: 'floral', label: 'Floral' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

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

    if (!formData.category) {
      newErrors.category = 'Category is required';
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
      // Prepare data
      const submitData = {
        ...formData,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        rating: formData.rating ? parseFloat(formData.rating) : undefined
      };

      // Remove empty address fields
      if (Object.values(submitData.address).every(val => !val)) {
        delete submitData.address;
      }

      if (isEditMode) {
        await updateMutation.mutate(id, submitData);
        toast.success('Partner updated successfully');
        navigate(`/partners/${id}`);
      } else {
        const response = await createMutation.mutate(submitData);
        toast.success('Partner created successfully');
        navigate(`/partners/${response._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save partner');
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/partners/${id}`);
    } else {
      navigate('/partners');
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
    <div className="max-w-4xl mx-auto">
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
                {isEditMode ? 'Edit Partner' : 'New Partner'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isEditMode 
                  ? 'Update partner information'
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Partner Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                  placeholder="Enter partner name"
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  placeholder="partner@example.com"
                />

                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                  placeholder="+1 (555) 000-0000"
                />

                <Select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  options={categoryOptions}
                  error={errors.category}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                  <Textarea
                    label="Specialties"
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleChange}
                    rows={3}
                    placeholder="List partner's specialties and expertise"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Address */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Address
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
              {isEditMode ? 'Update Partner' : 'Create Partner'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartnerEdit;