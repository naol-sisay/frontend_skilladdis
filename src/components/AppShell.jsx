import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import api from "../api/axios";
import Avatar from "./Avatar";
import Logo, { CapMark } from "./Logo";

// --- icons (stroke) ---
const I = {
  dashboard: "M4 5a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h5a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM15 5a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V5zM15 14a1 1 0 011-1h3a1 1 0 011 1v5a1 1 0 01-1 1h-3a1 1 0 01-1-1v-5z",
  catalog: "M12 2a10 10 0 100 20 10 10 0 000-20zm3.5 6.5l-2 5-5 2 2-5 5-2z",
  courses: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  create: "M12 4v16m8-8H4",
};

const NavIcon = ({ d }) => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const AppShell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [auth, setAuth] = useState({ name: "", role: null, authed: false });
  const [photo, setPhoto] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const p = JSON.parse(atob(token.split(".")[1]));
        setAuth({ name: p.name || p.full_name || "User", role: p.role?.toUpperCase() || null, authed: true });
      } catch {
        setAuth({ name: "", role: null, authed: false });
      }
    }
  }, [location]);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    const load = () =>
      api.get("/auth/me").then((r) => {
        setPhoto(r.data.user?.profile_picture_url || "");
        if (r.data.user?.full_name) setAuth((a) => ({ ...a, name: r.data.user.full_name }));
      }).catch(() => {});
    load();
    window.addEventListener("profile-updated", load);
    return () => window.removeEventListener("profile-updated", load);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isInstructor = auth.role === "INSTRUCTOR";
  const subtitle = isInstructor ? "Instructor dashboard" : "Student dashboard";

  const links = isInstructor
    ? [
        { to: "/dashboard", label: "Dashboard", d: I.dashboard },
        { to: "/create-course", label: "Create", d: I.create },
        { to: "/instructor/courses", label: "My Courses", d: I.courses },
        { to: "/catalog", label: "Explore", d: I.catalog },
      ]
    : [
        { to: "/dashboard", label: "Dashboard", d: I.dashboard },
        { to: "/catalog", label: "Explore", d: I.catalog },
        { to: "/my-courses", label: "My Courses", d: I.courses },
      ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
      isActive ? "bg-accent-soft text-ink" : "text-ink-muted hover:bg-surface-2 hover:text-ink"
    }`;

  const SidebarInner = (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-line">
        <Link to="/dashboard">
          <Logo subtitle={subtitle} />
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={linkClass}>
            <NavIcon d={l.d} />
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pb-5 pt-3 border-t border-line space-y-3">
        {auth.authed ? (
          <>
            <Link
              to="/profile"
              className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-2 hover:bg-surface-2 transition-colors"
            >
              <Avatar name={auth.name} src={photo} size={38} />
              <div className="min-w-0">
                <p className="font-bold text-ink text-sm truncate">{auth.name}</p>
                <p className="text-xs text-ink-faint capitalize">{auth.role?.toLowerCase()}</p>
              </div>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-ink-faint hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log out
            </button>
          </>
        ) : (
          <div className="space-y-2">
            <Link to="/login" className="block w-full text-center py-3 rounded-xl border border-line font-bold text-ink hover:bg-surface-2">Log in</Link>
            <Link to="/register" className="block w-full text-center py-3 rounded-xl bg-accent text-white font-bold glow-accent hover:bg-accent-strong">Sign up</Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 bg-surface border-r border-line h-screen sticky top-0">
        {SidebarInner}
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar — brand only, no hamburger */}
        <header className="lg:hidden sticky top-0 z-30 bg-surface border-b border-line flex items-center justify-between px-4 h-14">
          <Link to="/dashboard" className="flex items-center gap-2">
            <CapMark className="w-6 h-6 text-accent" />
            <span className="font-extrabold text-ink">SkillAddis</span>
          </Link>
          {auth.authed ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" aria-label="Profile">
                <Avatar name={auth.name} src={photo} size={32} />
              </Link>
              <button
                onClick={logout}
                aria-label="Log out"
                className="flex items-center justify-center w-9 h-9 rounded-xl text-ink-faint hover:text-red-600 hover:bg-surface-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-sm font-bold text-accent">Log in</Link>
          )}
        </header>

        <main key={location.pathname} className="page-enter flex-1 pb-24 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur border-t border-line pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch justify-around px-2 pt-1.5 pb-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 flex-1 py-1.5 rounded-2xl text-[11px] font-bold transition-colors ${
                  isActive ? "text-accent" : "text-ink-faint hover:text-ink"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex items-center justify-center w-10 h-9 rounded-2xl transition-all ${
                      isActive ? "bg-accent-soft glow-soft" : ""
                    }`}
                  >
                    <NavIcon d={l.d} />
                  </span>
                  <span>{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppShell;
