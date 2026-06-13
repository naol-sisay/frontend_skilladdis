import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api, { resolveAsset } from "../api/axios";

const initials = (name = "") => {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "?";
  return (p.length === 1 ? p[0].slice(0, 2) : p[0][0] + p[p.length - 1][0]).toUpperCase();
};

const Field = ({ label, icon, children }) => (
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

const ICON = {
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  pin: "M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
};

const Profile = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ full_name: "", headline: "", phone: "", location: "", bio: "" });

  const flash = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) return navigate("/login");
    api.get("/auth/me").then((r) => {
      const u = r.data.user;
      setUser(u);
      setForm({
        full_name: u.full_name || "", headline: u.headline || "",
        phone: u.phone || "", location: u.location || "", bio: u.bio || "",
      });
    }).catch(() => navigate("/login")).finally(() => setLoading(false));
  }, [navigate]);

  const save = async (e) => {
    e?.preventDefault();
    if (!form.full_name.trim()) return flash("error", "Full name is required.");
    setSaving(true);
    try {
      await api.put("/auth/profile", form);
      setUser((u) => ({ ...u, ...form }));
      flash("success", "Profile saved.");
      window.dispatchEvent(new Event("profile-updated"));
    } catch {
      flash("error", "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("avatar", file);
    setUploading(true);
    try {
      const r = await api.post("/auth/profile/avatar", data, { headers: { "Content-Type": "multipart/form-data" } });
      setUser((u) => ({ ...u, profile_picture_url: r.data.profile_picture_url }));
      flash("success", "Photo updated.");
      window.dispatchEvent(new Event("profile-updated"));
    } catch (err) {
      flash("error", err.response?.data?.error || "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const input = "w-full p-3.5 pl-11 bg-canvas border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition text-brand font-medium placeholder:text-slate-400";

  if (loading) {
    return (
      <div className="p-6 sm:p-10 max-w-6xl mx-auto w-full">
        <div className="h-28 skeleton rounded-2xl mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="h-96 skeleton rounded-2xl" />
          <div className="lg:col-span-2 h-96 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }
  if (!user) return null;

  const checklist = [
    { label: "Name", done: !!user.full_name },
    { label: "Headline", done: !!user.headline },
    { label: "Photo", done: !!user.profile_picture_url },
    { label: "Phone", done: !!user.phone },
    { label: "Location", done: !!user.location },
    { label: "Bio", done: !!user.bio },
  ];
  const completion = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);
  const avatarUrl = resolveAsset(user.profile_picture_url);

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto w-full">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-semibold animate-fade-in-down ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.text}
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl p-8 mb-8">
        <h1 className="text-4xl font-extrabold text-brand">Profile settings</h1>
        <p className="mt-3 text-slate-500 max-w-2xl">
          Keep your account details current for course access, records, and platform communication.
        </p>
      </div>

      <form onSubmit={save} className="grid lg:grid-cols-3 gap-8 items-start">
        {/* left column */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6">
            <div className="w-40 h-40 mx-auto rounded-2xl overflow-hidden bg-brand flex items-center justify-center text-white text-5xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
              {avatarUrl ? <img src={avatarUrl} alt={user.full_name} className="w-full h-full object-cover" /> : initials(user.full_name)}
            </div>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-accent text-white py-3 rounded-xl font-bold hover:bg-accent-strong transition-colors disabled:opacity-60"
            >
              {uploading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              )}
              Upload photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={upload} className="hidden" />

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-brand">Profile completion</span>
                <span className="font-extrabold text-accent">{completion}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6">
            <p className="font-bold text-brand mb-4">Completion checklist</p>
            <div className="space-y-2.5">
              {checklist.map((c) => (
                <div key={c.label} className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50">
                  <span className="font-semibold text-slate-600">{c.label}</span>
                  <span className={c.done ? "text-green-600" : "text-slate-300"}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={c.done ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
                    </svg>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* right column — form */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 sm:p-8">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Full name" icon={ICON.user}>
              <input className={input} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Your name" />
            </Field>
            <Field label="Email address" icon={ICON.mail}>
              <input className={input + " bg-slate-100 text-slate-500 cursor-not-allowed"} value={user.email} readOnly />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Professional headline">
                <input className={input.replace("pl-11", "pl-3.5")} value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="e.g. The fine art teacher" />
              </Field>
            </div>
            <Field label="Phone" icon={ICON.phone}>
              <input className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+251 ..." />
            </Field>
            <Field label="Location" icon={ICON.pin}>
              <input className={input} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Addis Ababa, Ethiopia" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Bio">
                <textarea className={input.replace("pl-11", "pl-3.5")} rows="5" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell learners about yourself…" />
              </Field>
            </div>
          </div>

          <div className="mt-7 flex justify-end">
            <button type="submit" disabled={saving} className="bg-accent text-white px-8 py-3.5 rounded-xl font-bold hover:bg-accent-strong transition-colors shadow-md disabled:opacity-60">
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
