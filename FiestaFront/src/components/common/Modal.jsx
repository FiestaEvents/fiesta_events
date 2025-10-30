import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { eventService } from '../../api/index';
import { format } from 'date-fns';
import Button from '../../components/common/Button';
import { PlusIcon } from 'lucide-react';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    location: '',
    description: '',
    status: 'pending',
  });

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventService.getAll();
        setEvents(response.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  // Events for the selected date
  const eventsForDate = events.filter(event => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getFullYear() === selectedDate.getFullYear() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getDate() === selectedDate.getDate()
    );
  });

  // Calendar tile content (colored dots)
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayEvents = events.filter(ev => {
        const evDate = new Date(ev.date);
        return (
          evDate.getFullYear() === date.getFullYear() &&
          evDate.getMonth() === date.getMonth() &&
          evDate.getDate() === date.getDate()
        );
      });
      if (dayEvents.length > 0) {
        return (
          <div className="flex justify-center mt-1 space-x-1">
            {dayEvents.slice(0, 3).map((ev, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  ev.status === 'confirmed'
                    ? 'bg-green-500'
                    : ev.status === 'pending'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
              ></span>
            ))}
            {dayEvents.length > 3 && <span className="text-xs text-gray-500">...</span>}
          </div>
        );
      }
    }
    return null;
  };

  // Handle date click
  const handleDateClick = date => {
    setSelectedDate(date);
    setDayModalOpen(true);
  };

  // Handle form input change
  const handleChange = e => {
    setNewEvent(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle create event submit
  const handleCreateEvent = async () => {
    try {
      const payload = { ...newEvent, date: selectedDate.toISOString() };
      const response = await eventService.create(payload);
      setEvents(prev => [...prev, response.data]);
      setCreateModalOpen(false);
      setNewEvent({ title: '', location: '', description: '', status: 'pending' });
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
          View your event schedule at a glance.
        </p>
      </div>

      {/* Calendar */}
      <Card className="p-6">
        <Calendar
          onChange={handleDateClick}
          value={selectedDate}
          className="rounded-xl border border-gray-200 dark:border-gray-700 text-lg"
          tileContent={tileContent}
        />
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Events on {format(selectedDate, 'PPP')}
        </h2>
        {eventsForDate.length > 0 ? (
          eventsForDate.map(event => (
            <Card
              key={event._id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedEvent(event)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{event.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{event.location}</p>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {format(new Date(event.date), 'p')}
                </span>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-gray-600 dark:text-gray-300">No events scheduled for this day.</p>
          </Card>
        )}
      </div>

      {/* Day modal */}
      <Modal
        isOpen={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        title={`Events on ${format(selectedDate, 'PPP')}`}
        className="transition-transform transform scale-95 opacity-0 animate-fade-in"
      >
        <div className="relative">
          {/* Create Event Button top-right */}
          <div className="absolute top-0 right-0 -mt-12">
            <Button
              variant="primary"
              icon={<PlusIcon className="h-4 w-4 mr-1" />}
              onClick={() => setCreateModalOpen(true)}
              size="sm"
            >
              Create Event
            </Button>
          </div>

          <div className="space-y-4 mt-2">
            {eventsForDate.length > 0 ? (
              eventsForDate.map(event => (
                <Card
                  key={event._id}
                  className="flex justify-between items-center cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedEvent(event);
                    setDayModalOpen(false);
                  }}
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{event.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{event.location}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {format(new Date(event.date), 'p')}
                  </span>
                </Card>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-300">No events scheduled for this day.</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Single event modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || ''}
        className="transition-transform transform scale-95 opacity-0 animate-fade-in"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <p>
              <span className="font-semibold">Date:</span> {format(new Date(selectedEvent.date), 'PPP p')}
            </p>
            <p>
              <span className="font-semibold">Location:</span> {selectedEvent.location}
            </p>
            <p>
              <span className="font-semibold">Description:</span> {selectedEvent.description || 'No description'}
            </p>
            {selectedEvent.status && (
              <p>
                <span className="font-semibold">Status:</span>{' '}
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    selectedEvent.status === 'confirmed'
                      ? 'bg-green-50 text-green-500'
                      : selectedEvent.status === 'pending'
                      ? 'bg-yellow-50 text-yellow-500'
                      : 'bg-red-50 text-red-500'
                  }`}
                >
                  {selectedEvent.status}
                </span>
              </p>
            )}
            <div className="flex gap-2 mt-2">
              <Button onClick={() => alert('Edit event logic here')} size="sm">
                Edit
              </Button>
              <Button onClick={() => alert('Delete event logic here')} variant="outline" size="sm">
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Event Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={`Create Event on ${format(selectedDate, 'PPP')}`}
        className="transition-transform transform scale-95 opacity-0 animate-fade-in"
      >
        <div className="space-y-4">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-200">Title</label>
            <input
              type="text"
              name="title"
              value={newEvent.title}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-200">Location</label>
            <input
              type="text"
              name="location"
              value={newEvent.location}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-200">Description</label>
            <textarea
              name="description"
              value={newEvent.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-200">Status</label>
            <select
              name="status"
              value={newEvent.status}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateEvent}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CalendarPage;
