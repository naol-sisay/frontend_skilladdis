// src/components/Register.jsx
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthLayout from './AuthLayout';

const ICON = {
    user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    pin: "M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
};

// Module-level so it isn't remounted each render (which would drop input focus).
const IconField = ({ label, icon, children }) => (
    <div>
        <label className="block text-sm font-bold text-brand mb-2">{label}</label>
        <div className="relative">
            {icon && (
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                    </svg>
                </span>
            )}
            {children}
        </div>
    </div>
);

const Register = () => {
    const navigate = useNavigate();
    const fileRef = useRef(null);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'student',
        phone: '',
        headline: '',
        location: '',
        bio: '',
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handlePhoto = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    // Step 1 → 2 (HTML `required` on the inputs guards the credential fields)
    const goToProfile = (e) => {
        e.preventDefault();
        setMessage('');
        setStep(2);
    };

    // Final submit. `withProfile` is false when the user taps "Skip for now",
    // in which case only the credential fields are sent.
    const submit = async (withProfile) => {
        setLoading(true);
        setMessage('');

        const { full_name, email, password, role } = formData;
        const payload = withProfile
            ? formData
            : { full_name, email, password, role };

        // 1. Create the account.
        try {
            await api.post('/auth/register', payload);
        } catch (error) {
            setLoading(false);
            setStep(1);
            setMessage(error.response?.data?.error || 'Registration failed');
            return;
        }

        // 2. Log in automatically so we can upload the photo and land in the app.
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);

            if (withProfile && photoFile) {
                const data = new FormData();
                data.append('avatar', photoFile);
                // A failed photo upload shouldn't block entry — they can retry on the profile page.
                try {
                    await api.post('/auth/profile/avatar', data, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                } catch { /* ignore — non-blocking */ }
            }

            // Hard redirect so AppShell immediately picks up the new auth state.
            window.location.href = '/dashboard';
        } catch {
            // Account exists but auto-login failed — send them to log in manually.
            navigate('/login');
        }
    };

    const inputClass =
        "w-full p-3.5 bg-canvas border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition text-brand font-medium placeholder:text-slate-400";
    const inputWithIcon = inputClass.replace("p-3.5", "p-3.5 pl-11");

    const roles = [
        { value: 'student', label: 'Student', desc: 'I want to learn' },
        { value: 'instructor', label: 'Instructor', desc: 'I want to teach' },
    ];

    return (
        <AuthLayout
            title={step === 1 ? "Welcome" : "Complete your profile"}
            subtitle={
                step === 1
                    ? "Create your SkillAddis account. Profile details can be skipped and completed later."
                    : "Add a few details so others can get to know you. This is optional — you can skip it for now."
            }
            panelTitle="Build Your SkillAddis Profile"
            panelSubtitle="Set up your account, choose your role, and add profile details at your own pace."
            progress={step === 1 ? 25 : 70}
            footer={
                step === 1
                    ? <>Already have an account? <Link to="/login" className="text-brand font-bold hover:text-accent transition-colors">Log in</Link></>
                    : <button type="button" onClick={() => { setStep(1); setMessage(''); }} className="text-brand font-bold hover:text-accent transition-colors">&larr; Back to account details</button>
            }
        >
            {step === 1 ? (
                <form onSubmit={goToProfile} className="flex flex-col gap-5">
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
                                            ? 'border-accent bg-accent-soft glow-accent'
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

                    {message && (
                        <p className="text-center font-semibold text-red-600 bg-red-50 py-2.5 rounded-lg animate-fade-in">{message}</p>
                    )}

                    <button
                        type="submit"
                        className="mt-1 w-full p-3.5 bg-accent text-white text-lg font-bold rounded-xl glow-accent hover:bg-accent-strong active:scale-[0.99] transition-all"
                    >
                        Continue
                    </button>
                </form>
            ) : (
                <form onSubmit={(e) => { e.preventDefault(); submit(true); }} className="flex flex-col gap-5">
                    {/* Profile photo */}
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand flex items-center justify-center text-white shrink-0">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="px-4 py-2.5 rounded-xl bg-accent-soft text-accent font-bold hover:bg-accent-softer transition-colors"
                            >
                                {photoFile ? "Change photo" : "Upload photo"}
                            </button>
                            <p className="text-xs text-slate-400 mt-1.5">Optional — JPG or PNG.</p>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                    </div>

                    <IconField label="Phone" icon={ICON.phone}>
                        <input className={inputWithIcon} type="tel" name="phone" placeholder="+251 ..."
                            value={formData.phone} onChange={handleChange} />
                    </IconField>

                    <div>
                        <label className="block text-sm font-bold text-brand mb-2">Professional headline</label>
                        <input className={inputClass} type="text" name="headline" placeholder="e.g. The fine art teacher"
                            value={formData.headline} onChange={handleChange} />
                    </div>

                    <IconField label="Location" icon={ICON.pin}>
                        <input className={inputWithIcon} type="text" name="location" placeholder="Addis Ababa, Ethiopia"
                            value={formData.location} onChange={handleChange} />
                    </IconField>

                    <div>
                        <label className="block text-sm font-bold text-brand mb-2">Bio</label>
                        <textarea className={inputClass} name="bio" rows="4" placeholder="Tell learners about yourself…"
                            value={formData.bio} onChange={handleChange} />
                    </div>

                    {message && (
                        <p className="text-center font-semibold text-red-600 bg-red-50 py-2.5 rounded-lg animate-fade-in">{message}</p>
                    )}

                    <div className="flex gap-3 mt-1">
                        <button
                            type="button"
                            onClick={() => submit(false)}
                            disabled={loading}
                            className="flex-1 p-3.5 bg-white border border-gray-200 text-brand text-lg font-bold rounded-xl hover:bg-slate-50 active:scale-[0.99] transition-all disabled:opacity-60"
                        >
                            Skip for now
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 p-3.5 bg-accent text-white text-lg font-bold rounded-xl glow-accent hover:bg-accent-strong active:scale-[0.99] transition-all disabled:opacity-60"
                        >
                            {loading ? "Creating account…" : "Finish"}
                        </button>
                    </div>
                </form>
            )}
        </AuthLayout>
    );
};

export default Register;
