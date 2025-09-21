import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../axiosConfig";

// illustration used on the left card
import signImg from "../assets/other_images/RegisterImage.png";

/* ---------------- inline icons ---------------- */
const UserIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400" aria-hidden="true">
    <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"/>
  </svg>
);
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

/* ---------------- social button (secondary style) ---------------- */
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

const Register = () => {
  /* ---------------- state & navigation (original logic) ---------------- */
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [allowLocation, setAllowLocation] = useState(false);
  const navigate = useNavigate();

  /* ---------------- submit (original axios + navigate) ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/api/auth/register", formData);
      alert("Registration successful. Please log in.");
      navigate("/login");
    } catch (error) {
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4">
      {/* card layout: illustration + form */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl bg-white shadow-xl overflow-hidden">
        {/* left: blue gradient background with soft waves */}
        <div className="relative hidden lg:flex items-center justify-center">
          {/* base gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1F5BAA] to-[#0F3C7A]" />
          {/* decorative waves */}
          <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 1440 1024" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,740 C180,690 300,640 520,680 C740,720 860,810 1080,800 C1260,792 1380,750 1440,730 L1440,1024 L0,1024 Z" fill="#1B4E99"/>
            <path d="M0,840 C220,800 360,760 560,780 C820,806 960,900 1200,880 C1320,870 1400,850 1440,840 L1440,1024 L0,1024 Z" fill="#1A468C"/>
            <path d="M0,920 C200,900 340,880 520,900 C700,920 880,980 1080,970 C1260,960 1380,940 1440,930 L1440,1024 L0,1024 Z" fill="#163B66"/>
          </svg>
          {/* illustration */}
          <img src={signImg} alt="Register illustration" className="relative z-10 object-contain max-h-[520px] w-auto" />
        </div>

        {/* right: form */}
        <div className="p-6 sm:p-10">
          <div className="max-w-md mx-auto">
            {/* title */}
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 text-center">Create account</h1>

            {/* tabs */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex-1 rounded-full border border-[#4A90E2] bg-white
                           px-4 py-2 text-sm font-medium text-[#4A90E2]
                           hover:bg-[#E8F2FC] transition"
              >
                Login
              </button>
              <button
                type="button"
                className="flex-1 rounded-full px-4 py-2 text-sm font-medium
                           bg-[#1E4E8C] text-white hover:bg-[#163B66] transition"
              >
                Register
              </button>
            </div>

            {/* form */}
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {/* full name */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#1E4E8C]">
                  <UserIcon />
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full outline-none text-sm placeholder-slate-400"
                    required
                  />
                </div>
              </div>

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

              {/* location permission */}
              <label className="flex items-center gap-2 text-xs select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowLocation}
                  onChange={(e) => setAllowLocation(e.target.checked)}
                  className="accent-[#1E4E8C] w-3.5 h-3.5"
                />
                <span className="text-slate-700">
                  Allow app to use your location to help you report issues quickly
                </span>
              </label>

              {/* submit */}
              <button
                type="submit"
                className="w-full rounded-md bg-[#1E4E8C] text-white py-3 text-sm font-medium
                           hover:bg-[#163B66] disabled:bg-[#DDDDDD] disabled:text-[#AAAAAA]
                           focus:ring-2 focus:ring-[#1E4E8C] transition"
              >
                Create Account
              </button>
            </form>

            {/* continue with */}
            <div className="mt-6 text-center text-xs text-slate-500">or continue with</div>
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

            {/* footer link */}
            <p className="mt-6 text-center text-xs text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="text-[#1E4E8C] hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;