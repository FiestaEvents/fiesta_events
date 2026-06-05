// StatCard.jsx
import React from 'react';
import { CountUp } from '../common/CountUp.jsx';

const StatCard = ({ title, value, icon: Icon, color = "blue", subValue }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-rose-50 text-rose-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${colors[color] || colors.blue}`}>
          <Icon size={22} />
        </div>
        {/* Optional Trend indicator could go here */}
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'number' ? <CountUp end={value} duration={2} /> : value}
        </h3>
        <p className="text-sm text-gray-500 font-medium mt-1">{title}</p>
        {subValue && <p className="text-xs text-gray-400 mt-2">{subValue}</p>}
      </div>
    </div>
  );
};

export default StatCard;