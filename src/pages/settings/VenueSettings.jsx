import { useState, useEffect } from 'react';
import { venueService } from '../../api/index';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Save, X, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VenueSettings = () => {
  const { user } = useAuth();

  // FIXED: State management
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  // FIXED: Fetch venue data using getMe() instead of getById()
  const fetchVenue = async () => {
    try {
      setLoading(true);
      const response = await venueService.getMe();
      
      // API service handleResponse returns { venue: {...} }
      const venueData = response?.venue || response;
      
      if (venueData) {
        setVenue(venueData);
        setFormData({
          name: venueData.name || '',
          description: venueData.description || '',
          address: venueData.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          contact: venueData.contact || {
            phone: '',
            email: ''
          },
          capacity: venueData.capacity || {
            min: '',
            max: ''
          },
          pricing: venueData.pricing || {
            basePrice: ''
          },
          amenities: venueData.amenities || [],
          operatingHours: venueData.operatingHours || formData.operatingHours,
          timeZone: venueData.timeZone || 'UTC'
        });
      }
    } catch (error) {
      console.error('Error fetching venue:', error);
      toast.error(error.message || 'Failed to load venue settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenue();
  }, []);

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

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
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

    // FIXED: Validate all required address fields
    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }

    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }

    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State/Province is required';
    }

    if (!formData.address.zipCode.trim()) {
      newErrors['address.zipCode'] = 'ZIP/Postal code is required';
    }

    if (!formData.address.country.trim()) {
      newErrors['address.country'] = 'Country is required';
    }

    // Contact validation
    if (!formData.contact.phone.trim()) {
      newErrors['contact.phone'] = 'Phone is required';
    }

    if (!formData.contact.email.trim()) {
      newErrors['contact.email'] = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.contact.email)) {
      newErrors['contact.email'] = 'Please provide a valid email';
    }

    // Capacity validation
    if (!formData.capacity.min || Number(formData.capacity.min) < 1) {
      newErrors['capacity.min'] = 'Minimum capacity must be at least 1';
    }

    if (!formData.capacity.max || Number(formData.capacity.max) < 1) {
      newErrors['capacity.max'] = 'Maximum capacity must be at least 1';
    }

    if (Number(formData.capacity.max) < Number(formData.capacity.min)) {
      newErrors['capacity.max'] = 'Maximum capacity must be greater than or equal to minimum';
    }

    // Pricing validation
    if (formData.pricing.basePrice === '' || Number(formData.pricing.basePrice) < 0) {
      newErrors['pricing.basePrice'] = 'Base price is required and cannot be negative';
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
      setIsSaving(true);

      // FIXED: Prepare data according to Venue model
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          zipCode: formData.address.zipCode.trim(),
          country: formData.address.country.trim()
        },
        contact: {
          phone: formData.contact.phone.trim(),
          email: formData.contact.email.trim()
        },
        capacity: {
          min: Number(formData.capacity.min),
          max: Number(formData.capacity.max)
        },
        pricing: {
          basePrice: Number(formData.pricing.basePrice)
        },
        amenities: formData.amenities,
        operatingHours: formData.operatingHours,
        timeZone: formData.timeZone
      };

      // FIXED: Use venueService.update(data) without venueId parameter
      await venueService.update(submitData);
      toast.success('Venue settings updated successfully');
      
      // Refetch venue data
      await fetchVenue();
    } catch (error) {
      console.error('Error updating venue:', error);
      
      // Handle validation errors from API
      if (error.status === 400 || error.status === 422) {
        if (error.errors) {
          setErrors(error.errors);
        }
        toast.error(error.message || 'Please fix the validation errors');
      } else {
        toast.error(error.message || 'Failed to update venue settings');
      }
    } finally {
      setIsSaving(false);
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Venue Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your venue information and settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            <div className="space-y-6">
              <Input
                label="Venue Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                placeholder="Enter venue name"
              />

              <Textarea
                label="Description *"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={errors.description}
                required
                rows={4}
                placeholder="Describe your venue..."
              />

              <Select
                label="Time Zone *"
                name="timeZone"
                value={formData.timeZone}
                onChange={handleChange}
                options={timeZoneOptions}
                required
              />
            </div>
          </div>
        </Card>

        {/* Address */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Street Address *"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  error={errors['address.street']}
                  required
                  placeholder="123 Main St"
                />
              </div>

              <Input
                label="City *"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                error={errors['address.city']}
                required
                placeholder="New York"
              />

              <Input
                label="State/Province *"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                error={errors['address.state']}
                required
                placeholder="NY"
              />

              <Input
                label="ZIP/Postal Code *"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                error={errors['address.zipCode']}
                required
                placeholder="10001"
              />

              <Input
                label="Country *"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                error={errors['address.country']}
                required
                placeholder="United States"
              />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Phone *"
                name="contact.phone"
                value={formData.contact.phone}
                onChange={handleChange}
                error={errors['contact.phone']}
                required
                placeholder="+1 (555) 000-0000"
              />

              <Input
                label="Email *"
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Capacity & Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Minimum Capacity *"
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
                label="Maximum Capacity *"
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
                label="Base Price *"
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
                      variant="purple"
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Operating Hours
            </h3>
            <div className="space-y-4">
              {daysOfWeek.map((day) => (
                <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-32">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
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
                    <span className="text-gray-500 dark:text-gray-400">to</span>
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
                    <span className="text-sm text-gray-600 dark:text-gray-400">Closed</span>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Subscription
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
                  <Badge variant="purple" className="mt-1">
                    {venue.subscription.plan}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <Badge 
                    variant={venue.subscription.status === 'active' ? 'success' : 'gray'} 
                    className="mt-1"
                  >
                    {venue.subscription.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1">
                    ${venue.subscription.amount}
                    <span className="text-sm text-gray-500">/
                      {venue.subscription.plan === 'monthly' ? 'mo' : 
                       venue.subscription.plan === 'annual' ? 'yr' : ''}
                    </span>
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
            loading={isSaving}
            size="lg"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VenueSettings;