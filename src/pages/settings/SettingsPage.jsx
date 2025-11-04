// src/pages/settings/SettingPage.jsx
import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { venueService } from '../../api/index';

const SettingPage = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await venueService.getAll();
      setVenues(res.data || []);
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError('Failed to load venues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleOpenModal = (venue = null) => {
    setSelectedVenue(venue);
    setFormData({
      name: venue?.name || '',
      address: venue?.address || '',
      city: venue?.city || '',
      state: venue?.state || '',
      zip: venue?.zip || '',
      country: venue?.country || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedVenue(null);
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      if (selectedVenue?.id) {
        await venueService.update(selectedVenue.id, formData);
      } else {
        await venueService.create(formData);
      }
      fetchVenues();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving venue:', err);
      setError('Failed to save venue.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Venue Settings</h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
            Manage your venues and update their settings
          </p>
        </div>
        <Button variant="outline" onClick={() => handleOpenModal()}>
          Add Venue
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {/* Venues List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <Card key={venue.id} className="p-6 space-y-2">
            <div className="text-gray-600 dark:text-gray-400 text-sm">Name</div>
            <div className="text-gray-900 dark:text-white font-semibold">{venue.name}</div>

            <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">Address</div>
            <div className="text-gray-900 dark:text-white">{venue.address}</div>

            <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">City</div>
            <div className="text-gray-900 dark:text-white">{venue.city}</div>

            <div className="flex justify-end mt-4 gap-2">
              <Button size="sm" variant="outline" onClick={() => handleOpenModal(venue)}>
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedVenue ? 'Edit Venue' : 'Add Venue'}
        >
          <div className="space-y-4">
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            <Input
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
            <Input
              label="ZIP"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
            />
            <Input
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
              <Button variant="primary" onClick={handleSave}>
                {selectedVenue ? 'Save Changes' : 'Add Venue'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SettingPage;
