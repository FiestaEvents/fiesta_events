import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      // 1. Start state: Invisible, smaller (0.95), and lower (y: 20)
      initial={{ opacity: 0, scale: 0.95, y: 20 }} 
      
      // 2. End state: Fully visible, normal size, back to position
      animate={{ opacity: 1, scale: 1, y: 0 }}   
      
      // 3. Exit state: Invisible and drops down
      exit={{ opacity: 0, y: 20 }}   
      
      // 4. TRANSITION SETTINGS (The important part)
      transition={{ 
        duration: 0.6, // Slowed down to 0.6s (easy to see)
        ease: [0.3, 1, 0.3, 1] // Custom "cubic-bezier" for a premium feel
      }} 
      
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;