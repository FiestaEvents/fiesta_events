import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import AuthLayout from "../../components/layout/AuthLayout.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    venueName: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.venueName
    ) {
      setError("Please fill in all required fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        venueName: formData.venueName,
        phone: formData.phone || undefined,
      });
      toast("Registration successful!", "success");
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Registration failed"
      );
      toast(
        err.response?.data?.message || err.message || "Registration failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-10 shadow-md max-h-[90vh] overflow-y-auto">
      <div className="flex justify-center items-center h-32 -mt-4 -mb-8 relative overflow-visible">
        <img
          src="fiesta logo-01.png"
          alt="fiesta logo"
          className="object-contain w-full h-full transform scale-150"
          style={{ maxWidth: "300px" }}
        />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-gray-900">
        Create an account
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Get started with your venue management
      </p>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded mb-4">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Input
          label="Full Name *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
        />
        <Input
          label="Venue Name *"
          name="venueName"
          value={formData.venueName}
          onChange={handleChange}
          fullWidth
        />
        <Input
          label="Email *"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
        />
        <Input
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          fullWidth
        />
        <Input
          label="Password *"
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          iconRight={showPassword ? EyeOff : Eye}
          onIconClick={() => setShowPassword(!showPassword)}
          fullWidth
        />
        <Input
          label="Confirm Password *"
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          iconRight={showConfirmPassword ? EyeOff : Eye}
          onIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
          fullWidth
        />
        <Button
          type="submit"
          loading={loading}
          variant="primary"
          className="w-full md:col-span-2"
        >
          Create Account
        </Button>
      </form>

      <div className="text-sm mt-4 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-orange-500 font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default Register;
