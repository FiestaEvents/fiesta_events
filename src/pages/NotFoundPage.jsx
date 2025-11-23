// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { FileQuestion } from 'lucide-react'; 
import Button from '../components/common/Button';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center max-w-md mx-auto">
        
        {/* Icon with Brand Styling */}
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-full ring-1 ring-orange-100 dark:ring-orange-800/30">
            <FileQuestion className="w-16 h-16 text-orange-500" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {t('notFound.title', 'Page Not Found')}
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          {t('notFound.message', "Oops! The page you are looking for doesn't exist or has been moved.")}
        </p>
        
        <Link to="/">
          <Button size="lg" variant="primary">
            {t('notFound.goToDashboard', 'Back to Dashboard')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;