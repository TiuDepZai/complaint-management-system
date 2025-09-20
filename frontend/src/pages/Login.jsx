import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../axiosConfig";

// Import your illustration from src/assets (filename is case-sensitive)
import loginImg from "../assets/other_images/LoginImage.png";

/* ---------------- Inline icons (no extra deps) ---------------- */
const MailIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400" aria-hidden="true">
    <path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z"/>
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400" aria-hidden="true">
    <path fill="currentColor" d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm3 8H9V6a3 3 0 0 1 6 0v3Z"/>
  </svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400" aria-hidden="true">
    <path fill="currentColor" d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400" aria-hidden="true">
    <path fill="currentColor" d="M2.1 3.51 20.49 21.9l-1.41 1.41-2.29-2.29A12.91 12.91 0 0 1 12 19C7 19 2.73 15.89 1 12c.68-1.53 1.76-2.94 3.08-4.12L.69 4.92 2.1 3.51ZM12 7a5 5 0 0 1 5 5c0 .63-.12 1.22-.34 1.77L13.23 10.3A2.98 2.98 0 0 0 12 10a3 3 0 0 0-3 3c0 .44.1.86.28 1.23l-1.5-1.5A4.98 4.98 0 0 1 12 7Z"/>
  </svg>
);

/* ---------- Reusable social button (Secondary style from your guide) ---------- */
function SocialButton({ label, svg }) {
  return (
    <button
      type="button"
      aria-label={`Continue with ${label}`}
      className="flex items-center gap-2 rounded-full border border-[#4A90E2] bg-white
                 px-4 py-2 text-sm font-medium text-[#4A90E2] hover:bg-[#E8F2FC] transition"
    >
      <span className="w-4 h-4 grid place-items-center">{svg}</span>
      <span>{label}</span>
    </button>
  );
}

const Login = () => {
  // Keep your original state and auth flow
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Submit handler preserved (axios -> context -> navigate)
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
      {/* Two-column card: left illustration, right form */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl bg-white shadow-xl overflow-hidden">
        {/* Left panel with your PNG (hidden on small screens) */}
        <div className="relative hidden lg:flex items-center justify-center bg-gradient-to-b from-blue-700 to-blue-900">
          <img
            src={loginImg}
            alt="Login illustration"
            className="object-contain max-h-[520px] w-auto"
          />
        </div>

        {/* Right panel with the form */}
        <div className="p-6 sm:p-10">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Welcome back</h1>

            {/* Tabs: Login (Primary) and Register (Secondary) */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-full px-4 py-2 text-sm font-medium
                           bg-[#1E4E8C] text-white hover:bg-[#163B66] transition"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="flex-1 rounded-full border border-[#4A90E2] bg-white
                           px-4 py-2 text-sm font-medium text-[#4A90E2]
                           hover:bg-[#E8F2FC] transition"
              >
                Register
              </button>
            </div>

            {/* Form fields */}
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {/* Email field with leading icon */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5
                                focus-within:ring-2 focus-within:ring-[#1E4E8C]">
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

              {/* Password field with toggle */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5
                                focus-within:ring-2 focus-within:ring-[#1E4E8C]">
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

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="accent-[#1E4E8C] w-3.5 h-3.5"
                  />
                  <span className="text-slate-700">Remember Me</span>
                </label>
                <a href="#" className="text-[11px] text-red-500 hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Primary button per style guide */}
              <button
                type="submit"
                className="w-full rounded-md bg-[#1E4E8C] text-white py-3 text-sm font-medium
                           hover:bg-[#163B66] disabled:bg-[#DDDDDD] disabled:text-[#AAAAAA]
                           focus:ring-2 focus:ring-[#1E4E8C] transition"
              >
                Login
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 text-center text-xs text-slate-500">or continue with</div>

            {/* Social buttons styled as Secondary */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <SocialButton
                label="Google"
                svg={
                  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                    <path fill="currentColor" d="M21.35 11.1H12v2.8h5.3c-.23 1.43-1.7 4.2-5.3 4.2-3.19 0-5.8-2.63-5.8-5.9s2.6-5.9 5.8-5.9c1.82 0 3.04.77 3.74 1.44l1.97-1.9C16.45 4 14.45 3 12 3 6.98 3 2.9 7.03 2.9 12s4.08 9 9.1 9c5.25 0 8.7-3.69 8.7-8.9 0-.6-.06-1.02-.15-1.99Z"/>
                  </svg>
                }
              />
              <SocialButton
                label="Apple"
                svg={
                  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                    <path fill="currentColor" d="M16.365 13.64c.03 3.2 2.806 4.27 2.84 4.28-.024.08-.445 1.53-1.47 3.03-.888 1.3-1.809 2.6-3.261 2.63-1.427.03-1.884-.85-3.514-.85-1.63 0-2.143.82-3.49.88-1.403.06-2.471-1.4-3.366-2.69-1.836-2.65-3.243-7.49-1.36-10.76.94-1.63 2.616-2.67 4.44-2.7 1.386-.03 2.693.93 3.513.93.82 0 2.42-1.15 4.087-.98.697.03 2.66.28 3.92 2.1-0.1.06-2.33 1.36-2.16 4.14z"/>
                  </svg>
                }
              />
              <SocialButton
                label="Facebook"
                svg={
                  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                    <path fill="currentColor" d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12"/>
                  </svg>
                }
              />
            </div>

            {/* Sign up link */}
            <p className="mt-6 text-center text-xs text-slate-600">
              Don’t have an account?{" "}
              <Link to="/register" className="text-[#1E4E8C] hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
