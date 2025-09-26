import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../axiosConfig";

// image
import loginImg from "../assets/other_images/LoginImage.png";

// icons
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
    <path fill="currentColor" d="M2.1 3.51 20.49 21.9l-1.41 1.41-2.29-2.29A12.91 12.91 0 0 1 12 19C7 19 2.73 15.89 1 12c.68-1.53 1.76-2.94 3.08-4.12L.69 4.92 2.1 3.51ZM12 7a5 5 0 0 1 5 5c0 .63-.12 1.22-.34 1.77L13.23 10.3A2.98 2.98 0 0 0 12 10a3 3 0 0 0-3 3c0 .44.1 .86 .28 1.23l-1.5-1.5A4.98 4.98 0 0 1 12 7Z"/>
  </svg>
);

const Login = () => {
  // state + routing/auth
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // submit (keep original flow)
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
      {/* card: left image + right form */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl bg-white shadow-xl overflow-hidden">
        {/* left (gradient + soft waves like the illustration) */}
        <div className="relative hidden lg:flex items-center justify-center">
          {/* base gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1F5BAA] to-[#0F3C7A]" />
          {/* subtle waves */}
          <svg
            className="absolute inset-0 w-full h-full opacity-35"
            viewBox="0 0 1440 1024"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0,740 C180,690 300,640 520,680 C740,720 860,810 1080,800 C1260,792 1380,750 1440,730 L1440,1024 L0,1024 Z" fill="#1B4E99"/>
            <path d="M0,840 C220,800 360,760 560,780 C820,806 960,900 1200,880 C1320,870 1400,850 1440,840 L1440,1024 L0,1024 Z" fill="#1A468C"/>
            <path d="M0,920 C200,900 340,880 520,900 C700,920 880,980 1080,970 C1260,960 1380,940 1440,930 L1440,1024 L0,1024 Z" fill="#163B66"/>
          </svg>
          {/* illustration */}
          <img
            src={loginImg}
            alt="Login illustration"
            className="relative z-10 object-contain max-h-[520px] w-auto"
          />
        </div>

        {/* right */}
        <div className="p-6 sm:p-10">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Welcome back</h1>

            {/* tabs */}
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

            {/* form */}
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {/* email */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#1E4E8C]">
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

              {/* password */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#1E4E8C]">
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

              {/* primary */}
              <button
                type="submit"
                className="w-full rounded-md bg-[#1E4E8C] text-white py-3 text-sm font-medium
                           hover:bg-[#163B66] disabled:bg-[#DDDDDD] disabled:text-[#AAAAAA]
                           focus:ring-2 focus:ring-[#1E4E8C] transition"
              >
                Login
              </button>
            </form>

            {/* footer */}
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
