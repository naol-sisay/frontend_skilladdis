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
  archived: "bg-surface-2 text-ink-muted",
};

const getYoutubeThumbnail = (url) => {
  if (!url || typeof url !== "string") return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
    : "";
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
    "w-full p-3.5 bg-canvas border border-line rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition text-ink font-medium placeholder:text-ink-faint";

  return (
    <div className="min-h-screen bg-brand flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-3xl shadow-2xl p-8 glow-accent-lg">
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-accent-soft text-accent flex items-center justify-center mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-ink">Admin Console</h1>
            <p className="text-ink-muted mt-1 text-sm">Restricted access. Authorized staff only.</p>
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
  <div className="bg-surface border border-line rounded-2xl p-5">
    <p className="text-sm font-semibold text-ink-faint">{label}</p>
    <p className={`text-3xl font-extrabold mt-1 ${tone === "accent" ? "text-accent" : "text-ink"}`}>{value}</p>
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
      <button onClick={() => setArmed(false)} className="text-sm font-semibold text-ink-muted px-2 py-1.5">
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
          className="flex-1 p-3 bg-surface border border-line rounded-xl outline-none focus:ring-2 focus:ring-accent text-ink"
        />
        <button className="px-5 bg-brand text-white font-bold rounded-xl hover:bg-brand-2">Search</button>
      </form>

      {loading ? (
        <p className="text-ink-faint">Loading users…</p>
      ) : users.length === 0 ? (
        <p className="text-ink-faint">No users found.</p>
      ) : (
        <div className="bg-surface border border-line rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2 text-ink-muted">
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
                <tr key={u.user_id} className="border-t border-line">
                  <td className="p-4">
                    <p className="font-bold text-ink">{u.full_name}</p>
                    <p className="text-ink-faint">{u.email}</p>
                  </td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      disabled={busyId === u.user_id}
                      onChange={(e) => changeRole(u.user_id, e.target.value)}
                      className="border border-line rounded-lg px-2 py-1.5 font-semibold text-ink bg-surface capitalize"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-ink-muted">{u.courses_count}</td>
                  <td className="p-4 hidden sm:table-cell text-ink-muted">{u.enrollments_count}</td>
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
    video_url: course.video_url || "",
    thumbnail_url: course.thumbnail_url || "",
  });
  const [saving, setSaving] = useState(false);
  const field = "w-full p-3 bg-canvas border border-line rounded-xl outline-none focus:ring-2 focus:ring-accent text-ink";

  const setField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "video_url") {
        const suggestedThumb = getYoutubeThumbnail(value);
        if (suggestedThumb && (!prev.thumbnail_url || prev.thumbnail_url === getYoutubeThumbnail(prev.video_url))) {
          next.thumbnail_url = suggestedThumb;
        }
      }
      return next;
    });
  };

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
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h3 className="text-xl font-extrabold text-ink mb-5">Edit course</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-ink mb-1.5">Title</label>
            <input className={field} value={form.title} onChange={(e) => setField("title", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-ink mb-1.5">Category</label>
              <input className={field} value={form.category} onChange={(e) => setField("category", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-1.5">Price (ETB)</label>
              <input type="number" min="0" className={field} value={form.price_etb} onChange={(e) => setField("price_etb", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-1.5">Scope / Level</label>
            <input className={field} value={form.scope} onChange={(e) => setField("scope", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-1.5">Status</label>
            <select className={field} value={form.status} onChange={(e) => setField("status", e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-1.5">Primary YouTube Video</label>
            <input
              type="url"
              className={field}
              value={form.video_url}
              placeholder="https://youtube.com/watch?v=..."
              onChange={(e) => setField("video_url", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-1.5">Cover Image URL</label>
            <input
              type="url"
              className={field}
              value={form.thumbnail_url}
              placeholder="https://example.com/cover.jpg"
              onChange={(e) => setField("thumbnail_url", e.target.value)}
            />
            <p className="text-xs text-ink-faint mt-2">
              When you paste a YouTube link above, the cover image will auto-fill from that video. You can still override it.
            </p>
          </div>
          {form.thumbnail_url && (
            <div>
              <label className="block text-sm font-bold text-ink mb-1.5">Cover Preview</label>
              <div className="rounded-2xl overflow-hidden border border-line bg-canvas">
                <img
                  src={form.thumbnail_url}
                  alt={`${form.title || "Course"} cover preview`}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-ink mb-1.5">Description</label>
            <textarea rows={4} className={field} value={form.description} onChange={(e) => setField("description", e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-5 py-2.5 font-bold text-ink-muted hover:text-ink">Cancel</button>
          <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-accent text-white font-bold rounded-xl glow-accent hover:bg-accent-strong disabled:opacity-60">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ----------------------- Curriculum edit modal ----------------------- */
const blankMaterial = () => ({ type: "video", title: "", content: "" });
const blankSection = () => ({ title: "", materials: [blankMaterial()] });

const CurriculumEditModal = ({ course, onClose, notify }) => {
  const [syllabus, setSyllabus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const field = "w-full p-2.5 bg-canvas border border-line rounded-lg outline-none focus:ring-2 focus:ring-accent text-ink text-sm";

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get(`/admin/courses/${course.course_id}/syllabus`);
        if (!active) return;
        // Normalise into the editable shape the save endpoint expects.
        const loaded = (res.data.syllabus || []).map((s) => ({
          title: s.title || "",
          materials: (s.materials || []).map((m) => ({
            type: m.type || "video",
            title: m.title || "",
            content: m.content || "",
          })),
        }));
        setSyllabus(loaded.length ? loaded : [blankSection()]);
      } catch (e) {
        notify(e?.response?.data?.error || "Could not load curriculum.", true);
        setSyllabus([blankSection()]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [course.course_id, notify]);

  const mutate = (fn) => setSyllabus((prev) => { const next = structuredClone(prev); fn(next); return next; });

  const addSection = () => mutate((s) => s.push(blankSection()));
  const removeSection = (i) => mutate((s) => s.splice(i, 1));
  const setSectionTitle = (i, v) => mutate((s) => { s[i].title = v; });
  const addMaterial = (i) => mutate((s) => s[i].materials.push(blankMaterial()));
  const removeMaterial = (i, j) => mutate((s) => s[i].materials.splice(j, 1));
  const setMaterial = (i, j, k, v) => mutate((s) => { s[i].materials[j][k] = v; });

  const save = async () => {
    // Drop empty sections / lessons so admins can prune by clearing fields.
    const cleaned = syllabus
      .map((s) => ({
        title: s.title.trim(),
        materials: s.materials.filter((m) => m.title.trim() || m.content.trim()),
      }))
      .filter((s) => s.title || s.materials.length);

    if (cleaned.length === 0) {
      notify("Add at least one section before saving.", true);
      return;
    }
    setSaving(true);
    try {
      await api.put(`/admin/courses/${course.course_id}/syllabus`, { syllabus: cleaned });
      notify("Curriculum saved.");
      onClose();
    } catch (e) {
      notify(e?.response?.data?.error || e?.response?.data?.detail || "Could not save curriculum.", true);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-xl font-extrabold text-ink">Edit curriculum</h3>
          <button onClick={onClose} className="text-ink-faint hover:text-ink text-2xl leading-none">&times;</button>
        </div>
        <p className="text-sm text-ink-faint mb-5 truncate">{course.title}</p>

        {loading ? (
          <p className="text-ink-faint py-10 text-center">Loading curriculum…</p>
        ) : (
          <div className="space-y-5">
            {syllabus.map((section, sIdx) => (
              <div key={sIdx} className="bg-canvas border border-line rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-ink-faint shrink-0">#{sIdx + 1}</span>
                  <input
                    className={field}
                    value={section.title}
                    placeholder="Section title"
                    onChange={(e) => setSectionTitle(sIdx, e.target.value)}
                  />
                  <button
                    onClick={() => removeSection(sIdx)}
                    className="text-xs font-bold text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg shrink-0"
                  >
                    Remove
                  </button>
                </div>

                <div className="pl-3 border-l-2 border-line space-y-3">
                  {section.materials.map((mat, mIdx) => (
                    <div key={mIdx} className="bg-surface border border-line rounded-lg p-3 flex flex-col sm:flex-row gap-2">
                      <select
                        value={mat.type}
                        onChange={(e) => setMaterial(sIdx, mIdx, "type", e.target.value)}
                        className="p-2 border border-line rounded text-sm sm:w-28 shrink-0"
                      >
                        <option value="video">Video</option>
                        <option value="note">Study Note</option>
                      </select>
                      <input
                        className="p-2 border border-line rounded text-sm sm:w-1/3"
                        value={mat.title}
                        placeholder="Lesson title"
                        onChange={(e) => setMaterial(sIdx, mIdx, "title", e.target.value)}
                      />
                      {mat.type === "video" ? (
                        <input
                          className="p-2 border border-line rounded text-sm flex-1"
                          value={mat.content}
                          placeholder="https://youtube.com/..."
                          onChange={(e) => setMaterial(sIdx, mIdx, "content", e.target.value)}
                        />
                      ) : (
                        <textarea
                          className="p-2 border border-line rounded text-sm flex-1"
                          value={mat.content}
                          rows={2}
                          placeholder="Study notes…"
                          onChange={(e) => setMaterial(sIdx, mIdx, "content", e.target.value)}
                        />
                      )}
                      <button
                        onClick={() => removeMaterial(sIdx, mIdx)}
                        className="text-xs font-bold text-red-600 hover:bg-red-50 px-2 rounded shrink-0"
                        title="Remove lesson"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addMaterial(sIdx)}
                    className="text-sm font-bold text-accent hover:text-accent-strong"
                  >
                    + Add lesson
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addSection}
              className="px-4 py-2.5 bg-surface-2 text-ink font-bold rounded-lg hover:bg-surface-2 text-sm"
            >
              + Add section
            </button>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 sticky bottom-0 bg-surface pt-4">
          <button onClick={onClose} className="px-5 py-2.5 font-bold text-ink-muted hover:text-ink">Cancel</button>
          <button
            onClick={save}
            disabled={saving || loading}
            className="px-6 py-2.5 bg-accent text-white font-bold rounded-xl glow-accent hover:bg-accent-strong disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save curriculum"}
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
  const [editingCurriculum, setEditingCurriculum] = useState(null);

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
          className="flex-1 p-3 bg-surface border border-line rounded-xl outline-none focus:ring-2 focus:ring-accent text-ink"
        />
        <button className="px-5 bg-brand text-white font-bold rounded-xl hover:bg-brand-2">Search</button>
      </form>

      {loading ? (
        <p className="text-ink-faint">Loading courses…</p>
      ) : courses.length === 0 ? (
        <p className="text-ink-faint">No courses found.</p>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => (
            <div key={c.course_id} className="bg-surface border border-line rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-ink truncate">{c.title}</h3>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusStyle[c.status] || "bg-surface-2 text-ink-muted"}`}>
                    {c.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-ink-faint mt-0.5">
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
                    className="text-sm font-bold text-ink-muted hover:bg-surface-2 px-3 py-1.5 rounded-lg"
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
                <button
                  onClick={() => setEditingCurriculum(c)}
                  className="text-sm font-bold text-ink hover:bg-surface-2 px-3 py-1.5 rounded-lg"
                >
                  Curriculum
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

      {editingCurriculum && (
        <CurriculumEditModal
          course={editingCurriculum}
          onClose={() => setEditingCurriculum(null)}
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
          <button onClick={onLogout} className="text-sm font-bold text-ink-faint hover:text-white">Log out</button>
        </div>
        <div className="max-w-6xl mx-auto px-6 flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                tab === t.key ? "border-accent text-white" : "border-transparent text-ink-faint hover:text-white"
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
              <h2 className="text-lg font-extrabold text-ink mb-3">Users</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Stat label="Total users" value={stats?.users.total ?? "…"} tone="accent" />
                <Stat label="Students" value={stats?.users.students ?? "…"} />
                <Stat label="Instructors" value={stats?.users.instructors ?? "…"} />
                <Stat label="Admins" value={stats?.users.admins ?? "…"} />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-ink mb-3">Courses</h2>
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
