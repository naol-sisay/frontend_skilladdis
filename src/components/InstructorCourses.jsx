import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Metric = ({ label, value, icon }) => (
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

const GlanceRow = ({ label, value }) => (
  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50">
    <span className="text-sm font-semibold text-slate-600">{label}</span>
    <span className="font-extrabold text-brand">{value}</span>
  </div>
);

const InstructorCourses = () => {
  const navigate = useNavigate();
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    let myId = null;
    try {
      myId = JSON.parse(atob(token.split(".")[1])).user_id;
    } catch {
      navigate("/login");
      return;
    }
    api
      .get("/courses")
      .then((r) => {
        const all = r.data.courses || [];
        setMine(all.filter((c) => c.instructor_id === myId));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  const published = mine.length;
  const paid = mine.filter((c) => Number(c.price_etb) > 0).length;
  const free = mine.filter((c) => !Number(c.price_etb)).length;
  const withCover = mine.filter((c) => c.thumbnail_url).length;
  const missingCover = published - withCover;

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto w-full">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-brand">My Courses</h1>
          <p className="mt-2 text-slate-500">Edit lesson content, update pricing, preview the player, or review what needs attention.</p>
        </div>
        <button
          onClick={() => navigate("/create-course")}
          className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-blue-900/10 hover:bg-accent-strong transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Create course
        </button>
      </div>

      {/* metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <Metric label="Published" value={published} icon="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        <Metric label="Paid" value={paid} icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        <Metric label="Free" value={free} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        <Metric label="With cover" value={withCover} icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4z" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* course list */}
        <section className="lg:col-span-2">
          <h2 className="text-2xl font-extrabold text-brand mb-4">Your courses</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}
            </div>
          ) : mine.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-accent-soft text-accent flex items-center justify-center mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <p className="text-xl font-bold text-brand mb-1">No published courses yet</p>
              <p className="text-slate-400 mb-6">Create your first course and it will appear here.</p>
              <button onClick={() => navigate("/create-course")} className="bg-accent text-white px-7 py-3 rounded-xl font-bold hover:bg-accent-strong transition-colors">Create course</button>
            </div>
          ) : (
            <div className="space-y-3">
              {mine.map((c) => (
                <div key={c.course_id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 card-lift">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {c.thumbnail_url ? (
                      <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-accent">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4z" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-brand truncate">{c.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-bold uppercase tracking-wide bg-accent-soft text-accent px-2 py-0.5 rounded-full">{c.category || "General"}</span>
                      <span className="text-xs font-semibold text-slate-400">{Number(c.price_etb) > 0 ? `${c.price_etb} ETB` : "Free"}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/player/${c.course_id}`)}
                    className="text-sm font-bold text-brand border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors shrink-0"
                  >
                    Preview
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* side panels */}
        <aside className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </span>
              <div>
                <p className="font-bold text-brand">Needs attention</p>
                <p className="text-xs text-slate-400">Courses that still need cleanup</p>
              </div>
            </div>
            {missingCover > 0 ? (
              <p className="bg-amber-50 text-amber-700 text-sm font-semibold rounded-xl px-4 py-3">
                {missingCover} course{missingCover > 1 ? "s are" : " is"} missing a cover image.
              </p>
            ) : (
              <p className="bg-green-50 text-green-700 text-sm font-semibold rounded-xl px-4 py-3">
                All published courses have the basics in place.
              </p>
            )}
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6">
            <p className="font-bold text-brand mb-1">At a glance</p>
            <p className="text-xs text-slate-400 mb-4">Simple course status summary</p>
            <div className="space-y-2.5">
              <GlanceRow label="Free courses" value={free} />
              <GlanceRow label="Paid courses" value={paid} />
              <GlanceRow label="Missing cover image" value={missingCover} />
              <GlanceRow label="Total courses" value={published} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default InstructorCourses;
