// pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { useTranslation } from "react-i18next"; 

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          {t('notFound.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          {t('notFound.message')}
        </p>
        <Link to="/">
          <Button>{t('notFound.goToDashboard')}</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;