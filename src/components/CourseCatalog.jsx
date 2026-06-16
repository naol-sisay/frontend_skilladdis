import { useState, useEffect } from "react";
import api from "../api/axios";
import CourseCard from "./CourseCard";

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCatalog = async (query = "") => {
    setLoading(true);
    try {
      const endpoint = query
        ? `/courses?search=${encodeURIComponent(query)}`
        : "/courses";
      const res = await api.get(endpoint);
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error("Failed to fetch the catalog.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCatalog(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
    fetchCatalog("");
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-6 py-12 mb-10">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 mb-3 text-xs font-bold uppercase tracking-wider text-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Course catalog
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
          Explore Courses
        </h1>
        <p className="mt-3 text-lg text-ink-muted">
          Find your next skill and start learning today.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-12">
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-surface shadow-md rounded-2xl border border-line overflow-hidden focus-within:ring-2 focus-within:ring-accent transition"
        >
          <svg className="w-5 h-5 text-ink-faint ml-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search for Python, Business, Design…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 outline-none text-ink font-medium placeholder:text-ink-faint"
          />
          {searchTerm && (
            <button type="button" onClick={handleClear} className="px-3 text-ink-faint hover:text-red-500 transition" aria-label="Clear">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            className="bg-accent text-white px-6 sm:px-8 py-4 font-bold hover:bg-accent-strong transition tracking-wide self-stretch"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl border border-line overflow-hidden">
              <div className="h-44 skeleton" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-1/3 skeleton rounded" />
                <div className="h-5 w-3/4 skeleton rounded" />
                <div className="h-3 w-full skeleton rounded" />
                <div className="h-11 w-full skeleton rounded-xl mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-ink mb-2">No results found</h2>
          <p className="text-ink-muted">Try adjusting your search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 stagger">
          {courses.map((course) => (
            <CourseCard key={course.course_id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;
