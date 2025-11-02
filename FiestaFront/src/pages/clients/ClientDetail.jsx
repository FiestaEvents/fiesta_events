import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApi, useApiMutation } from '../../hooks/useApi';
import { clientService, eventService } from '../../api/index';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { 
  ArrowLeft, Edit, Trash2, Mail, Phone, MapPin,
  Building, Calendar, User, FileText, XCircle, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: client, loading, error } = useApi(() => clientService.getById(id));
  const { data: clientEvents } = useApi(() => 
    eventService.getAll({ clientId: id, limit: 100 })
  );
  
  const deleteMutation = useApiMutation(clientService.delete);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutate(id);
      toast.success('Client deleted successfully');
      navigate('/clients');
    } catch (error) {
      toast.error('Failed to delete client');
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'green' : 'gray';
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-6">
        <EmptyState
          icon={XCircle}
          title="Client Not Found"
          description="The client you're looking for doesn't exist or has been removed."
          action={{
            label: 'Back to Clients',
            onClick: () => navigate('/clients')
          }}
        />
      </div>
    );
  }

  const events = clientEvents?.data || [];
  const totalEvents = events.length;
  const completedEvents = events.filter(e => e.status === 'completed').length;
  const upcomingEvents = events.filter(e => 
    e.status === 'confirmed' || e.status === 'pending'
  ).length;
  const totalRevenue = events.reduce((sum, event) => 
    sum + (event.pricing?.totalAmount || 0), 0
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'events', label: 'Event History', icon: Calendar, count: totalEvents },
    { id: 'notes', label: 'Notes', icon: FileText }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/clients')}
            icon={ArrowLeft}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Client ID: {client._id?.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={Edit}
            onClick={() => navigate(`/clients/${id}/edit`)}
          >
            Edit Client
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge color={getStatusColor(client.status)} className="mt-2">
                {client.status}
              </Badge>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalEvents}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {upcomingEvents}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`
                    ml-2 py-0.5 px-2 rounded-full text-xs
                    ${activeTab === tab.id
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-100 text-gray-600'
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
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Email</p>
                      <a
                        href={`mailto:${client.email}`}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        {client.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Phone</p>
                      <a
                        href={`tel:${client.phone}`}
                        className="text-gray-900"
                      >
                        {client.phone}
                      </a>
                    </div>
                  </div>

                  {client.company && (
                    <div className="flex items-start">
                      <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="text-gray-900">{client.company}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {client.address && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Address
                  </h3>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="ml-3 text-gray-600">
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
              </Card>
            )}

            {client.tags && client.tags.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Client Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge color={getStatusColor(client.status)} className="mt-1">
                      {client.status}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Client Since</p>
                    <p className="text-gray-900 mt-1">
                      {formatDate(client.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-gray-900 mt-1">
                      {formatDate(client.updatedAt)}
                    </p>
                  </div>

                  {client.createdBy && (
                    <div>
                      <p className="text-sm text-gray-600">Added By</p>
                      <p className="text-gray-900 mt-1">{client.createdBy.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Events</span>
                    <span className="font-medium text-gray-900">{totalEvents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-medium text-gray-900">{completedEvents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Upcoming</span>
                    <span className="font-medium text-gray-900">{upcomingEvents}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="text-sm font-medium text-gray-900">Total Revenue</span>
                    <span className="font-bold text-gray-900">
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
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Event History
              </h3>
              <Button
                variant="primary"
                icon={Calendar}
                onClick={() => navigate('/events/new')}
              >
                Create Event
              </Button>
            </div>
            
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                  >
                    <div className="flex-1">
                      <Link
                        to={`/events/${event._id}`}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        {event.title}
                      </Link>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(event.startDate)}
                        </div>
                        <Badge color={getEventStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                        {event.type && (
                          <Badge color="gray">{event.type}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(event.pricing?.totalAmount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No Events"
                description="This client hasn't booked any events yet."
                action={{
                  label: 'Create Event',
                  onClick: () => navigate('/events/new')
                }}
              />
            )}
          </div>
        </Card>
      )}

      {activeTab === 'notes' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Notes
            </h3>
            {client.notes ? (
              <p className="text-gray-600 whitespace-pre-wrap">{client.notes}</p>
            ) : (
              <p className="text-gray-500 italic">No notes available for this client.</p>
            )}
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Client"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{client.name}</strong>? 
            This action cannot be undone.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                All events associated with this client will remain but will need to be reassigned.
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteMutation.loading}
            >
              Delete Client
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientDetail;