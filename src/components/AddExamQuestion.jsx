import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const AddExamQuestion = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    
    const [status, setStatus] = useState({ loading: false, error: null, success: false });
    const [formData, setFormData] = useState({
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "option_a" // Default select
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: null, success: false });

        try {
            await api.post(`/courses/exams/${examId}/questions`, formData);
            setStatus({ loading: false, error: null, success: true });
            
            // Reset form for the next question
            setFormData({
                question_text: "",
                option_a: "",
                option_b: "",
                option_c: "",
                option_d: "",
                correct_option: "option_a"
            });
            
            // Clear success message after 3 seconds
            setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 3000);
        } catch (err) {
            setStatus({ 
                loading: false, 
                error: err.response?.data?.error || "Failed to add question.", 
                success: false 
            });
        }
    };

    return (
        <div className="min-h-screen bg-canvas py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                
                <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
                    <h1 className="text-2xl font-bold text-brand">Add Exam Question</h1>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md font-mono text-sm">
                        Exam ID: {examId}
                    </span>
                </div>

                {status.error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 font-bold">{status.error}</div>}
                {status.success && <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 font-bold">Question added successfully!</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Question Text</label>
                        <textarea 
                            name="question_text"
                            value={formData.question_text}
                            onChange={handleChange}
                            required
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                            rows="3"
                            placeholder="e.g., What does API stand for?"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['a', 'b', 'c', 'd'].map((letter) => (
                            <div key={letter}>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase">
                                    Option {letter}
                                </label>
                                <input 
                                    type="text"
                                    name={`option_${letter}`}
                                    value={formData[`option_${letter}`]}
                                    onChange={handleChange}
                                    required={letter === 'a' || letter === 'b'} // Force at least A and B
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                                    placeholder={`Answer ${letter.toUpperCase()}`}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Select Correct Answer</label>
                        <select 
                            name="correct_option"
                            value={formData.correct_option}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-accent outline-none font-bold"
                        >
                            <option value="option_a">Option A</option>
                            <option value="option_b">Option B</option>
                            <option value="option_c">Option C</option>
                            <option value="option_d">Option D</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
                        <button 
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={status.loading}
                            className="bg-brand text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 transition"
                        >
                            {status.loading ? "Saving..." : "Save Question"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExamQuestion;