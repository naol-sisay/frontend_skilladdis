import { useNavigate } from "react-router-dom";
import { CapMark } from "./Logo";

const Welcome = () => {
  const navigate = useNavigate();
  const authed = !!localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-6 overflow-hidden">
      <div className="w-full max-w-xl text-center">
        {/* Animated logo stage */}
        <div className="relative h-64 mb-4 flex items-center justify-center" aria-hidden="true">
          {/* floating cards */}
          <div className="absolute left-1/2 top-6 -translate-x-[150%] w-44 h-24 rounded-2xl bg-accent-soft animate-float" style={{ animationDelay: "0.2s" }}>
            <div className="m-5 h-2.5 w-20 rounded-full bg-accent/60" />
            <div className="mx-5 h-2 w-28 rounded-full bg-slate-200" />
          </div>
          <div className="absolute left-1/2 top-4 translate-x-[55%] w-44 h-24 rounded-2xl bg-white border border-slate-100 shadow-sm animate-float" style={{ animationDelay: "0.6s" }}>
            <div className="m-5 h-2.5 w-20 rounded-full bg-accent/60" />
            <div className="mx-5 h-2 w-24 rounded-full bg-slate-200" />
          </div>

          {/* center logo card */}
          <div className="relative animate-scale-in flex flex-col items-center">
            <div className="w-28 h-28 rounded-3xl bg-white border border-slate-100 shadow-xl flex items-center justify-center">
              <CapMark className="w-14 h-14 text-accent animate-float" />
            </div>
            {/* wordmark under the hat */}
            <div className="mt-4 text-2xl font-extrabold text-brand tracking-tight">SkillAddis</div>
            <div className="mt-3 w-40 h-1.5 rounded-full bg-gradient-to-r from-accent to-accent-soft overflow-hidden">
              <div className="h-full w-1/2 bg-white/50 animate-shimmer" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-brand animate-fade-in-up">
          Welcome to SkillAddis
        </h1>
        <p className="mt-4 text-lg text-slate-500 animate-fade-in-up" style={{ animationDelay: "0.08s" }}>
          {authed ? "Jump back into your learning." : "Choose how you want to continue."}
        </p>

        <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.16s" }}>
          {authed ? (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/20 hover:bg-accent-strong hover:-translate-y-0.5 transition-all"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate("/catalog")}
                className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-brand px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all"
              >
                Browse Catalog
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/register")}
                className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/20 hover:bg-accent-strong hover:-translate-y-0.5 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v6m3-3h-6M9 12a4 4 0 100-8 4 4 0 000 8zm0 0c-2.67 0-8 1.34-8 4v2h10" />
                </svg>
                I'm new
              </button>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-brand px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                </svg>
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Welcome;
