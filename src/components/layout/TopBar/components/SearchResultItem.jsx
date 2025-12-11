import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const SearchResultItem = ({ item, onClick, config, t }) => {
  const Icon = config.icon;
  
  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onClick}
      className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-start gap-3 group transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
    >
      <div className={`p-2 rounded-lg bg-${config.color}-50 dark:bg-${config.color}-900/20 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-4 h-4 text-${config.color}-600 dark:text-${config.color}-400`} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {item.title || item.name || item.invoiceNumber}
        </p>
        {item.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
            {item.description}
          </p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </motion.button>
  );
};

export default SearchResultItem;