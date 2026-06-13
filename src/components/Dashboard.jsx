import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";

/* ---------- shared bits ---------- */

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 card-lift">
    <div className="flex items-center justify-between text-slate-400 mb-3">
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-accent">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </span>
    </div>
    <div className="text-4xl font-extrabold text-brand">{value}</div>
  </div>
);

const CourseRow = ({ course, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-accent/40 hover:bg-accent-softer transition-colors text-left group"
  >
    <span className="w-11 h-11 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </span>
    <div className="min-w-0 flex-1">
      <p className="font-bold text-brand truncate">{course.title}</p>
      <p className="text-sm text-slate-400">{course.category || "General"}</p>
    </div>
    <svg className="w-5 h-5 text-slate-300 group-hover:text-accent group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  </button>
);

const Btn = ({ children, onClick, variant = "primary" }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-[0.99] ${
      variant === "primary"
        ? "bg-accent text-white glow-accent hover:bg-accent-strong"
        : "bg-white border border-slate-200 text-brand hover:bg-slate-50"
    }`}
  >
    {children}
  </button>
);

/* ---------- student ---------- */

const StudentDashboard = ({ name, stats }) => {
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState([]);

  useEffect(() => {
    api.get("/student/my-courses").then((r) => setEnrolled(r.data.my_courses || [])).catch(() => {});
  }, []);

  const activeCount = enrolled.filter((e) => (e.status || "").toLowerCase() === "active").length;

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto w-full">
      {/* header */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-8">
          <h1 className="text-5xl font-extrabold text-brand">Welcome</h1>
          <p className="mt-3 text-slate-500 max-w-md">
            Review enrolled courses, course status, and available catalog options.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Btn onClick={() => navigate("/my-courses")}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" /></svg>
              Enrolled courses
            </Btn>
            <Btn variant="ghost" onClick={() => navigate("/catalog")}>Explore courses</Btn>
          </div>
        </div>

        <div className="bg-brand text-white rounded-2xl p-7 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm font-semibold">Your account</span>
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" /></svg>
          </div>
          <div>
            <p className="text-3xl font-extrabold mt-6">{name}</p>
            <p className="text-slate-400 mt-1">
              {enrolled.length ? `${enrolled.length} enrolled course${enrolled.length > 1 ? "s" : ""}` : "No active enrollments"}
            </p>
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <StatCard label="Enrolled" value={enrolled.length} icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
        <StatCard label="Active" value={activeCount} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatCard label="Completed" value={stats.certificates_earned ?? 0} icon="M3 17l6-6 4 4 8-8" />
      </div>

      {/* lists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-extrabold text-brand">Enrolled Courses</h2>
          <button onClick={() => navigate("/my-courses")} className="text-sm font-bold text-brand border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50">View all</button>
        </div>
        {enrolled.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-accent-soft text-accent flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" /></svg>
            </div>
            <p className="font-bold text-brand text-lg mb-1">No enrolled courses</p>
            <p className="text-slate-400 mb-6">Enrolled courses will appear here.</p>
            <Btn onClick={() => navigate("/catalog")}>Explore courses</Btn>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {enrolled.slice(0, 6).map((c) => (
              <CourseRow key={c.course_id} course={c} onClick={() => navigate(`/player/${c.course_id}`)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

/* ---------- instructor (kept clean — metrics live on /instructor/courses) ---------- */

const InstructorDashboard = ({ name, stats }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto w-full">
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-8">
          <h1 className="text-5xl font-extrabold text-brand leading-tight">Welcome back, {name}</h1>
          <p className="mt-3 text-slate-500 max-w-md">
            Manage your course content, pricing, lesson structure, and student-facing details from one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Btn onClick={() => navigate("/create-course")}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Create course
            </Btn>
            <Btn variant="ghost" onClick={() => navigate("/catalog")}>Explore</Btn>
          </div>
        </div>

        <div className="bg-brand text-white rounded-2xl p-7 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm font-semibold">Instructor workspace</span>
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <p className="text-3xl font-extrabold mt-6">{name}</p>
            <p className="text-slate-400 mt-1">{stats.courses_published ?? 0} published course{(stats.courses_published ?? 0) === 1 ? "" : "s"}</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-8 card-lift">
          <h2 className="text-xl font-bold text-brand mb-2">Manage your courses</h2>
          <p className="text-slate-500 mb-6">Review every course you've published, with status, pricing, and what still needs attention.</p>
          <Btn onClick={() => navigate("/instructor/courses")}>Open My Courses</Btn>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-8 card-lift">
          <h2 className="text-xl font-bold text-brand mb-2">Add new material</h2>
          <p className="text-slate-500 mb-6">Draft a course, build the curriculum, and publish it to the catalog.</p>
          <Btn variant="ghost" onClick={() => navigate("/create-course")}>Create a course</Btn>
        </div>
      </div>
    </div>
  );
};

/* ---------- container ---------- */

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ name: "", role: "" });
  const [stats, setStats] = useState({});
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    try {
      const p = JSON.parse(atob(token.split(".")[1]));
      setUser({ name: p.name || "User", role: p.role?.toUpperCase() });
    } catch {
      navigate("/login");
    }
    api.get("/auth/me").then((r) => {
      setStats(r.data.stats || {});
      if (r.data.user?.full_name) setUser((u) => ({ ...u, name: r.data.user.full_name }));
    }).catch(() => {});
  }, [navigate]);

  useEffect(() => {
    if (location.state?.successMessage) {
      setNotification(location.state.successMessage);
      const t = setTimeout(() => setNotification(""), 5000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(t);
    }
  }, [location]);

  return (
    <>
      {notification && (
        <div className="mx-6 mt-6 sm:mx-10 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl flex items-center justify-between animate-fade-in-down">
          <p className="text-green-700 font-bold">{notification}</p>
          <button onClick={() => setNotification("")} className="text-green-600 font-bold text-xl leading-none">&times;</button>
        </div>
      )}
      {user.role === "INSTRUCTOR" ? (
        <InstructorDashboard name={user.name} stats={stats} />
      ) : (
        <StudentDashboard name={user.name} stats={stats} />
      )}
    </>
  );
};

export default Dashboard;
