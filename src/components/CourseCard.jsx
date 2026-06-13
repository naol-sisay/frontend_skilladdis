import { useNavigate } from "react-router-dom";

const FALLBACK = "https://placehold.co/600x400/1E293B/FFF?text=SkillAddis";

// Shared course card used by the catalog and the landing page so the
// course presentation stays identical everywhere.
const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col card-lift">
      <div className="relative h-44 bg-slate-200 overflow-hidden">
        <img
          src={course.thumbnail_url || FALLBACK}
          alt={course.title}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/600x400/1E293B/FFF?text=No+Image";
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 right-3 bg-white/95 backdrop-blur text-brand text-sm font-bold px-3 py-1 rounded-full shadow-sm">
          {course.price_etb > 0 ? `${course.price_etb} ETB` : "FREE"}
        </span>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-accent-soft text-accent-strong text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            {course.category || "General"}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            {course.scope || "All Levels"}
          </span>
        </div>

        <h3 className="text-lg font-extrabold text-brand mb-2 leading-snug line-clamp-2">
          {course.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-5 flex-grow">
          {course.description}
        </p>

        <button
          onClick={() => navigate(`/player/${course.course_id}`)}
          className="w-full py-3 bg-accent text-white font-bold rounded-xl shadow-sm hover:bg-accent-strong active:scale-[0.99] transition-all"
        >
          View Course
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
