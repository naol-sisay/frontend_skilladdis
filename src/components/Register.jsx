// src/components/Register.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import AuthLayout from './AuthLayout';

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'student',
    });
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);
        try {
            const response = await api.post('/auth/register', formData);
            setSuccess(true);
            setMessage(response.data.message || 'Account created successfully!');
        } catch (error) {
            setSuccess(false);
            setMessage(error.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full p-3.5 bg-canvas border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition text-brand font-medium placeholder:text-slate-400";

    const roles = [
        { value: 'student', label: 'Student', desc: 'I want to learn' },
        { value: 'instructor', label: 'Instructor', desc: 'I want to teach' },
    ];

    return (
        <AuthLayout
            title="Welcome"
            subtitle="Create your SkillAddis account. Profile details can be skipped and completed later."
            panelTitle="Build Your SkillAddis Profile"
            panelSubtitle="Set up your account, choose your role, and add profile details at your own pace."
            progress={15}
            footer={
                <>Already have an account? <Link to="/login" className="text-brand font-bold hover:text-accent transition-colors">Log in</Link></>
            }
        >
            {success ? (
                <div className="text-center bg-green-50 border border-green-100 rounded-2xl p-8 animate-scale-in">
                    <div className="w-14 h-14 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-brand mb-2">You're all set!</h3>
                    <p className="text-slate-600 mb-6">{message}</p>
                    <Link
                        to="/login"
                        className="inline-block w-full p-3.5 bg-accent text-white font-bold rounded-xl hover:bg-accent-strong transition-colors shadow-md"
                    >
                        Continue to Log In
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-bold text-brand mb-2">I want to join as</label>
                        <div className="grid grid-cols-2 gap-3">
                            {roles.map((r) => (
                                <button
                                    type="button"
                                    key={r.value}
                                    onClick={() => setFormData({ ...formData, role: r.value })}
                                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                                        formData.role === r.value
                                            ? 'border-accent bg-accent-soft'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="block font-bold text-brand">{r.label}</span>
                                    <span className="block text-xs text-slate-500 mt-0.5">{r.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-brand mb-2">Full name</label>
                        <input className={inputClass} type="text" name="full_name" placeholder="Abebe Bekele"
                            value={formData.full_name} onChange={handleChange} required />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-brand mb-2">Email address</label>
                        <input className={inputClass} type="email" name="email" placeholder="you@example.com"
                            value={formData.email} onChange={handleChange} required />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-brand mb-2">Password</label>
                        <input className={inputClass} type="password" name="password" placeholder="At least 6 characters"
                            value={formData.password} onChange={handleChange} required />
                    </div>

                    {message && !success && (
                        <p className="text-center font-semibold text-red-600 bg-red-50 py-2.5 rounded-lg animate-fade-in">{message}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-1 w-full p-3.5 bg-accent text-white text-lg font-bold rounded-xl hover:bg-accent-strong active:scale-[0.99] transition-all shadow-md disabled:opacity-60"
                    >
                        {loading ? "Creating account…" : "Create Account"}
                    </button>
                </form>
            )}
        </AuthLayout>
    );
};

export default Register;
