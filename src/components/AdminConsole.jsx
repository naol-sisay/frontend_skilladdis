import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

/* =====================================================================
   Hidden Admin Console — reached only by typing /admin.
   Not linked anywhere in the UI. Logs in via the normal /auth/login,
   then refuses anyone whose JWT role isn't "admin". Every API call is
   also enforced server-side by requireRole('admin").
   ===================================================================== */

const roleFromToken = (token) => {
  if (!token) return null;
  try {
    return (JSON.parse(atob(token.split(".")[1])).role || "").toLowerCase();
  } catch {
    return null;
  }
};

const ROLES = ["student", "instructor", "admin"];
const STATUSES = ["pending_approval", "approved", "rejected", "archived"];

const statusStyle = {
  approved: "bg-green-100 text-green-700",
  pending_approval: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
  archived: "bg-slate-200 text-slate-600",
};

/* ------------------------------- Login ------------------------------- */
const AdminLogin = ({ onAuthed }) => {
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", creds);
      const token = res.data.token;
      if (roleFromToken(token) !== "admin") {
        setError("This account does not have admin access.");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", token);
      onAuthed();
    } catch {
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  const input =
    "w-full p-3.5 bg-canvas border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition text-brand font-medium placeholder:text-slate-400";

  return (
    <div className="min-h-screen bg-brand flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 glow-accent-lg">
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-accent-soft text-accent flex items-center justify-center mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-brand">Admin Console</h1>
            <p className="text-slate-500 mt-1 text-sm">Restricted access. Authorized staff only.</p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <input
              className={input}
              type="email"
              placeholder="admin@email.com"
              value={creds.email}
              onChange={(e) => setCreds({ ...creds, email: e.target.value })}
              required
            />
            <input
              className={input}
              type="password"
              placeholder="••••••••"
              value={creds.password}
              onChange={(e) => setCreds({ ...creds, password: e.target.value })}
              required
            />
            {error && (
              <p className="text-center font-semibold text-red-600 bg-red-50 py-2.5 rounded-lg">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3.5 bg-accent text-white text-lg font-bold rounded-xl glow-accent hover:bg-accent-strong active:scale-[0.99] transition-all disabled:opacity-60"
            >
              {loading ? "Verifying…" : "Enter console"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------- Stat card ------------------------------ */
const Stat = ({ label, value, tone = "brand" }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5">
    <p className="text-sm font-semibold text-slate-400">{label}</p>
    <p className={`text-3xl font-extrabold mt-1 ${tone === "accent" ? "text-accent" : "text-brand"}`}>{value}</p>
  </div>
);

/* --------------------- Inline two-step delete ------------------------ */
const DangerButton = ({ onConfirm, label = "Remove", busy }) => {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <button
        onClick={() => setArmed(true)}
        className="text-sm font-bold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50"
      >
        {label}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-1">
      <button
        onClick={onConfirm}
        disabled={busy}
        className="text-sm font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg disabled:opacity-60"
      >
        {busy ? "…" : "Confirm"}
      </button>
      <button onClick={() => setArmed(false)} className="text-sm font-semibold text-slate-500 px-2 py-1.5">
        Cancel
      </button>
    </span>
  );
};

/* --------------------------- Users tab ------------------------------- */
const UsersTab = ({ notify }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users${q ? `?search=${encodeURIComponent(q)}` : ""}`);
      setUsers(res.data.users || []);
    } catch {
      notify("Failed to load users.", true);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const changeRole = async (id, role) => {
    setBusyId(id);
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setUsers((u) => u.map((x) => (x.user_id === id ? { ...x, role } : x)));
      notify("Role updated.");
    } catch (e) {
      notify(e?.response?.data?.error || "Could not update role.", true);
    } finally {
      setBusyId("");
    }
  };

  const remove = async (id) => {
    setBusyId(id);
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((u) => u.filter((x) => x.user_id !== id));
      notify("User removed.");
    } catch (e) {
      notify(e?.response?.data?.error || "Could not remove user.", true);
    } finally {
      setBusyId("");
    }
  };

  return (
    <div>
      <form
        onSubmit={(e) => { e.preventDefault(); load(search); }}
        className="flex gap-2 mb-5 max-w-md"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent text-brand"
        />
        <button className="px-5 bg-brand text-white font-bold rounded-xl hover:bg-slate-800">Search</button>
      </form>

      {loading ? (
        <p className="text-slate-400">Loading users…</p>
      ) : users.length === 0 ? (
        <p className="text-slate-400">No users found.</p>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold hidden sm:table-cell">Courses</th>
                <th className="p-4 font-bold hidden sm:table-cell">Enrollments</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id} className="border-t border-slate-100">
                  <td className="p-4">
                    <p className="font-bold text-brand">{u.full_name}</p>
                    <p className="text-slate-400">{u.email}</p>
                  </td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      disabled={busyId === u.user_id}
                      onChange={(e) => changeRole(u.user_id, e.target.value)}
                      className="border border-slate-200 rounded-lg px-2 py-1.5 font-semibold text-brand bg-white capitalize"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-slate-600">{u.courses_count}</td>
                  <td className="p-4 hidden sm:table-cell text-slate-600">{u.enrollments_count}</td>
                  <td className="p-4 text-right">
                    <DangerButton onConfirm={() => remove(u.user_id)} busy={busyId === u.user_id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* -------------------------- Course edit modal ------------------------ */
const CourseEditModal = ({ course, onClose, onSaved, notify }) => {
  const [form, setForm] = useState({
    title: course.title || "",
    category: course.category || "",
    price_etb: course.price_etb ?? 0,
    scope: course.scope || "",
    status: course.status || "pending_approval",
    description: course.description || "",
  });
  const [saving, setSaving] = useState(false);
  const field = "w-full p-3 bg-canvas border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent text-brand";

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/courses/${course.course_id}`, form);
      onSaved({ ...course, ...form });
      notify("Course updated.");
      onClose();
    } catch (e) {
      notify(e?.response?.data?.error || "Could not save course.", true);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h3 className="text-xl font-extrabold text-brand mb-5">Edit course</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-brand mb-1.5">Title</label>
            <input className={field} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-brand mb-1.5">Category</label>
              <input className={field} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand mb-1.5">Price (ETB)</label>
              <input type="number" min="0" className={field} value={form.price_etb} onChange={(e) => setForm({ ...form, price_etb: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-brand mb-1.5">Scope / Level</label>
            <input className={field} value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-bold text-brand mb-1.5">Status</label>
            <select className={field} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-brand mb-1.5">Description</label>
            <textarea rows={4} className={field} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-5 py-2.5 font-bold text-slate-500 hover:text-brand">Cancel</button>
          <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-accent text-white font-bold rounded-xl glow-accent hover:bg-accent-strong disabled:opacity-60">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------- Courses tab ------------------------------ */
const CoursesTab = ({ notify }) => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [editing, setEditing] = useState(null);

  const load = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/courses${q ? `?search=${encodeURIComponent(q)}` : ""}`);
      setCourses(res.data.courses || []);
    } catch {
      notify("Failed to load courses.", true);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    setBusyId(id);
    try {
      await api.put(`/admin/courses/${id}`, { status });
      setCourses((c) => c.map((x) => (x.course_id === id ? { ...x, status } : x)));
      notify(`Course ${status === "approved" ? "approved" : "updated"}.`);
    } catch (e) {
      notify(e?.response?.data?.error || "Could not update course.", true);
    } finally {
      setBusyId("");
    }
  };

  const remove = async (id) => {
    setBusyId(id);
    try {
      await api.delete(`/admin/courses/${id}`);
      setCourses((c) => c.filter((x) => x.course_id !== id));
      notify("Course removed.");
    } catch (e) {
      notify(e?.response?.data?.error || "Could not remove course.", true);
    } finally {
      setBusyId("");
    }
  };

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); load(search); }} className="flex gap-2 mb-5 max-w-md">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or category…"
          className="flex-1 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent text-brand"
        />
        <button className="px-5 bg-brand text-white font-bold rounded-xl hover:bg-slate-800">Search</button>
      </form>

      {loading ? (
        <p className="text-slate-400">Loading courses…</p>
      ) : courses.length === 0 ? (
        <p className="text-slate-400">No courses found.</p>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => (
            <div key={c.course_id} className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-brand truncate">{c.title}</h3>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusStyle[c.status] || "bg-slate-100 text-slate-500"}`}>
                    {c.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">
                  {c.category || "General"} · {c.instructor_name || "Unknown instructor"} ·{" "}
                  {Number(c.price_etb) > 0 ? `${c.price_etb} ETB` : "Free"} · {c.enrollments_count} enrolled
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {c.status !== "approved" && (
                  <button
                    onClick={() => setStatus(c.course_id, "approved")}
                    disabled={busyId === c.course_id}
                    className="text-sm font-bold text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg"
                  >
                    Approve
                  </button>
                )}
                {c.status !== "archived" && (
                  <button
                    onClick={() => setStatus(c.course_id, "archived")}
                    disabled={busyId === c.course_id}
                    className="text-sm font-bold text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-lg"
                  >
                    Archive
                  </button>
                )}
                <button
                  onClick={() => setEditing(c)}
                  className="text-sm font-bold text-accent hover:bg-accent-soft px-3 py-1.5 rounded-lg"
                >
                  Edit
                </button>
                <DangerButton onConfirm={() => remove(c.course_id)} busy={busyId === c.course_id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <CourseEditModal
          course={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => setCourses((c) => c.map((x) => (x.course_id === updated.course_id ? updated : x)))}
          notify={notify}
        />
      )}
    </div>
  );
};

/* --------------------------- Dashboard ------------------------------- */
const AdminDashboard = ({ onLogout }) => {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users" },
    { key: "courses", label: "Courses" },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      <header className="bg-brand text-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-extrabold">A</span>
            <span className="font-extrabold tracking-tight">SkillAddis Admin</span>
          </div>
          <button onClick={onLogout} className="text-sm font-bold text-slate-300 hover:text-white">Log out</button>
        </div>
        <div className="max-w-6xl mx-auto px-6 flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                tab === t.key ? "border-accent text-white" : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {tab === "overview" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-extrabold text-brand mb-3">Users</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Stat label="Total users" value={stats?.users.total ?? "…"} tone="accent" />
                <Stat label="Students" value={stats?.users.students ?? "…"} />
                <Stat label="Instructors" value={stats?.users.instructors ?? "…"} />
                <Stat label="Admins" value={stats?.users.admins ?? "…"} />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-brand mb-3">Courses</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Stat label="Total courses" value={stats?.courses.total ?? "…"} tone="accent" />
                <Stat label="Approved" value={stats?.courses.approved ?? "…"} />
                <Stat label="Pending" value={stats?.courses.pending ?? "…"} />
                <Stat label="Enrollments" value={stats?.enrollments ?? "…"} />
              </div>
            </div>
          </div>
        )}
        {tab === "users" && <UsersTab notify={notify} />}
        {tab === "courses" && <CoursesTab notify={notify} />}
      </main>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl font-bold shadow-lg ${
            toast.isError ? "bg-red-600 text-white" : "bg-brand text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

/* ------------------------------ Root --------------------------------- */
const AdminConsole = () => {
  const [authed, setAuthed] = useState(() => roleFromToken(localStorage.getItem("token")) === "admin");

  const logout = () => {
    localStorage.removeItem("token");
    setAuthed(false);
  };

  return authed ? <AdminDashboard onLogout={logout} /> : <AdminLogin onAuthed={() => setAuthed(true)} />;
};

export default AdminConsole;
