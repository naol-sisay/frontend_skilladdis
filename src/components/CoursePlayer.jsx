import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [syllabus, setSyllabus] = useState([]);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false); // mobile sidebar

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const res = await api.get(`/courses/${courseId}/syllabus`);
        setCourse(res.data.course);
        setSyllabus(res.data.syllabus);
        if (res.data.syllabus.length > 0 && res.data.syllabus[0].materials.length > 0) {
          setActiveMaterial(res.data.syllabus[0].materials[0]);
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
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center text-white gap-4">
        <div className="w-12 h-12 border-4 border-white/20 border-t-accent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Loading your classroom…</p>
      </div>
    );
  }

  const flatMaterials = syllabus.flatMap((section) => section.materials || []);
  const currentIndex = activeMaterial
    ? flatMaterials.findIndex((m) => m.material_id === activeMaterial.material_id)
    : -1;
  const total = flatMaterials.length;
  const isLastLesson = currentIndex !== -1 && currentIndex === total - 1;
  const isFirstLesson = currentIndex === 0;
  const progress = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0;

  const pickMaterial = (mat) => {
    setActiveMaterial(mat);
    setDrawerOpen(false);
  };

  const Sidebar = (
    <div className="h-full bg-brand text-white flex flex-col scroll-slim overflow-y-auto">
      <div className="p-6 sticky top-0 bg-brand z-10 border-b border-slate-700/60">
        <button
          onClick={() => navigate("/my-courses")}
          className="text-slate-400 text-sm hover:text-white transition-colors mb-3 flex items-center gap-1"
        >
          &larr; Exit Course
        </button>
        <h2 className="font-bold text-lg leading-snug line-clamp-2">{course?.title}</h2>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Progress</span>
            <span>{currentIndex + 1} / {total}</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {syllabus.map((section) => (
          <div key={section.section_id} className="rounded-xl border border-slate-700/60 overflow-hidden">
            <div className="p-3.5 bg-slate-800 text-accent font-bold text-[10px] uppercase tracking-wider">
              {section.title}
            </div>
            <div className="flex flex-col">
              {section.materials?.map((mat) => {
                const isActive = activeMaterial?.material_id === mat.material_id;
                return (
                  <button
                    key={mat.material_id}
                    onClick={() => pickMaterial(mat)}
                    className={`w-full text-left p-3.5 text-sm transition-all duration-200 border-l-4 flex items-center gap-3 ${
                      isActive
                        ? "bg-slate-700 border-accent text-white"
                        : "border-transparent hover:bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    <span className="shrink-0 text-slate-500">
                      {(mat.type || mat.material_type) === "video" ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      )}
                    </span>
                    <span className="line-clamp-2">{mat.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-80 shrink-0 h-screen sticky top-0">{Sidebar}</div>

      {/* Mobile drawer + overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
        <div
          className={`absolute inset-y-0 left-0 w-80 max-w-[85%] transition-transform duration-300 ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {Sidebar}
        </div>
      </div>

      {/* Main stage */}
      <div className="flex-1 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-brand text-white flex items-center gap-3 px-4 h-14 shadow-md">
          <button onClick={() => setDrawerOpen(true)} className="p-1.5 -ml-1.5" aria-label="Open lessons">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold truncate">{course?.title}</span>
        </div>

        <div className="flex-1 p-5 sm:p-8 lg:p-10 overflow-y-auto">
          {activeMaterial ? (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <p className="text-xs font-bold text-accent uppercase tracking-wider mb-2">
                Lesson {currentIndex + 1} of {total}
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand mb-6">{activeMaterial.title}</h1>

              {(activeMaterial.type || activeMaterial.material_type) === "video" ? (
                <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                  <iframe
                    className="w-full aspect-video rounded-xl"
                    src={getEmbedUrl(activeMaterial.content)}
                    title={activeMaterial.title}
                    allowFullScreen
                  />
                </div>
              ) : (
                <article className="bg-white px-6 py-8 sm:px-12 sm:py-12 rounded-2xl shadow-sm border border-gray-100">
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

              <div className="mt-8 flex justify-between items-center border-t border-gray-200 pt-6">
                <button
                  disabled={isFirstLesson}
                  onClick={() => setActiveMaterial(flatMaterials[currentIndex - 1])}
                  className={`font-bold transition ${
                    isFirstLesson ? "text-gray-300 cursor-not-allowed" : "text-slate-500 hover:text-brand"
                  }`}
                >
                  &larr; Previous
                </button>

                {isLastLesson ? (
                  <button
                    onClick={() => navigate(`/exam/${courseId}`)}
                    className="bg-accent text-white px-6 sm:px-8 py-3 rounded-xl font-bold glow-accent hover:bg-accent-strong transition"
                  >
                    Take Final Exam
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveMaterial(flatMaterials[currentIndex + 1])}
                    className="bg-brand text-white px-6 sm:px-8 py-3 rounded-xl font-bold shadow-md hover:bg-slate-800 transition"
                  >
                    Next Lesson &rarr;
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center mt-20 text-slate-500">Select a lesson to begin.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
