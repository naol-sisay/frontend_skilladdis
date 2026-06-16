import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { CapMark } from "./Logo";

/* ---------- lesson type helpers ---------- */

const typeKey = (mat) => (mat?.type || mat?.material_type || "").toLowerCase();

const TYPE_LABEL = {
  video: "Video",
  reading: "Reading",
  text: "Reading",
  article: "Reading",
  ebook: "Ebook",
  quiz: "Quiz",
  assignment: "Assignment",
  exam: "Exam",
};
const labelFor = (mat) => TYPE_LABEL[typeKey(mat)] || "Lesson";

const LessonIcon = ({ type, className = "w-4 h-4" }) => {
  switch (type) {
    case "video":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
      );
    case "quiz":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "assignment":
    case "exam":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      );
    case "ebook":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    default: // reading / text / unknown
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
  }
};

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [syllabus, setSyllabus] = useState([]);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false); // mobile sidebar
  const [openSections, setOpenSections] = useState(() => new Set());

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const res = await api.get(`/courses/${courseId}/syllabus`);
        setCourse(res.data.course);
        setSyllabus(res.data.syllabus);
        const first = res.data.syllabus?.[0];
        if (first?.materials?.length > 0) {
          setActiveMaterial(first.materials[0]);
          setOpenSections(new Set([first.section_id]));
        }
      } catch (err) {
        console.error("Failed to load syllabus.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSyllabus();
  }, [courseId]);

  const getEmbedUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center text-white gap-7 px-6">
        <div className="classroom-loader">
          <span className="classroom-loader__ring" />
          <span className="classroom-loader__ring classroom-loader__ring--2" />
          <span className="classroom-loader__badge">
            <CapMark className="w-9 h-9 text-white" />
          </span>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold tracking-tight">Loading your classroom…</p>
          <p className="text-slate-400 text-sm mt-1">Preparing your lessons and materials</p>
        </div>
        <div className="classroom-loader__bar"><span /></div>
      </div>
    );
  }

  const flatMaterials = syllabus.flatMap((section) => section.materials || []);
  const sectionOf = {};
  syllabus.forEach((s) => (s.materials || []).forEach((m) => (sectionOf[m.material_id] = s.section_id)));

  const currentIndex = activeMaterial
    ? flatMaterials.findIndex((m) => m.material_id === activeMaterial.material_id)
    : -1;
  const total = flatMaterials.length;
  const isLastLesson = currentIndex !== -1 && currentIndex === total - 1;
  const isFirstLesson = currentIndex === 0;
  const progress = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0;
  const isVideo = typeKey(activeMaterial) === "video";

  const goTo = (idx) => {
    const mat = flatMaterials[idx];
    if (!mat) return;
    setActiveMaterial(mat);
    setOpenSections((prev) => new Set(prev).add(sectionOf[mat.material_id]));
    setDrawerOpen(false);
  };

  const pickMaterial = (mat, sectionId) => {
    setActiveMaterial(mat);
    setOpenSections((prev) => new Set(prev).add(sectionId));
    setDrawerOpen(false);
  };

  const toggleSection = (id) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const Sidebar = (
    <div className="h-full bg-gradient-to-b from-accent-softer to-white flex flex-col scroll-slim overflow-y-auto">
      <div className="p-6 border-b border-accent-soft">
        <h2 className="text-lg font-extrabold text-brand">Course Content</h2>
        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{course?.title}</p>

        {/* progress card */}
        <div className="mt-4 rounded-2xl border border-accent-soft bg-white shadow-sm p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-brand">Your progress</span>
            <span className="text-sm font-semibold text-slate-500">{currentIndex + 1} of {total} lessons</span>
          </div>
          <div className="mt-3 h-2 bg-accent-soft rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{progress}% complete</span>
            <span className="text-xs font-bold text-accent">{progress >= 100 ? "Completed 🎉" : "Keep going! 🎉"}</span>
          </div>
        </div>
      </div>

      {/* sections */}
      <div className="px-4 py-4 flex flex-col gap-2.5">
        {syllabus.map((section, si) => {
          const open = openSections.has(section.section_id);
          return (
            <div key={section.section_id} className="rounded-2xl border border-accent-soft overflow-hidden bg-white shadow-sm shadow-accent/5">
              <button
                onClick={() => toggleSection(section.section_id)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-accent-softer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 shrink-0 rounded-lg bg-accent-soft text-accent flex items-center justify-center text-xs font-extrabold">
                    {String(si + 1).padStart(2, "0")}
                  </span>
                  <span className="font-bold text-brand text-sm truncate">{section.title}</span>
                </div>
                <svg className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {open && (
                <div className="flex flex-col pb-2">
                  {section.materials?.map((mat) => {
                    const isActive = activeMaterial?.material_id === mat.material_id;
                    return (
                      <button
                        key={mat.material_id}
                        onClick={() => pickMaterial(mat, section.section_id)}
                        className={`w-full text-left px-4 py-3 flex items-start gap-3 border-l-[3px] transition-colors ${
                          isActive ? "border-accent bg-accent-soft" : "border-transparent hover:bg-accent-softer"
                        }`}
                      >
                        <span className={`mt-0.5 shrink-0 ${isActive ? "text-accent" : "text-slate-400"}`}>
                          <LessonIcon type={typeKey(mat)} />
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-sm font-semibold leading-snug line-clamp-2 ${isActive ? "text-brand" : "text-slate-600"}`}>
                            {mat.title}
                          </span>
                          <span className="block text-xs text-slate-400 mt-0.5">{labelFor(mat)}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 h-16 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-brand font-semibold transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <span className="hidden md:block font-bold text-brand truncate max-w-md">{course?.title}</span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 text-sm font-bold text-brand border border-slate-200 rounded-xl px-3 py-2 hover:bg-slate-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Lessons
          </button>
          <button
            onClick={() => navigate("/my-courses")}
            aria-label="Exit course"
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-brand hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 lg:flex min-h-0">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-80 shrink-0 border-r border-slate-100 bg-white h-[calc(100vh-4rem)] sticky top-16 overflow-hidden">
          {Sidebar}
        </aside>

        {/* Mobile drawer */}
        <div
          className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
            drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div
            className={`absolute inset-y-0 left-0 w-80 max-w-[85%] bg-white shadow-2xl transition-transform duration-300 ${
              drawerOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {Sidebar}
          </div>
        </div>

        {/* Main stage */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-5 sm:p-8">
            {activeMaterial ? (
              <div key={activeMaterial.material_id} className="animate-fade-in">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">
                    Lesson {currentIndex + 1} of {total}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-accent-soft text-accent">
                    {labelFor(activeMaterial)}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-brand mb-5">{activeMaterial.title}</h1>

                {/* stage */}
                {isVideo ? (
                  <div className="rounded-2xl overflow-hidden bg-brand-dark border border-slate-200/70 shadow-xl shadow-slate-900/10">
                    <iframe
                      className="w-full aspect-video"
                      src={getEmbedUrl(activeMaterial.content)}
                      title={activeMaterial.title}
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <article className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-8 sm:px-12 sm:py-12">
                    <div className="max-w-[68ch] mx-auto text-slate-700 text-[17px] sm:text-lg leading-8 break-words">
                      {String(activeMaterial.content || "")
                        .split(/\n{2,}/)
                        .map((para, i) => (
                          <p key={i} className="mb-6 last:mb-0 whitespace-pre-wrap">
                            {para}
                          </p>
                        ))}
                    </div>
                  </article>
                )}

                {/* overview card */}
                {course?.description && (
                  <div className="mt-6 bg-white rounded-2xl border border-slate-100 p-6 sm:p-7">
                    <div className="flex gap-2 border-b border-slate-100 pb-3 mb-4">
                      <span className="px-4 py-1.5 rounded-lg bg-accent text-white text-sm font-bold">Overview</span>
                    </div>
                    <h3 className="font-bold text-brand mb-2">About this course</h3>
                    <p className="text-slate-600 leading-7 whitespace-pre-wrap">{course.description}</p>
                  </div>
                )}

                {/* nav footer */}
                <div className="mt-6 flex items-center justify-between gap-4 bg-white rounded-2xl border border-slate-100 p-4 sm:p-5">
                  <button
                    disabled={isFirstLesson}
                    onClick={() => goTo(currentIndex - 1)}
                    className={`inline-flex items-center gap-2 font-bold transition-colors ${
                      isFirstLesson ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:text-brand"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    Previous
                  </button>

                  {isLastLesson ? (
                    <button
                      onClick={() => navigate(`/exam/${courseId}`)}
                      className="inline-flex items-center gap-2 bg-accent text-white px-6 sm:px-8 py-3 rounded-xl font-bold glow-accent hover:bg-accent-strong active:scale-[0.99] transition-all"
                    >
                      Take Final Exam
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => goTo(currentIndex + 1)}
                      className="inline-flex items-center gap-2 bg-brand text-white px-6 sm:px-8 py-3 rounded-xl font-bold hover:bg-slate-800 active:scale-[0.99] transition-all"
                    >
                      Next lesson
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center mt-20 text-slate-500">Select a lesson to begin.</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoursePlayer;
