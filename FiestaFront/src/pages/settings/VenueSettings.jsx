import { useState, useEffect } from 'react';
import { useApi, useApiMutation } from '../../hooks/useApi';
import { venueService } from '../../api/index';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Save, Upload, Image as ImageIcon, X, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VenueSettings = () => {
  const { user } = useAuth();
  const venueId = user?.venueId;

  const { data: venue, loading, refetch } = useApi(
    () => venueId ? venueService.getById(venueId) : Promise.resolve(null),
    [venueId]
  );

  const updateMutation = useApiMutation(venueService.update);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    contact: {
      phone: '',
      email: ''
    },
    capacity: {
      min: '',
      max: ''
    },
    pricing: {
      basePrice: ''
    },
    amenities: [],
    operatingHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '09:00', close: '17:00', closed: true }
    },
    timeZone: 'UTC'
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name || '',
        description: venue.description || '',
        address: venue.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        contact: venue.contact || {
          phone: '',
          email: ''
        },
        capacity: venue.capacity || {
          min: '',
          max: ''
        },
        pricing: venue.pricing || {
          basePrice: ''
        },
        amenities: venue.amenities || [],
        operatingHours: venue.operatingHours || formData.operatingHours,
        timeZone: venue.timeZone || 'UTC'
      });
    }
  }, [venue]);

  const timeZoneOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' }
  ];

  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 
    'friday', 'saturday', 'sunday'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact: { ...prev.contact, [field]: value }
      }));
    } else if (name.startsWith('capacity.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        capacity: { ...prev.capacity, [field]: value }
      }));
    } else if (name.startsWith('pricing.')) {
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

  const handleOperatingHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Venue name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }

    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }

    if (!formData.contact.phone.trim()) {
      newErrors['contact.phone'] = 'Phone is required';
    }

    if (!formData.contact.email.trim()) {
      newErrors['contact.email'] = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.contact.email)) {
      newErrors['contact.email'] = 'Please provide a valid email';
    }

    if (!formData.capacity.min || formData.capacity.min < 1) {
      newErrors['capacity.min'] = 'Minimum capacity is required';
    }

    if (!formData.capacity.max || formData.capacity.max < 1) {
      newErrors['capacity.max'] = 'Maximum capacity is required';
    }

    if (Number(formData.capacity.max) < Number(formData.capacity.min)) {
      newErrors['capacity.max'] = 'Max capacity must be greater than min';
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
        capacity: {
          min: Number(formData.capacity.min),
          max: Number(formData.capacity.max)
        },
        pricing: {
          basePrice: Number(formData.pricing.basePrice)
        }
      };

      await updateMutation.mutate(venueId, submitData);
      toast.success('Venue settings updated successfully');
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update venue settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h3>
          <div className="space-y-6">
            <Input
              label="Venue Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder="Enter venue name"
            />

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              required
              rows={4}
              placeholder="Describe your venue..."
            />

            <Select
              label="Time Zone"
              name="timeZone"
              value={formData.timeZone}
              onChange={handleChange}
              options={timeZoneOptions}
            />
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
                error={errors['address.street']}
                required
                placeholder="123 Main St"
              />
            </div>

            <Input
              label="City"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              error={errors['address.city']}
              required
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

      {/* Contact Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Phone"
              name="contact.phone"
              value={formData.contact.phone}
              onChange={handleChange}
              error={errors['contact.phone']}
              required
              placeholder="+1 (555) 000-0000"
            />

            <Input
              label="Email"
              name="contact.email"
              type="email"
              value={formData.contact.email}
              onChange={handleChange}
              error={errors['contact.email']}
              required
              placeholder="venue@example.com"
            />
          </div>
        </div>
      </Card>

      {/* Capacity & Pricing */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Capacity & Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Minimum Capacity"
              name="capacity.min"
              type="number"
              min="1"
              value={formData.capacity.min}
              onChange={handleChange}
              error={errors['capacity.min']}
              required
              placeholder="50"
            />

            <Input
              label="Maximum Capacity"
              name="capacity.max"
              type="number"
              min="1"
              value={formData.capacity.max}
              onChange={handleChange}
              error={errors['capacity.max']}
              required
              placeholder="500"
            />

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
              placeholder="1000.00"
            />
          </div>
        </div>
      </Card>

      {/* Amenities */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Amenities
          </h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add amenity (e.g., WiFi, Parking, A/C)"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAmenity();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                icon={Plus}
                onClick={handleAddAmenity}
              >
                Add
              </Button>
            </div>

            {formData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <Badge
                    key={index}
                    color="purple"
                    className="flex items-center gap-2"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(index)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Operating Hours */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Operating Hours
          </h3>
          <div className="space-y-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="flex items-center gap-4">
                <div className="w-32">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {day}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 flex-1">
                  <Input
                    type="time"
                    value={formData.operatingHours[day].open}
                    onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                    disabled={formData.operatingHours[day].closed}
                    className="flex-1"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="time"
                    value={formData.operatingHours[day].close}
                    onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                    disabled={formData.operatingHours[day].closed}
                    className="flex-1"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.operatingHours[day].closed}
                    onChange={(e) => handleOperatingHoursChange(day, 'closed', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">Closed</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Subscription Info */}
      {venue?.subscription && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Subscription
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <Badge color="purple" className="mt-1">
                  {venue.subscription.plan}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge 
                  color={venue.subscription.status === 'active' ? 'green' : 'gray'} 
                  className="mt-1"
                >
                  {venue.subscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-semibold text-gray-900 mt-1">
                  ${venue.subscription.amount}/mo
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          icon={Save}
          loading={updateMutation.loading}
          size="lg"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default VenueSettings;