import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeClosedIcon, EyeIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import Button from "../../components/common/Button.jsx";

// Input Component
const Input = ({
  label,
  error,
  iconRight: IconRight,
  onIconClick,
  fullWidth,
  ...props
}) => (
  <div className={fullWidth ? "w-full" : ""}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        className={`w-full px-4 py-1.5 text-base border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 hover:shadow-md ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        {...props}
      />
      {IconRight && (
        <button
          type="button"
          onClick={onIconClick}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <IconRight size={20} />
        </button>
      )}
    </div>
    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  // Only redirect after auth has finished initializing
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate, authLoading]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error for the field being edited
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await login(formData.email, formData.password);
      success("Login successful!");
    } catch (err) {
      // Set general authentication error on both fields or as needed
      const errorMessage = err.message || "Invalid credentials";
      setErrors({
        email: errorMessage,
        password: errorMessage,
      });
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col">
      {/* Main content area that grows and centers the card */}
      <div className="flex-1 flex items-center justify-center p-0 md:p-4">
        {/* Background decoration - hidden on mobile to reduce clutter */}
        <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
            style={{ animationDelay: "700ms" }}
          ></div>
        </div>

        {/* Login Card - full screen on mobile */}
        <div className="relative w-full h-full md:max-w-md md:h-auto">
          <div className="bg-white w-full h-full md:rounded-2xl md:shadow-2xl md:h-auto flex flex-col justify-center">
            {/* Form Section with Logo at Top */}
            <div className="px-6 py-8 md:px-8 md:py-4 space-y-4">
              {/* Logo Only - Centered at Top */}
              <div className="flex justify-center">
                <div className="w-full flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                  <img
                    src="fiesta logo-01.png"
                    alt="Fiesta Logo"
                    className="object-cover w-[60%] md:w-[70%]"
                  />
                </div>
              </div>

              {/* Sign In Title */}
              <div className="text-left space-y-3 md:space-y-4">
                <h2 className="text-2xl md:text-2xl text-left font-semibold text-gray-800">
                  Sign In
                </h2>
                <p className="text-gray-500 text-sm md:text-sm text-left">
                  Enter your credentials to access your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                {/* Email Input */}
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  placeholder="you@example.com"
                  error={errors.email}
                  required
                />

                {/* Password Input */}
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  fullWidth
                  iconRight={showPassword ? EyeClosedIcon : EyeIcon}
                  onIconClick={() => setShowPassword(!showPassword)}
                  error={errors.password}
                  required
                />

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Remember me
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  loading={submitting}
                  variant="primary"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-base"
                >
                  {submitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
