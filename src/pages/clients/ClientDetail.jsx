import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { clientService, eventService } from '../../api/index';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin,
  Building, 
  Calendar, 
  User, 
  FileText, 
  XCircle, 
  AlertCircle,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get client data from route state if available (for faster loading)
  const routeClient = location.state?.client;
  
  // State for client and events data
  const [client, setClient] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Fetch client events separately
  const fetchClientEvents = async (clientId) => {
    try {
      setEventsLoading(true);
      console.log('📅 Fetching events for client:', clientId);
      
      const eventsResponse = await eventService.getAll({ 
        clientId: clientId, 
        limit: 100,
        page: 1 
      });
      console.log('📅 Events API response:', eventsResponse);
      
      let eventsData = [];
      
      if (eventsResponse?.data?.data?.events) {
        eventsData = eventsResponse.data.data.events;
      } else if (eventsResponse?.data?.events) {
        eventsData = eventsResponse.data.events;
      } else if (eventsResponse?.events) {
        eventsData = eventsResponse.events;
      } else if (Array.isArray(eventsResponse?.data)) {
        eventsData = eventsResponse.data;
      } else if (Array.isArray(eventsResponse)) {
        eventsData = eventsResponse;
      }
      
      console.log('📅 Extracted events:', eventsData);
      setEvents(eventsData);
    } catch (eventsError) {
      console.error('❌ Error fetching events:', eventsError);
      // Don't fail the whole page if events fail to load
      setEvents([]);
      toast.error('Failed to load client events');
    } finally {
      setEventsLoading(false);
    }
  };

  // Fetch client details
  const fetchClientData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // If client data was passed via route state, use it directly
      if (routeClient && routeClient._id === id) {
        console.log('📋 Using client data from route state:', routeClient);
        setClient(routeClient);
        
        // Fetch events for this client
        await fetchClientEvents(id);
      } else {
        // Otherwise fetch client data from API
        console.log('🔄 Fetching client details for ID:', id);
        
        const clientResponse = await clientService.getById(id);
        console.log('📋 Client API response:', clientResponse);
        
        let clientData = null;
        
        // Handle different response structures
        if (clientResponse?.data?.data) {
          clientData = clientResponse.data.data;
        } else if (clientResponse?.data) {
          clientData = clientResponse.data;
        } else if (clientResponse) {
          clientData = clientResponse;
        }
        
        if (!clientData || !clientData._id) {
          throw new Error('Client not found');
        }
        
        console.log('📋 Extracted client data:', clientData);
        setClient(clientData);
        
        // Fetch events for this client
        await fetchClientEvents(id);
      }
      
    } catch (err) {
      console.error('❌ Error fetching client:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load client details';
      setError(errorMessage);
      setClient(null);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setHasInitialLoad(true);
    }
  };

  useEffect(() => {
    if (id) {
      fetchClientData();
    }
  }, [id]);

  // Delete client function
  const handleDelete = async () => {
    try {
      setDeleting(true);
      console.log('🗑️ Deleting client:', id);
      
      await clientService.delete(id);
      
      toast.success('Client deleted successfully');
      navigate('/clients');
      
    } catch (err) {
      console.error('❌ Error deleting client:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete client';
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Utility functions
  const getStatusColor = (status) => {
    const colors = {
      active: 'green',
      inactive: 'gray',
      prospect: 'yellow',
      archived: 'red'
    };
    return colors[status?.toLowerCase()] || 'gray';
  };

  const getEventStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      confirmed: 'blue',
      'in-progress': 'purple',
      completed: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Calculate statistics
  const totalEvents = events.length;
  const completedEvents = events.filter(e => e.status === 'completed').length;
  const upcomingEvents = events.filter(e => 
    ['confirmed', 'pending', 'in-progress'].includes(e.status)
  ).length;
  
  const totalRevenue = events.reduce((sum, event) => {
    const eventTotal = event.pricing?.totalAmount || 
                      (parseFloat(event.pricing?.basePrice) || 0);
    return sum + eventTotal;
  }, 0);

  const averageRevenue = totalEvents > 0 ? totalRevenue / totalEvents : 0;

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'events', label: 'Event History', icon: Calendar, count: totalEvents },
    { id: 'notes', label: 'Notes', icon: FileText }
  ];

  // Loading state
  if (loading && !hasInitialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-gray-600 dark:text-gray-400">Loading client data...</p>
      </div>
    );
  }

  // Error state
  if (error || !client) {
    return (
      <div className="p-6">
        <EmptyState
          icon={XCircle}
          title="Client Not Found"
          description={error || "The client you're looking for doesn't exist or has been removed."}
          action={{
            label: 'Back to Clients',
            onClick: () => navigate('/clients')
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/clients')}
            icon={ArrowLeft}
          >
            Back to Clients
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {client.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Client ID: {client._id?.slice(-8).toUpperCase() || 'N/A'}
              {routeClient && <span className="text-green-600 ml-2">• Loaded from cache</span>}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={Edit}
            onClick={() => navigate(`/clients/${id}/edit`, { state: { client } })}
          >
            Edit Client
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
              <div className="mt-2">
                <Badge color={getStatusColor(client.status)}>
                  {client.status?.charAt(0).toUpperCase() + client.status?.slice(1) || 'Unknown'}
                </Badge>
              </div>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {totalEvents}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {upcomingEvents}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <Card>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`
                      ml-2 py-0.5 px-2 rounded-full text-xs font-medium
                      ${activeTab === tab.id
                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }
                    `}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    {client.email && (
                      <div className="flex items-start">
                        <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="ml-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                          <a
                            href={`mailto:${client.email}`}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                          >
                            {client.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {client.phone && (
                      <div className="flex items-start">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="ml-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                          <a
                            href={`tel:${client.phone}`}
                            className="text-gray-900 dark:text-white"
                          >
                            {client.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {client.company && (
                      <div className="flex items-start">
                        <Building className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="ml-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Company</p>
                          <p className="text-gray-900 dark:text-white">{client.company}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address */}
                {client.address && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Address
                    </h3>
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="ml-3 text-gray-600 dark:text-gray-400">
                        {client.address.street && <p>{client.address.street}</p>}
                        <p>
                          {[
                            client.address.city,
                            client.address.state,
                            client.address.zipCode
                          ].filter(Boolean).join(', ')}
                        </p>
                        {client.address.country && <p>{client.address.country}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {client.tags && client.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {client.tags.map((tag, index) => (
                        <Badge key={index} color="purple">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Client Details */}
                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Client Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                        <div className="mt-1">
                          <Badge color={getStatusColor(client.status)}>
                            {client.status?.charAt(0).toUpperCase() + client.status?.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Client Since</p>
                        <p className="text-gray-900 dark:text-white mt-1">
                          {formatDate(client.createdAt)}
                        </p>
                      </div>

                      {client.updatedAt && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                          <p className="text-gray-900 dark:text-white mt-1">
                            {formatDate(client.updatedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Event Statistics
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Events</span>
                        <span className="font-medium text-gray-900 dark:text-white">{totalEvents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                        <span className="font-medium text-gray-900 dark:text-white">{completedEvents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Upcoming</span>
                        <span className="font-medium text-gray-900 dark:text-white">{upcomingEvents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Revenue</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(averageRevenue)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Total Revenue</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(totalRevenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Event History ({totalEvents} events)
                </h3>
                <Button
                  variant="primary"
                  icon={Calendar}
                  onClick={() => navigate('/events/new', { state: { clientId: id } })}
                >
                  Create Event
                </Button>
              </div>
              
              {eventsLoading ? (
                <div className="text-center py-8">
                  <LoadingSpinner size="md" />
                  <p className="mt-3 text-gray-600 dark:text-gray-400">Loading events...</p>
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                    >
                      <div className="flex-1 mb-3 sm:mb-0">
                        <Link
                          to={`/events/${event._id}`}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium block"
                        >
                          {event.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(event.startDate)}
                          </div>
                          <Badge color={getEventStatusColor(event.status)}>
                            {event.status?.charAt(0).toUpperCase() + event.status?.slice(1) || 'Unknown'}
                          </Badge>
                          {event.type && (
                            <Badge color="gray">{event.type}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(event.pricing?.totalAmount || event.pricing?.basePrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="No Events Found"
                  description="This client hasn't booked any events yet."
                  action={{
                    label: 'Create First Event',
                    onClick: () => navigate('/events/new', { state: { clientId: id } })
                  }}
                />
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notes
              </h3>
              {client.notes ? (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {client.notes}
                  </p>
                </div>
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No Notes"
                  description="No notes have been added for this client yet."
                  size="sm"
                />
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Client"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{client.name}</strong>? 
            This action cannot be undone.
          </p>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300">
                All events associated with this client will remain in the system but will need to be reassigned to another client.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Client'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientDetail;