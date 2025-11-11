import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { authService } from '../../api/index';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.forgotPassword({ email });
      setSuccess('Password reset link sent! Check your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Forgot Password</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Enter your email to receive a password reset link.
        </p>

        {success && <p className="text-green-600 mb-4">{success}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Your email"
            icon={<Mail />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" loading={loading} className="w-full">
            Send Reset Link
          </Button>
        </form>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Remembered your password?{' '}
          <span
            className="text-orange-500 cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
