import { useNavigate } from "react-router-dom";
import { StackedLogo } from "./Logo";

const Welcome = () => {
  const navigate = useNavigate();
  const authed = !!localStorage.getItem("token");

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas px-6">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="welcome-backdrop__beam" />
        <div className="welcome-backdrop__grid" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center py-14 sm:py-20">
        <div className="w-full max-w-2xl text-center">
          {/* Device with a logo card that pulls out of the dock on load */}
          <div className="welcome-scene" aria-hidden="true">
            <div className="welcome-screen">
              <div className="welcome-note welcome-note--left">
                <span className="welcome-note__bar" />
                <span className="welcome-note__line" />
              </div>
              <div className="welcome-note welcome-note--right">
                <span className="welcome-note__bar" />
                <span className="welcome-note__line" />
              </div>

              <div className="welcome-logo-card">
                <StackedLogo capClass="w-16 h-16 text-accent" textClass="text-2xl" />
              </div>

              <div className="welcome-dock">
                <span className="welcome-dock__slot" />
              </div>
            </div>

            <div className="welcome-progress"><span /></div>
          </div>

          <h1 className="text-4xl font-extrabold text-brand animate-fade-in-up sm:text-5xl">
            Welcome to SkillAddis
          </h1>
          <p className="mt-4 text-lg text-slate-500 animate-fade-in-up" style={{ animationDelay: "0.08s" }}>
            {authed ? "Pick up where you left off." : "Choose how you want to start learning."}
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 animate-fade-in-up sm:flex-row" style={{ animationDelay: "0.16s" }}>
            {authed ? (
              <>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 text-lg font-bold text-white glow-accent-lg transition-all hover:-translate-y-0.5 hover:bg-accent-strong"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate("/catalog")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-lg font-bold text-brand transition-all hover:bg-slate-50"
                >
                  Explore
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 text-lg font-bold text-white glow-accent-lg transition-all hover:-translate-y-0.5 hover:bg-accent-strong"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v6m3-3h-6M9 12a4 4 0 100-8 4 4 0 000 8zm0 0c-2.67 0-8 1.34-8 4v2h10" />
                  </svg>
                  I&apos;m new
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-lg font-bold text-brand transition-all hover:bg-slate-50"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  Log in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
