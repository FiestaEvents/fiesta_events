import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ChevronLeft, ChevronRight, Star, Phone, Mail, 
  MapPin, Globe, DollarSign, Calendar, ShieldCheck 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "../../../components/common/Button";

// Animation Variants for "Page Turn" effect
const pageVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 500 : -500,
    opacity: 0,
    scale: 0.95,
    rotateY: direction > 0 ? 15 : -15, // Slight 3D rotation
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      duration: 0.4,
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 500 : -500,
    opacity: 0,
    scale: 0.95,
    rotateY: direction < 0 ? 15 : -15,
    transition: { duration: 0.3 }
  })
};

const PartnerBookViewer = ({ isOpen, onClose, partners, startIndex }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [direction, setDirection] = useState(0);

  // Sync index when opening
  useEffect(() => {
    if (isOpen) setCurrentIndex(startIndex);
  }, [isOpen, startIndex]);

  // Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  const paginate = (newDirection) => {
    const nextIndex = currentIndex + newDirection;
    if (nextIndex >= 0 && nextIndex < partners.length) {
      setDirection(newDirection);
      setCurrentIndex(nextIndex);
    }
  };

  if (!isOpen) return null;

  const partner = partners[currentIndex];
  // Placeholder logic
  const coverImage = partner.portfolio?.[0]?.url || `https://source.unsplash.com/random/800x600/?${partner.category}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
      >
        <X size={24} />
      </button>

      {/* Navigation Arrows */}
      <button 
        className={`absolute left-4 md:left-10 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
        onClick={() => paginate(-1)}
        disabled={currentIndex === 0}
      >
        <ChevronLeft size={32} />
      </button>

      <button 
        className={`absolute right-4 md:right-10 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all ${currentIndex === partners.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
        onClick={() => paginate(1)}
        disabled={currentIndex === partners.length - 1}
      >
        <ChevronRight size={32} />
      </button>

      {/* The "Book" Container */}
      <div className="relative w-full max-w-5xl h-[85vh] perspective-1000">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full h-full flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* LEFT PAGE: Visuals */}
            <div className="w-full md:w-1/2 h-64 md:h-full relative bg-gray-100">
              <img 
                src={coverImage} 
                alt={partner.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-orange-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                    {partner.category}
                  </span>
                  <div className="flex items-center gap-1 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                    <Star size={12} fill="currentColor" /> {partner.rating?.toFixed(1)}
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">{partner.name}</h2>
                <p className="text-white/80 flex items-center gap-2 text-sm">
                  <MapPin size={14} /> {partner.city || "Tunis"}, {partner.country || "Tunisia"}
                </p>
              </div>
            </div>

            {/* RIGHT PAGE: Details (Menu Style) */}
            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed dark:bg-none">
              
              {/* Header Info */}
              <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                <div>
                   <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">{t('partners.catalog.about')}</h3>
                   <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base italic">
                     "{partner.description || t('partners.catalog.noDescription')}"
                   </p>
                </div>
              </div>

              {/* Pricing & Services */}
              <div className="space-y-6 flex-1">
                
                <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg text-orange-600 dark:text-orange-200">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">{t('partners.table.columns.price')}</p>
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        {partner.priceType === 'hourly' ? `${partner.hourlyRate} TND / Hr` : `${partner.fixedRate} TND`}
                      </p>
                    </div>
                  </div>
                  {partner.verified && (
                    <div className="flex flex-col items-end text-green-600 dark:text-green-400">
                      <ShieldCheck size={20} />
                      <span className="text-[10px] font-bold uppercase">Verified</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <Mail size={16} /> <span className="text-xs uppercase font-bold">Email</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={partner.email}>{partner.email || "-"}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <Phone size={16} /> <span className="text-xs uppercase font-bold">Phone</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{partner.phone || "-"}</p>
                  </div>
                </div>

                {/* Tags */}
                {partner.tags && partner.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {partner.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                 <Button variant="outline" className="flex-1 justify-center" onClick={() => window.open(`mailto:${partner.email}`)}>
                   {t('common.contact')}
                 </Button>
                 <Button variant="primary" className="flex-1 justify-center shadow-lg shadow-orange-500/30">
                   {t('partners.actions.bookNow')}
                 </Button>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Pagination dots at bottom */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {partners.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} 
          />
        ))}
      </div>
    </div>
  );
};

export default PartnerBookViewer;