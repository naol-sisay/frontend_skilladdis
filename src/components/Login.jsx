import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import AuthLayout from './AuthLayout';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', credentials);
            localStorage.setItem('token', res.data.token);
            // Hard routing forces the Navbar to immediately recognize the new auth state
            window.location.href = '/dashboard';
        } catch {
            setError('Invalid email or password.');
            setLoading(false);
        }
    };

    const inputClass =
        "w-full p-3.5 bg-canvas border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition text-brand font-medium placeholder:text-slate-400";

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to continue learning on SkillAddis."
            footer={
                <>Don't have an account? <Link to="/register" className="text-brand font-bold hover:text-accent transition-colors">Sign up</Link></>
            }
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                    <label className="block text-sm font-bold text-brand mb-2">Email address</label>
                    <input
                        className={inputClass}
                        type="email" name="email" placeholder="you@example.com" onChange={handleChange} required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-brand mb-2">Password</label>
                    <div className="relative">
                        <input
                            className={inputClass + " pr-12"}
                            type={showPw ? "text" : "password"} name="password" placeholder="••••••••" onChange={handleChange} required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand text-sm font-semibold"
                        >
                            {showPw ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                {error && (
                    <p className="text-center font-semibold text-red-600 bg-red-50 py-2.5 rounded-lg animate-fade-in">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 w-full p-3.5 bg-accent text-white text-lg font-bold rounded-xl glow-accent hover:bg-accent-strong active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? "Signing in…" : "Log In"}
                </button>
            </form>
        </AuthLayout>
    );
};

export default Login;
