import React from "react";

type BadgeColor = "orange" | "yellow" | "red" | "blue" | "gray";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  orange: "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/20",
  yellow: "bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-300 dark:ring-yellow-400/20",
  red: "bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20",
  gray: "bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-500/10 dark:text-gray-300 dark:ring-gray-400/20",
};

const Badge: React.FC<BadgeProps> = ({
  children,
  color = "orange",
  className = "",
}) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colorClasses[color]} ${className}`.trim()}
  >
    {children}
  </span>
);

export default Badge;