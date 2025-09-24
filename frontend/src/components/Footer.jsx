import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-8 text-white overflow-hidden">
      {/* gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800" />

      {/* soft stripes overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="white" stopOpacity="0.2" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="-50%" y="-50%" width="200%" height="200%" fill="url(#g)" transform="rotate(45 0 0)" />
        <rect x="-30%" y="-50%" width="200%" height="200%" fill="url(#g)" transform="rotate(45 0 0)" />
        <rect x="-10%" y="-50%" width="200%" height="200%" fill="url(#g)" transform="rotate(45 0 0)" />
      </svg>

      {/* content */}
      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <div className="grid gap-10 md:grid-cols-3 items-start">
          {/* brand */}
          <div className="md:col-span-1">
            <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
              ComplaintHub
            </div>
          </div>

          {/* right-side links (aligned to the right on md+) */}
          <div className="md:col-span-2 grid grid-cols-2 gap-8 md:justify-items-end text-right">
            <div>
              <div className="font-semibold mb-3">Quick Links</div>
              <ul className="space-y-2 text-blue-100">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/services" className="hover:text-white">Services</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-3">Support</div>
              <ul className="space-y-2 text-blue-100">
                <li><Link to="/help" className="hover:text-white">Help center</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQs</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="border-white/30 my-6" />

        <div className="text-sm text-blue-100">
          © {year} ComplaintHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
