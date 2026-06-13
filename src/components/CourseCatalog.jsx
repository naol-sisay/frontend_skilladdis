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
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand tracking-tight">
          Explore Courses
        </h1>
        <p className="mt-3 text-lg text-slate-500">
          Find your next skill and start learning today.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-12">
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-white shadow-md rounded-2xl border border-gray-100 overflow-hidden focus-within:ring-2 focus-within:ring-accent transition"
        >
          <svg className="w-5 h-5 text-slate-400 ml-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search for Python, Business, Design…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 outline-none text-brand font-medium placeholder:text-slate-400"
          />
          {searchTerm && (
            <button type="button" onClick={handleClear} className="px-3 text-slate-400 hover:text-red-500 transition" aria-label="Clear">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            className="bg-brand text-white px-6 sm:px-8 py-4 font-bold hover:bg-slate-800 transition tracking-wide self-stretch"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
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
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-brand mb-2">No results found</h2>
          <p className="text-slate-500">Try adjusting your search keywords.</p>
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
