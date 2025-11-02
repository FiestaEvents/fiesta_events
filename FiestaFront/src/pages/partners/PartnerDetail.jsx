import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApi, useApiMutation } from '../../hooks/useApi';
import { partnerService, eventService } from '../../api/index';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { 
  ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, 
  Building, Star, Briefcase, Calendar, DollarSign,
  TrendingUp, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PartnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: partner, loading, error, refetch } = useApi(() => partnerService.getById(id));
  const { data: relatedEvents } = useApi(() => 
    eventService.getAll({ partnerId: id, limit: 50 })
  );

  const deleteMutation = useMutation(partnerService.delete);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutate(id);
      toast.success('Partner deleted successfully');
      navigate('/partners');
    } catch (error) {
      toast.error('Failed to delete partner');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      catering: 'blue',
      decoration: 'pink',
      photography: 'purple',
      music: 'indigo',
      security: 'red',
      cleaning: 'green',
      audio_visual: 'yellow',
      floral: 'pink',
      entertainment: 'orange',
      other: 'gray'
    };
    return colors[category] || 'gray';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'green' : 'gray';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="p-6">
        <EmptyState
          icon={XCircle}
          title="Partner Not Found"
          description="The partner you're looking for doesn't exist or has been removed."
          action={{
            label: 'Back to Partners',
            onClick: () => navigate('/partners')
          }}
        />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Briefcase },
    { id: 'events', label: 'Events', icon: Calendar, count: relatedEvents?.data?.length || 0 },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/partners')}
            icon={ArrowLeft}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Partner ID: {partner._id?.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={Edit}
            onClick={() => navigate(`/partners/${id}/edit`)}
          >
            Edit Partner
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

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <div className="mt-2">
                <Badge color={getStatusColor(partner.status)}>
                  {partner.status}
                </Badge>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {partner.totalJobs || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rating</p>
              <div className="flex items-center mt-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <p className="text-2xl font-bold text-gray-900 ml-2">
                  {partner.rating?.toFixed(1) || '0.0'}
                </p>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hourly Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {partner.hourlyRate ? formatCurrency(partner.hourlyRate) : 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
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
                        href={`mailto:${partner.email}`}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        {partner.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Phone</p>
                      <a
                        href={`tel:${partner.phone}`}
                        className="text-gray-900"
                      >
                        {partner.phone}
                      </a>
                    </div>
                  </div>

                  {partner.company && (
                    <div className="flex items-start">
                      <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="text-gray-900">{partner.company}</p>
                      </div>
                    </div>
                  )}

                  {partner.location && (
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="text-gray-900">{partner.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {partner.address && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Address
                  </h3>
                  <div className="text-gray-600">
                    {partner.address.street && <p>{partner.address.street}</p>}
                    <p>
                      {[
                        partner.address.city,
                        partner.address.state,
                        partner.address.zipCode
                      ].filter(Boolean).join(', ')}
                    </p>
                    {partner.address.country && <p>{partner.address.country}</p>}
                  </div>
                </div>
              </Card>
            )}

            {partner.notes && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Notes
                  </h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{partner.notes}</p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <Badge color={getCategoryColor(partner.category)} className="mt-1">
                      {partner.category.replace('_', ' ')}
                    </Badge>
                  </div>

                  {partner.specialties && (
                    <div>
                      <p className="text-sm text-gray-600">Specialties</p>
                      <p className="text-gray-900 mt-1">{partner.specialties}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="text-gray-900 mt-1">
                      {formatDate(partner.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-gray-900 mt-1">
                      {formatDate(partner.updatedAt)}
                    </p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Related Events
            </h3>
            {relatedEvents?.data?.length > 0 ? (
              <div className="space-y-4">
                {relatedEvents.data.map((event) => (
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
                        <Badge color={event.status === 'completed' ? 'green' : 'blue'}>
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                    {event.partners?.find(p => p.partner === id)?.cost && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Cost</p>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(event.partners.find(p => p.partner === id).cost)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No Events"
                description="This partner hasn't been assigned to any events yet."
              />
            )}
          </div>
        </Card>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Performance Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Jobs Completed</span>
                  <span className="font-semibold text-gray-900">
                    {partner.totalJobs || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Rating</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-semibold text-gray-900">
                      {partner.rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-semibold text-gray-900">
                    {partner.totalJobs > 0 
                      ? `${((relatedEvents?.data?.filter(e => e.status === 'completed').length || 0) / partner.totalJobs * 100).toFixed(0)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Financial Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Hourly Rate</span>
                  <span className="font-semibold text-gray-900">
                    {partner.hourlyRate ? formatCurrency(partner.hourlyRate) : 'Not set'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Revenue Generated</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(
                      relatedEvents?.data?.reduce((sum, event) => {
                        const partnerData = event.partners?.find(p => p.partner === id);
                        return sum + (partnerData?.cost || 0);
                      }, 0) || 0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Partner"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{partner.name}</strong>? 
            This action cannot be undone.
          </p>
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
              Delete Partner
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PartnerDetail;