import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar,
  Users,
  DollarSign,
  Clock,
  MapPin,
  FileText,
  User,
  Handshake,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  Button, 
  Badge, 
  Card,
  ConfirmModal,
  LoadingSpinner
} from '../../components/common';
import { useToast } from '../../components/common/ToastContainer';
import { eventService } from '../../api/index';
import { format } from 'date-fns';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventService.getById(id);
      setEvent(response.event || response);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error(error.message || 'Failed to load event details');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await eventService.delete(id);
      toast.success('Event deleted successfully');
      navigate('/events');
    } catch (error) {
      toast.error(error.message || 'Failed to delete event');
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'success',
      'in-progress': 'info',
      completed: 'default',
      cancelled: 'danger',
    };
    return <Badge variant={variants[status] || 'default'} size="lg">{status}</Badge>;
  };

  const getTypeBadge = (type) => {
    const variants = {
      wedding: 'primary',
      birthday: 'warning',
      corporate: 'info',
      conference: 'success',
      party: 'danger',
      other: 'default',
    };
    return <Badge variant={variants[type] || 'default'} size="lg">{type}</Badge>;
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading event details..." />;
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
        <p className="text-gray-600 mb-6">The event you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/events')}>Back to Events</Button>
      </div>
    );
  }

  const totalAmount = event.pricing?.totalAmount || 0;
  const paidAmount = event.paymentSummary?.paidAmount || 0;
  const remainingAmount = totalAmount - paidAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/events')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              {getTypeBadge(event.type)}
              {getStatusBadge(event.status)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={Edit}
            onClick={() => navigate(`/events/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={() => setDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card title="Event Information">
            <div className="space-y-4">
              {event.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-gray-900">{event.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(event.startDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(event.endDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Start Time</p>
                    <p className="font-medium text-gray-900">{event.startTime || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Time</p>
                    <p className="font-medium text-gray-900">{event.endTime || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Guest Count</p>
                    <p className="font-medium text-gray-900">{event.guestCount || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Requirements */}
          {event.requirements && (
            <Card title="Event Requirements">
              <div className="space-y-4">
                {event.requirements.setup && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Setup</label>
                    <p className="mt-1 text-gray-900">{event.requirements.setup}</p>
                  </div>
                )}
                {event.requirements.catering && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Catering</label>
                    <p className="mt-1 text-gray-900">{event.requirements.catering}</p>
                  </div>
                )}
                {event.requirements.decoration && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Decoration</label>
                    <p className="mt-1 text-gray-900">{event.requirements.decoration}</p>
                  </div>
                )}
                {event.requirements.audioVisual && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Audio/Visual</label>
                    <p className="mt-1 text-gray-900">{event.requirements.audioVisual}</p>
                  </div>
                )}
                {event.requirements.other && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Other</label>
                    <p className="mt-1 text-gray-900">{event.requirements.other}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Partners */}
          {event.partners && event.partners.length > 0 && (
            <Card title="Service Providers">
              <div className="space-y-3">
                {event.partners.map((partner, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Handshake className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{partner.partner?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{partner.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${partner.cost?.toLocaleString() || 0}</p>
                      <Badge variant={partner.status === 'completed' ? 'success' : 'warning'} size="sm">
                        {partner.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          {event.notes && (
            <Card title="Additional Notes">
              <p className="text-gray-900">{event.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card title="Client Information">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {event.client?.name || event.clientName || 'N/A'}
                </p>
                {event.client?.email && (
                  <p className="text-sm text-gray-600">{event.client.email}</p>
                )}
              </div>
            </div>
            {event.client?.phone && (
              <p className="text-sm text-gray-600">📞 {event.client.phone}</p>
            )}
          </Card>

          {/* Pricing Summary */}
          <Card title="Pricing Summary">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Base Price</span>
                <span className="font-medium text-gray-900">
                  ${event.pricing?.basePrice?.toLocaleString() || 0}
                </span>
              </div>

              {event.pricing?.additionalServices && event.pricing.additionalServices.length > 0 && (
                <>
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Additional Services</p>
                    {event.pricing.additionalServices.map((service, index) => (
                      <div key={index} className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">{service.name}</span>
                        <span className="text-gray-900">${service.price?.toLocaleString() || 0}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {event.pricing?.discount > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${event.pricing.discount.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total Amount</span>
                  <span className="text-purple-600">${totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Status */}
          <Card title="Payment Status">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Paid Amount</span>
                <span className="font-medium text-green-600">
                  ${paidAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Remaining</span>
                <span className="font-medium text-orange-600">
                  ${remainingAmount.toLocaleString()}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <Badge 
                  variant={event.paymentSummary?.status === 'paid' ? 'success' : 'warning'}
                  size="lg"
                >
                  {event.paymentSummary?.status || 'pending'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="space-y-2">
              <Button
                variant="outline"
                fullWidth
                icon={CheckCircle}
                onClick={() => toast.info('Feature coming soon')}
              >
                Mark as Completed
              </Button>
              <Button
                variant="outline"
                fullWidth
                icon={DollarSign}
                onClick={() => navigate(`/payments/create?eventId=${id}`)}
              >
                Add Payment
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone and will remove all associated data."
        confirmText="Delete Event"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default EventDetails;