import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Only redirect after auth has finished initializing
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate, authLoading]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      await login(formData.email, formData.password);
      toast.success("Login successful!");
    } catch (err) {
      setError(err.message || "Invalid credentials");
      toast.error(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="w-full bg-white rounded-2xl p-10 shadow-xl">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl p-10 shadow-xl">
      <div className="flex justify-center items-center h-40 -mt-6 -mb-10 relative overflow-visible">
        <img
          src="fiesta logo-01.png"
          alt="fiesta logo"
          className="object-contain w-full h-full transform scale-[1.6]"
          style={{ maxWidth: "350px" }}
        />
      </div>

      <h2 className="text-2xl font-bold my-5 text-gray-900">Welcome back</h2>

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
          className="w-full"
          placeholder="you@example.com"
          required
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          className="w-full"
          iconRight={
            showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )
          }
          onIconRightClick={() => setShowPassword(!showPassword)}
          required
        />
        <Button
          type="submit"
          loading={submitting}
          variant="primary"
          className="mt-2"
        >
          Sign In
        </Button>
      </form>

      <div className="text-sm mt-4 text-right">
        <Link
          to="/forgot-password"
          className="text-orange-500 font-medium hover:text-orange-600 transition-colors"
        >
          Forgot your password?
        </Link>
      </div>

      <div className="text-sm mt-4 text-center">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-orange-500 font-medium hover:text-orange-600 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default Login;
