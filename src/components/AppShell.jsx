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
  const [drawer, setDrawer] = useState(false);

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
    setDrawer(false);
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
        { to: "/catalog", label: "Catalog", d: I.catalog },
      ]
    : [
        { to: "/dashboard", label: "Dashboard", d: I.dashboard },
        { to: "/catalog", label: "Catalog", d: I.catalog },
        { to: "/my-courses", label: "Courses", d: I.courses },
      ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
      isActive ? "bg-accent-soft text-brand" : "text-slate-500 hover:bg-slate-100 hover:text-brand"
    }`;

  const SidebarInner = (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-slate-100">
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

      <div className="px-4 pb-5 pt-3 border-t border-slate-100 space-y-3">
        {auth.authed ? (
          <>
            <Link
              to="/profile"
              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <Avatar name={auth.name} src={photo} size={38} />
              <div className="min-w-0">
                <p className="font-bold text-brand text-sm truncate">{auth.name}</p>
                <p className="text-xs text-slate-400 capitalize">{auth.role?.toLowerCase()}</p>
              </div>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log out
            </button>
          </>
        ) : (
          <div className="space-y-2">
            <Link to="/login" className="block w-full text-center py-3 rounded-xl border border-slate-200 font-bold text-brand hover:bg-slate-50">Log in</Link>
            <Link to="/register" className="block w-full text-center py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent-strong">Sign up</Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 bg-white border-r border-slate-100 h-screen sticky top-0">
        {SidebarInner}
      </aside>

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${drawer ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
        <aside className={`absolute inset-y-0 left-0 w-72 max-w-[82%] bg-white shadow-2xl transition-transform duration-300 ${drawer ? "translate-x-0" : "-translate-x-full"}`}>
          {SidebarInner}
        </aside>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-100 flex items-center gap-3 px-4 h-14">
          <button onClick={() => setDrawer(true)} className="p-1.5 -ml-1.5 text-brand" aria-label="Open menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <CapMark className="w-6 h-6 text-accent" />
            <span className="font-extrabold text-brand">SkillAddis</span>
          </Link>
        </header>

        <main key={location.pathname} className="page-enter flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
