import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const SearchResultItem = ({ item, onClick, config }) => {
  const Icon = config.icon;
  
  //  FIX 1: Explicit mapping for Tailwind colors. 
  // Dynamic strings like `bg-${color}-50` don't work reliably in Tailwind JIT.
  const colorStyles = {
    blue:    "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    green:   "bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-400",
    purple:  "bg-purple-50 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    orange:  "bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    indigo:  "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
    yellow:  "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400",
    red:     "bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400",
  };

  const activeStyle = colorStyles[config.color] || colorStyles.blue;

  // Animation Variants
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.button
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      //  FIX 2: Moved background hover color to Tailwind classes for better Dark Mode support
      // Removed backgroundColor from here to let CSS handle the theme switch
      whileHover={{ 
        x: 6, 
        transition: { type: "spring", stiffness: 400, damping: 25 } 
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      //  FIX 3: Adjusted borders and hover backgrounds for Dark Mode (gray-700/800)
      className="w-full px-4 py-3 flex items-start gap-3 group transition-colors 
                 border-b border-gray-100 dark:border-gray-700 last:border-0 
                 hover:bg-gray-50 dark:hover:bg-gray-700/50"
    >
      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        //  FIX 4: Applied the mapped style object
        className={`p-2 rounded-lg flex-shrink-0 ${activeStyle}`}
      >
        <Icon className="w-4 h-4" />
      </motion.div>
      
      <div className="flex-1 text-left min-w-0">
        {/*  FIX 5: High contrast text for Dark Mode (white/gray-100) */}
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {item.title || item.name || item.invoiceNumber}
        </p>
        
        {/*  FIX 6: Lighter gray for description in Dark Mode (gray-400) */}
        {item.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
            {item.description}
          </p>
        )}
      </div>
      
      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0" />
    </motion.button>
  );
};

export default SearchResultItem;