import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { CapMark, StackedLogo } from "./Logo";

// Shared blue split layout for Login & Register (single-form, reskinned).
const AuthLayout = ({ title, subtitle, panelTitle, panelSubtitle, progress = 50, children, footer }) => {
  const [stats, setStats] = useState({ courses: null, categories: null });

  useEffect(() => {
    api
      .get("/courses")
      .then((r) => {
        const courses = r.data.courses || [];
        const cats = new Set(courses.map((c) => c.category).filter(Boolean));
        setStats({ courses: courses.length, categories: cats.size });
      })
      .catch(() => setStats({ courses: 0, categories: 0 }));
  }, []);

  const panelStats = [
    { label: "Courses", value: stats.courses ?? "–" },
    { label: "Categories", value: stats.categories ?? "–" },
    { label: "Featured", value: "––" },
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-canvas">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between bg-brand text-white p-12 overflow-hidden">
        {/* floating rotated squares */}
        <div className="pointer-events-none absolute top-24 right-10 w-44 h-44 rounded-3xl bg-white/[0.03] rotate-12" />
        <div className="pointer-events-none absolute bottom-24 right-24 w-32 h-32 rounded-3xl bg-white/[0.04] -rotate-6" />

        <Link to="/" className="relative">
          <CapMark className="w-12 h-12 text-accent" />
        </Link>

        <div className="relative">
          <h2 className="text-5xl font-extrabold tracking-tight">{panelTitle || "SkillAddis"}</h2>
          <p className="mt-5 text-ink-faint text-lg max-w-sm leading-relaxed">
            {panelSubtitle || "Access courses, continue lessons, and manage your learning workspace from one account."}
          </p>

          <div className="mt-10 space-y-3 max-w-sm">
            {panelStats.map((s) => (
              <div key={s.label} className="flex items-center justify-between bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4">
                <span className="font-semibold text-ink-faint">{s.label}</span>
                <span className="font-extrabold text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <span className="relative text-sm text-ink-muted">© 2026 SkillAddis · Addis Ababa</span>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <StackedLogo capClass="w-14 h-14 text-accent" textClass="text-xl" />
          </div>

          <h1 className="text-4xl font-extrabold text-ink text-center tracking-tight">{title}</h1>
          <p className="text-ink-muted mt-3 mb-6 text-center">{subtitle}</p>

          {/* progress segments (decorative, matches reference) */}
          <div className="flex gap-2 mb-8">
            <div className="h-2 flex-1 rounded-full bg-accent" style={{ flexGrow: progress }} />
            <div className="h-2 flex-1 rounded-full bg-surface-2" style={{ flexGrow: 100 - progress }} />
          </div>

          {children}

          {footer && <div className="mt-8 text-center text-ink-muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
