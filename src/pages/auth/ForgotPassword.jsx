import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { authService } from '../../api/index';

// ============================================
// ANIMATION VARIANTS
// ============================================
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const messageVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const helpTextVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.3 } }
};

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * Back to Login Button Component
 */
const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors mb-6 group"
  >
    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
    Back to Login
  </button>
);

/**
 * Icon Header Component
 */
const IconHeader = () => (
  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-6">
    <Mail className="w-8 h-8 text-orange-600 dark:text-orange-400" />
  </div>
);

/**
 * Page Header Component
 */
const PageHeader = () => (
  <>
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
      Forgot Password?
    </h1>
    <p className="text-sm text-gray-600 dark:text-gray-300 mb-8">
      No worries! Enter your email address and we'll send you a link to reset your password.
    </p>
  </>
);

/**
 * Success Message Component
 */
const SuccessMessage = ({ message }) => (
  <motion.div
    variants={messageVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="mb-6 w-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start"
  >
    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-sm font-medium text-green-900 dark:text-green-100">
        Email Sent Successfully!
      </p>
      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
        {message}
      </p>
    </div>
  </motion.div>
);

/**
 * Error Message Component
 */
const ErrorMessage = ({ message }) => (
  <motion.div
    variants={messageVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="mb-6 w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start"
  >
    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-sm font-medium text-red-900 dark:text-red-100">
        Error
      </p>
      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
        {message}
      </p>
    </div>
  </motion.div>
);

/**
 * Footer Component
 */
const Footer = ({ onLoginClick }) => (
  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
    <p className="text-sm text-center text-gray-600 dark:text-gray-400">
      Remembered your password?{' '}
      <button
        onClick={onLoginClick}
        className="text-orange-600 dark:text-orange-400 font-medium hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
      >
        Sign in
      </button>
    </p>
  </div>
);

/**
 * Help Text Component
 */
const HelpText = () => (
  <motion.div
    variants={helpTextVariants}
    initial="hidden"
    animate="visible"
    className="mt-6 text-center"
  >
    <p className="text-sm text-gray-600 dark:text-gray-400">
      Need help?{' '}
      <a
        href="mailto:support@fiesta.com"
        className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium transition-colors"
      >
        Contact Support
      </a>
    </p>
  </motion.div>
);

// ============================================
// MAIN COMPONENT
// ============================================

const ForgotPassword = () => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ============================================
  // HANDLERS
  // ============================================

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authService.forgotPassword({ email });
      setSuccess('Password reset link sent! Check your email.');
      
      // Optional: Clear email field after success
      // setEmail('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle navigation to login
   */
  const handleBackToLogin = () => {
    navigate('/login');
  };

  /**
   * Handle email input change
   */
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Clear errors when user starts typing
    if (error) setError('');
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          
          {/* Navigation */}
          <BackButton onClick={handleBackToLogin} />
          
          {/* Header Section */}
          <IconHeader />
          <PageHeader />

          {/* Messages */}
          <AnimatePresence mode="wait">
            {success && <SuccessMessage message={success} />}
            {error && <ErrorMessage message={error} />}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              icon={Mail}
              value={email}
              onChange={handleEmailChange}
              required
              disabled={loading}
              autoComplete="email"
              autoFocus
            />

            <Button 
              type="submit" 
              loading={loading} 
              disabled={loading || !email.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          {/* Footer */}
          <Footer onLoginClick={handleBackToLogin} />
        </div>

        {/* Help Section */}
        <HelpText />
      </motion.div>
    </div>
  );
};

export default ForgotPassword;