// frontend/src/components/Navbar.jsx
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useRef, useState } from "react";

// Avatares (admin vs user)
import userImg from "../assets/other_images/howitoworks.png";
import adminImg from "../assets/other_images/LoginImage.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const isAdmin = user?.role === "admin";
  const avatarSrc = isAdmin ? adminImg : userImg;
  const userName = user?.name || user?.fullName || user?.username || "User";

  // cerrar dropdown al hacer click fuera
  useEffect(() => {
    const onClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ---------- LINKS DE NAV (centro) ----------
  const landingLinks = useMemo(
    () => [
      { label: "Home", to: "/" },
      { label: "About us", to: "/about" },
      { label: "FAQ", to: "/faq" },
    ],
    []
  );

  // Admin mantiene sus opciones del centro
  const adminLinks = useMemo(
    () => [
      { label: "Home", to: "/" },
      { label: "Categories", to: "/categories" },
      { label: "Complaints", to: "/complaints?all=1" },
    ],
    []
  );

  // User (no admin) usa el mismo set que landing (sin Contact)
  const userLinks = landingLinks;

  const links = !user ? landingLinks : isAdmin ? adminLinks : userLinks;

  const linkClasses = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "text-white underline underline-offset-4"
        : "text-white/90 hover:text-white"
    }`;

  // ---------- ITEMS DEL DROPDOWN ----------
// Items del dropdown según rol
const dropdownItems = isAdmin
  ? [
      { to: "/profile", label: "Profile" },
      { to: "/complaints?all=1", label: "Dashboard" }, // admin → View All Complaints
      { to: "/categories", label: "Categories" },
    ]
  : [
      { to: "/profile", label: "Profile" },
      { to: "/complaints", label: "Dashboard" },       // user → View Complaints
      { to: "/complaints?new=1", label: "New Complaint" } // user → Register Complaint
    ];

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="bg-[#7289da]/60 backdrop-blur-md border-b border-white/10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 h-20">
          {/* Logo / Brand */}
          <Link to="/" className="text-2xl font-bold tracking-tight text-white">
            ComplaintHub
          </Link>

          {/* Centro: links */}
          <ul className="hidden md:flex gap-6">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className={linkClasses} end>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Derecha: sesión */}
          <div className="flex items-center gap-3">
            {/* LANDING (no logueado) */}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="bg-[#1E88E5] hover:bg-[#1565C0] px-4 py-2 rounded-lg text-sm font-medium text-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="border border-white/80 text-[#1E88E5] bg-white hover:bg-[#E3F2FD] px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Register
                </Link>
              </>
            )}

            {/* USER & ADMIN: pill con avatar + nombre + dropdown */}
            {user && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="flex items-center gap-3 rounded-full border border-white/60 bg-white/10 pr-4 pl-1 py-1 text-white hover:bg-white/20 transition"
                  aria-expanded={open}
                >
                  <img
                    src={avatarSrc}
                    alt="avatar"
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-white/60"
                  />
                  <span className="text-sm font-medium whitespace-nowrap">
                    {userName}
                  </span>
                  <span className="text-lg leading-none translate-y-[1px]">
                    ▾
                  </span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-black/10 bg-white shadow-lg p-2">
                    {dropdownItems.map((item) => (
                      <DropItem
                        key={item.to}
                        to={item.to}
                        label={item.label}
                        onClick={() => setOpen(false)}
                        activePath={pathname}
                      />
                    ))}
                    <button
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

/** Item del dropdown */
function DropItem({ to, label, onClick, activePath }) {
  const isActive = activePath === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block rounded-lg px-3 py-2 text-sm ${
        isActive
          ? "bg-gray-100 font-semibold text-gray-900"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
    </Link>
  );
}
