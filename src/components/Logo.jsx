// The SkillAddis graduation-cap mark, reused across sidebar / welcome / auth.
export const CapMark = ({ className = "w-8 h-8 text-accent" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z" />
  </svg>
);

// Vertical lockup: cap on top, "SkillAddis" wordmark beneath.
export const StackedLogo = ({ capClass = "w-14 h-14 text-accent", textClass = "text-xl" }) => (
  <div className="flex flex-col items-center">
    <CapMark className={capClass} />
    <span className={`mt-2 font-extrabold text-brand tracking-tight ${textClass}`}>SkillAddis</span>
  </div>
);

// Full lockup: cap + wordmark (+ optional subtitle line).
const Logo = ({ subtitle, size = "text-2xl", capClass }) => (
  <div className="flex items-center gap-2.5">
    <CapMark className={capClass || "w-8 h-8 text-accent"} />
    <div className="leading-none">
      <span className={`block font-extrabold tracking-tight text-brand ${size}`}>SkillAddis</span>
      {subtitle && (
        <span className="block text-[11px] font-semibold text-slate-400 mt-1">{subtitle}</span>
      )}
    </div>
  </div>
);

export default Logo;
