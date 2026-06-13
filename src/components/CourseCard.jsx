import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const FALLBACK = "https://placehold.co/600x400/1E293B/FFF?text=SkillAddis";

// Read the signed-in role from the JWT securely
const getRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return (JSON.parse(atob(token.split(".")[1])).role || "").toUpperCase();
  } catch {
    return null;
  }
};

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const role = getRole();
  const isStudent = role === "STUDENT";
  const isAuthenticated = role !== null;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openPlayer = () => navigate(`/player/${course.course_id}`);

  const handleAction = async () => {
    // 1. Unauthenticated Guest: Force login
    if (!isAuthenticated) {
      return navigate("/login", { state: { message: "Please log in to enroll." } });
    }

    // 2. Instructor / Admin: Bypass enrollment, allow preview
    if (!isStudent) {
      return openPlayer();
    }

    // 3. Student: Execute strict enrollment pipeline
    setLoading(true);
    setError("");
    
    try {
      await api.post("/student/enroll", { course_id: course.course_id });
      openPlayer();
    } catch (err) {
      // 409 = Already enrolled. Seamlessly route to player.
      if (err?.response?.status === 409) {
        openPlayer();
      } else {
        setError(err?.response?.data?.error || "Could not enroll. Please try again.");
        setLoading(false);
      }
    }
  };

  // Determine button text based on exact state
  const getButtonText = () => {
    if (!isAuthenticated) return "Log in to Enroll";
    if (!isStudent) return "View Course";
    if (loading) return "Enrolling…";
    return "Enroll Now";
  };

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

        {error && <p className="text-sm text-red-600 font-semibold mb-2">{error}</p>}

        <button
          onClick={handleAction}
          disabled={loading}
          className="w-full py-3 bg-accent text-white font-bold rounded-xl shadow-sm glow-accent hover:bg-accent-strong active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;