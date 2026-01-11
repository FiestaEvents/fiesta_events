import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../../context/LanguageContext";
import { Users, Clock } from "lucide-react";

// Event Type Colors
const getTypeColor = (type) => {
  const map = {
    wedding: "#9333ea", // Purple
    corporate: "#2563eb", // Blue
    birthday: "#db2777", // Pink
    conference: "#16a34a", // Green
    party: "#ea580c", // Orange
    other: "#4b5563", // Gray
  };
  return map[type?.toLowerCase()] || "#4b5563";
};

const EventCalendar = ({
  calendarRef,
  events,
  onEventClick,
  onDateClick,
  onEventDrop,
  onDatesSet,
}) => {
  const { i18n, t } = useTranslation();
  const { isRTL } = useLanguage();

  const calendarEvents = events.map((event) => {
    const color = getTypeColor(event.type);
    return {
      id: event._id || event.id,
      title: event.title,
      start: event.startDate
        ? new Date(event.startDate).toISOString()
        : undefined,
      end: event.endDate ? new Date(event.endDate).toISOString() : undefined,
      // Pass color as a standard prop so we can access it in render
      backgroundColor: color,
      borderColor: color,
      textColor: "#ffffff",
      extendedProps: {
        ...event,
        // Pass color again in extendedProps to be 100% sure we can access it
        eventColor: color,
      },
      className: event.status === "draft" ? "fc-event-draft" : "",
    };
  });

  //  FIX: Apply background color directly to the inner container
  const renderEventContent = (eventInfo) => {
    // Fallback to extendedProps color if standard prop isn't available immediately
    const color =
      eventInfo.event.backgroundColor ||
      eventInfo.event.extendedProps.eventColor ||
      "#4b5563";

    return (
      <div
        className="w-full h-full overflow-hidden px-2 py-1 flex flex-col gap-0.5 rounded-md shadow-sm transition-transform hover:scale-[1.02]"
        style={{
          backgroundColor: color,
          borderLeft: `3px solid rgba(0,0,0,0.2)`,
        }}
      >
        <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate">
          <Clock size={10} className="shrink-0 opacity-90" />
          <span className="truncate">
            {eventInfo.timeText && (
              <span className="opacity-90 mr-1">{eventInfo.timeText}</span>
            )}
            {eventInfo.event.title}
          </span>
        </div>
        {eventInfo.view.type !== "dayGridMonth" && (
          <div className="flex items-center gap-1 text-[10px] text-white/90">
            <Users size={10} /> {eventInfo.event.extendedProps.guestCount || 0}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`h-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 ${isRTL ? "direction-rtl" : ""}`}
    >
      <style>{`
        .fc { font-family: inherit; --fc-border-color: #e5e7eb; }
        .dark .fc { --fc-border-color: #374151; --fc-page-bg-color: #1f2937; --fc-neutral-bg-color: #374151; }
        
        /* Hide Default Header */
        .fc-header-toolbar { display: none !important; }

        /* Grid Styling */
        .fc-col-header-cell-cushion { color: #6b7280; text-transform: uppercase; font-size: 0.75rem; font-weight: 600; padding: 12px 0 !important; }
        .dark .fc-col-header-cell-cushion { color: #9ca3af; }
        
        .fc-daygrid-day-number { color: #4b5563; font-weight: 500; font-size: 0.875rem; padding: 8px !important; }
        .dark .fc-daygrid-day-number { color: #d1d5db; }

        .fc-day-today { background-color: #fff7ed !important; }
        .dark .fc-day-today { background-color: #431407 !important; }

        /*  Event Container Reset */
        /* We remove default FullCalendar styling so our custom div takes full control */
        .fc-event { 
          background: transparent !important;
          border: none !important; 
          box-shadow: none !important;
          margin-bottom: 2px;
        }
        
        .fc-daygrid-event { white-space: normal !important; align-items: stretch; }
        .fc-event-main { padding: 0 !important; }

        .fc-event-draft { opacity: 0.7; }
        
        /* List View Polish */
        .fc-list-event:hover td { background-color: #f3f4f6 !important; }
        .dark .fc-list-event:hover td { background-color: #374151 !important; }
        
        .fc-daygrid-more-link {
            color: #ea580c !important;
            font-weight: 600 !important;
            font-size: 0.75rem !important;
        }
      `}</style>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={false}
        locale={i18n.language}
        direction={isRTL ? "rtl" : "ltr"}
        events={calendarEvents}
        eventContent={renderEventContent}
        eventClick={(info) => onEventClick(info.event.extendedProps)}
        dateClick={(info) => onDateClick && onDateClick(info.date)}
        datesSet={onDatesSet}
        editable={true}
        eventDrop={onEventDrop}
        height="100%"
        dayMaxEvents={3}
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
        moreLinkContent={(args) =>
          t("eventList.calendar.moreEvents", { count: args.num })
        }
      />
    </div>
  );
};

export default EventCalendar;
