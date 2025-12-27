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
    wedding: "#9333ea",
    corporate: "#2563eb",
    birthday: "#db2777",
    conference: "#16a34a",
    party: "#ea580c",
    other: "#4b5563",
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
  const { i18n } = useTranslation();
  const { isRTL } = useLanguage();

  const calendarEvents = events.map((event) => ({
    id: event._id || event.id,
    title: event.title,
    start: event.startDate
      ? new Date(event.startDate).toISOString()
      : undefined,
    end: event.endDate ? new Date(event.endDate).toISOString() : undefined,
    backgroundColor: getTypeColor(event.type),
    borderColor: getTypeColor(event.type),
    extendedProps: { ...event },
    className: event.status === "draft" ? "fc-event-draft" : "",
  }));

  const renderEventContent = (eventInfo) => {
    return (
      <div className="w-full overflow-hidden px-1.5 py-1 flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate">
          <Clock size={10} className="shrink-0 opacity-80" />
          <span className="truncate">
            {eventInfo.timeText && (
              <span className="opacity-80 mr-1">{eventInfo.timeText}</span>
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

        /* Grid Styling & Hover Effects */
        .fc-col-header-cell-cushion { color: #6b7280; text-transform: uppercase; font-size: 0.75rem; font-weight: 600; padding: 12px 0 !important; }
        .dark .fc-col-header-cell-cushion { color: #9ca3af; }
        
        .fc-daygrid-day-number { color: #4b5563; font-weight: 500; font-size: 0.875rem; padding: 8px !important; }
        .dark .fc-daygrid-day-number { color: #d1d5db; }

        /* Day Cell Hover Animation */
        .fc-daygrid-day { transition: background-color 0.2s ease; }
        .fc-daygrid-day:hover { background-color: #f9fafb; cursor: pointer; }
        .dark .fc-daygrid-day:hover { background-color: #374151; }

        .fc-day-today { background-color: #fff7ed !important; }
        .dark .fc-day-today { background-color: #431407 !important; }

        /* Event Styling & Hover Animation */
        .fc-event { 
          border: none; 
          border-radius: 6px; 
          box-shadow: 0 1px 2px rgba(0,0,0,0.1); 
          margin-bottom: 2px; 
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .fc-event:hover { 
          transform: translateY(-2px) scale(1.02); 
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          z-index: 50; 
          filter: brightness(1.05);
        }

        .fc-event-draft { opacity: 0.7; border: 2px dashed rgba(255,255,255,0.6); }

        /* List View Polish */
        .fc-list-event:hover td { background-color: #f3f4f6 !important; }
        .dark .fc-list-event:hover td { background-color: #374151 !important; }
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
        moreLinkClassNames="text-xs font-semibold text-orange-600 hover:underline px-2"
      />
    </div>
  );
};

export default EventCalendar;
