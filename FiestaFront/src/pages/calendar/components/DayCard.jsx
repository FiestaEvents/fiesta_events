import React from "react";
import Button from "../../../components/common/Button";

const DayCard = ({ day, events = [], onAddEvent }) => {
  const dayString = day.toLocaleDateString(undefined, { day: "numeric", month: "short" });

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">{dayString}</span>
        <Button size="sm" onClick={() => onAddEvent(day)}>
          +
        </Button>
      </div>
      {events.length === 0 ? (
        <p className="text-gray-400 text-sm">No events</p>
      ) : (
        <ul className="space-y-1">
          {events.map((ev) => (
            <li key={ev.id} className="text-sm text-gray-700 dark:text-gray-200">
              {ev.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DayCard;
