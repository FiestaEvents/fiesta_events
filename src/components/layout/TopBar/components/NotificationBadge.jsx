import React from "react";
import { motion } from "framer-motion";

const NotificationBadge = ({ count }) => {
  if (!count || count === 0) return null;
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center"
    >
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center text-[10px] font-bold text-white shadow-sm">
        {count > 9 ? "9+" : count}
      </span>
    </motion.span>
  );
};

export default NotificationBadge;