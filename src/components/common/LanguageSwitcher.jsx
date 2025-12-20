import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { GlobeIcon } from "lucide-react";

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇹🇳' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200
          border border-transparent hover:border-gray-200 dark:hover:border-gray-700
          hover:bg-white/50 dark:hover:bg-gray-800/50 hover:shadow-sm backdrop-blur-sm
          text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white
          ${isOpen ? 'bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700' : ''}
        `}
      >
        <GlobeIcon className={`h-5 w-5 transition-colors ${isOpen ? 'text-orange-500' : 'text-gray-500'}`} />
        
        <span className="text-sm font-semibold tracking-wide">
          {currentLang?.code.toUpperCase()}
        </span>
        
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180 text-orange-500' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div
        className={`
          absolute right-0 mt-2 w-48 py-2
          bg-white dark:bg-gray-800 
          border border-gray-100 dark:border-gray-700 
          rounded-xl shadow-xl 
          origin-top-right transition-all duration-200 ease-out z-50
          ${isOpen ? 'transform scale-100 opacity-100 translate-y-0' : 'transform scale-95 opacity-0 -translate-y-2 pointer-events-none'}
        `}
      >
        <div className="px-2 space-y-1">
          {languages.map((language) => {
            const isActive = currentLanguage === language.code;
            return (
              <button
                key={language.code}
                onClick={() => {
                  changeLanguage(language.code);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-150 group
                  ${isActive 
                    ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg leading-none filter drop-shadow-sm">{language.flag}</span>
                  <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {language.name}
                  </span>
                </div>

                {isActive && (
                  <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;