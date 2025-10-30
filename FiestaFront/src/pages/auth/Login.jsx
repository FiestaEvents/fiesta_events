import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { iconRight } from '../../components/icons/IconComponents.js';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl p-10 shadow-md">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500 mb-6">Enter your credentials to access your account</p>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            iconRight={showPassword ? EyeOff : Eye}
            onIconClick={() => setShowPassword(!showPassword)}
          />
          <Button type="submit" loading={loading} variant="outline" className="mt-2">Sign In</Button>
        </form>

        <div className="text-sm mt-4 text-right">
          <Link to="/forgot-password" className="text-orange-500 font-medium">Forgot your password?</Link>
        </div>

        <div className="text-sm mt-4 text-center">
          Don't have an account? <Link to="/register" className="text-orange-500 font-medium">Sign Up</Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
