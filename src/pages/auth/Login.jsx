import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react"; 
import { useAuth } from "../../context/AuthContext";
import useToast from "../../hooks/useToast"; // Updated to use the hook
import Button from "../../components/common/Button";
import Input from "../../components/common/Input"; // Using generic Input

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  
  // Use the extended toast methods
  const { success, apiError } = useToast();

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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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
      // Navigation happens via the useEffect
    } catch (err) {
      // Use the generic apiError helper from useToast
      apiError(err, "Invalid credentials");
      
      // Also set local form errors for visual feedback
      setErrors({
        email: " ",
        password: " ",
      });
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
            <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
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
        {/* Background decoration */}
        <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
            style={{ animationDelay: "700ms" }}
          ></div>
        </div>

        {/* Login Card */}
        <div className="relative w-full h-full md:max-w-md md:h-auto z-10">
          <div className="bg-white w-full h-full md:rounded-2xl md:shadow-2xl md:h-auto flex flex-col justify-center">
            {/* Form Section */}
            <div className="px-6 py-8 md:px-8 md:py-8 space-y-6">
              {/* Logo */}
              <div className="flex justify-center mb-2">
                <div className="w-full flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                  <img
                    src="fiesta logo-01.png"
                    alt="Fiesta Logo"
                    className="object-cover w-[60%] md:w-[70%]"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="text-left space-y-2">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Sign In
                </h2>
                <p className="text-gray-500 text-sm">
                  Enter your credentials to access your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  error={errors.email}
                  required
                  className="bg-white w-full"
                />

                {/* Password Input Wrapper */}
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    error={errors.password}
                    required
                    className="bg-white pr-10 w-full" // Add padding right for the icon
                  />
                  
                  {/* Toggle Password Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 transition-all"
                    />
                    <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800">
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
                  variant="primary"
                  loading={submitting}
                  className="w-full py-3 text-base shadow-orange-500/20 hover:shadow-orange-500/40"
                >
                  {submitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center pt-2">
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