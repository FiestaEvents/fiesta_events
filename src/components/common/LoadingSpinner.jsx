import React from "react";
import { motion } from "framer-motion";

const OrbitLoader = ({ size = "md" }) => {
  const sizes = {
    sm: "w-12 h-12 text-2xl",
    md: "w-20 h-20 text-4xl",
    lg: "w-32 h-32 text-6xl",
  };

  return (
    <div className={`relative flex items-center justify-center ${sizes[size]}`}>
      {/* Outer Ring */}
      <motion.span
        className="absolute inset-0 rounded-full border-4 border-t-orange-500 border-r-orange-500 border-b-orange-100 border-l-orange-100"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Inner Ring (Reverse spin) */}
      <motion.span
        className="absolute inset-2 rounded-full border-4 border-t-orange-100 border-r-orange-100 border-b-orange-400 border-l-orange-400 opacity-80"
        animate={{ rotate: -360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />

      {/* The F Logo */}
      <div className="relative z-10 font-black text-orange-600 select-none pb-1 pr-1" style={{ fontFamily: '"Comic Sans MS", cursive, sans-serif' }}>
        F
      </div>
    </div>
  );
};

export default OrbitLoader;