// src/components/MyCourses.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const FALLBACK = "https://placehold.co/600x400/1E293B/FFF?text=SkillAddis";

const MyCourses = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const response = await api.get('/student/my-courses');
                setEnrollments(response.data.my_courses || []);
            } catch {
                setError('Failed to load your courses. Please ensure you are logged in.');
            } finally {
                setLoading(false);
            }
        };
        fetchMyCourses();
    }, []);

    const formatDate = (d) => {
        try {
            return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return '';
        }
    };

    return (
        <div className="max-w-7xl mx-auto w-full px-6 py-12 mb-10">
            <div className="mb-10">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-brand tracking-tight">My Learning</h1>
                <p className="text-slate-500 mt-2 text-lg">Pick up right where you left off.</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <div className="h-40 skeleton" />
                            <div className="p-5 space-y-3">
                                <div className="h-4 w-3/4 skeleton rounded" />
                                <div className="h-3 w-1/2 skeleton rounded" />
                                <div className="h-10 w-full skeleton rounded-xl mt-4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-100 text-red-600 font-semibold text-center rounded-2xl p-10">
                    {error}
                </div>
            ) : enrollments.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-soft text-accent flex items-center justify-center mb-5">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-brand mb-2">No courses yet</h2>
                    <p className="text-slate-500 mb-8">Explore courses and enroll in your first one.</p>
                    <button
                        onClick={() => navigate('/catalog')}
                        className="bg-accent text-white px-8 py-3.5 rounded-xl font-bold glow-accent hover:bg-accent-strong transition-colors"
                    >
                        Explore Courses
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 stagger">
                    {enrollments.map((course) => (
                        <div
                            key={course.course_id}
                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col card-lift"
                        >
                            <div className="relative h-40 bg-slate-200 overflow-hidden">
                                <img
                                    src={course.thumbnail_url || FALLBACK}
                                    alt={course.title}
                                    onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK; }}
                                    className="w-full h-full object-cover"
                                />
                                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-green-700">
                                    {(course.status || 'enrolled').toUpperCase()}
                                </span>
                            </div>

                            <div className="p-5 flex flex-col flex-grow">
                                <h3 className="text-lg font-extrabold text-brand mb-1 line-clamp-2">{course.title}</h3>
                                <p className="text-sm text-slate-400 mb-5">Enrolled {formatDate(course.enrolled_at)}</p>

                                <button
                                    onClick={() => navigate(`/player/${course.course_id}`)}
                                    className="mt-auto w-full py-3 bg-brand text-white font-bold rounded-xl hover:bg-slate-800 active:scale-[0.99] transition-all"
                                >
                                    Continue Learning
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCourses;
