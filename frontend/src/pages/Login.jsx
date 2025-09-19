import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../axiosConfig";

const MailIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400">
    <path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z"/>
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400">
    <path fill="currentColor" d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm3 8H9V6a3 3 0 0 1 6 0v3Z"/>
  </svg>
);
const EyeIcon = (props) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400" {...props}>
    <path fill="currentColor" d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/>
  </svg>
);
const EyeOffIcon = (props) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400" {...props}>
    <path fill="currentColor" d="M2.1 3.51 20.49 21.9l-1.41 1.41-2.29-2.29A12.91 12.91 0 0 1 12 19C7 19 2.73 15.89 1 12c.68-1.53 1.76-2.94 3.08-4.12L.69 4.92 2.1 3.51ZM12 7a5 5 0 0 1 5 5c0 .63-.12 1.22-.34 1.77L13.23 10.3A2.98 2.98 0 0 0 12 10a3 3 0 0 0-3 3c0 .44.1.86.28 1.23l-1.5-1.5A4.98 4.98 0 0 1 12 7Z"/>
  </svg>
);

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/api/auth/login", formData);
      login(response.data);
      const redirectTo = location.state?.redirectTo || "/";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl bg-white shadow-xl overflow-hidden">
        {/* Panel izquierdo (ilustración) */}
        <div className="relative hidden lg:flex items-center justify-center p-10 bg-gradient-to-b from-blue-700 to-blue-900">
          <svg viewBox="0 0 300 300" className="w-80 h-80 opacity-95">
            <defs>
              <linearGradient id="lockGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#e6efff" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <circle cx="150" cy="190" r="95" fill="url(#lockGrad)" />
            <path d="M95 120a55 55 0 0 1 110 0v22l20 9v-31a75 75 0 0 0-150 0v31l20-9v-22z" fill="#dbe3f0" />
            <path d="M150 170a25 25 0 0 0-10 48l1 39a9 9 0 0 0 18 0l1-39a25 25 0 0 0-10-48z" fill="#3b82f6" />
          </svg>
        </div>

        {/* Panel derecho (formulario) */}
        <div className="p-6 sm:p-10">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Welcome back</h1>

            {/* Tabs Login / Register */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-full border px-4 py-2 text-sm font-medium bg-blue-700 text-white shadow"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="flex-1 rounded-full border px-4 py-2 text-sm font-medium bg-white text-slate-700 hover:shadow"
              >
                Register
              </button>
            </div>

            {/* Form */}
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-600">
                  <MailIcon />
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full outline-none text-sm placeholder-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-600">
                  <LockIcon />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full outline-none text-sm placeholder-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Remember / Forgot */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="accent-blue-700 w-3.5 h-3.5"
                  />
                  <span className="text-slate-700">Remember Me</span>
                </label>
                <a href="#" className="text-[11px] text-red-500 hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-md bg-blue-800 text-white py-3 text-sm font-medium hover:bg-blue-900 focus:ring-2 focus:ring-blue-600"
              >
                Login
              </button>
            </form>

            {/* Divider y redes */}
            <div className="mt-6 text-center text-xs text-slate-500">or continue with</div>
            <div className="mt-3 flex items-center justify-center gap-4">
              <SocialBtn label="Google" />
              <SocialBtn label="Apple" />
              <SocialBtn label="Facebook" />
            </div>

            {/* Sign up link */}
            <p className="mt-6 text-center text-xs text-slate-600">
              Don’t have an account?{" "}
              <Link to="/register" className="text-blue-700 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function SocialBtn({ label }) {
  return (
    <button
      type="button"
      aria-label={`Continue with ${label}`}
      className="grid place-items-center w-10 h-10 rounded-full border hover:shadow focus:ring-2 focus:ring-blue-600"
    >
      <span className="text-xs">{label[0]}</span>
    </button>
  );
}

export default Login;
