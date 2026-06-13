import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CreateCourse = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [courseId, setCourseId] = useState(null);
  const [examId, setExamId] = useState(null);
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    message: null,
  });

  // --- STEP 1: Course Metadata ---
  const [courseData, setCourseData] = useState({
    title: "",
    scope: "",
    description: "",
    notes: "",
    category: "programming",
    price_etb: 0,
    video_url: "",
    thumbnail_url: "",
  });

  // --- STEP 2: Curriculum Structure ---
  const [syllabus, setSyllabus] = useState([
    { title: "", materials: [{ type: "video", title: "", content: "" }] },
  ]);

  // --- STEP 3: Exam Builder ---
  const initialQuestionState = {
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "option_a",
  };
  const [questionData, setQuestionData] = useState(initialQuestionState);
  const [addedQuestions, setAddedQuestions] = useState(0);

  // ==========================================
  // HANDLERS: STEP 1 (METADATA)
  // ==========================================
  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...courseData, [name]: value };

    if (name === "video_url" && value) {
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = value.match(regExp);
      if (match && match[2].length === 11) {
        updatedData.thumbnail_url = `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
      }
    }
    setCourseData(updatedData);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setStatus({
      loading: true,
      error: null,
      message: "Initializing course...",
    });
    try {
      const res = await api.post("/courses/create", courseData);
      setCourseId(res.data.course_id);
      setExamId(res.data.exam_id);
      setStatus({ loading: false, error: null, message: null });
      setStep(2);
    } catch (error) {
      setStatus({
        loading: false,
        message: null,
        error:
          error.response?.data?.error || "Failed to create course metadata.",
      });
    }
  };

  // ==========================================
  // HANDLERS: STEP 2 (CURRICULUM)
  // ==========================================
  const addSection = () => {
    setSyllabus([
      ...syllabus,
      { title: "", materials: [{ type: "video", title: "", content: "" }] },
    ]);
  };

  const addMaterial = (sectionIndex) => {
    const newSyllabus = [...syllabus];
    newSyllabus[sectionIndex].materials.push({
      type: "video",
      title: "",
      content: "",
    });
    setSyllabus(newSyllabus);
  };

  const updateSectionTitle = (index, value) => {
    const newSyllabus = [...syllabus];
    newSyllabus[index].title = value;
    setSyllabus(newSyllabus);
  };

  const updateMaterial = (sIdx, mIdx, field, value) => {
    const newSyllabus = [...syllabus];
    newSyllabus[sIdx].materials[mIdx][field] = value;
    setSyllabus(newSyllabus);
  };

  const handleSyllabusSubmit = async () => {
    setStatus({
      loading: true,
      error: null,
      message: "Saving curriculum structure...",
    });
    try {
      await api.put(`/courses/${courseId}/syllabus`, { syllabus });
      setStatus({ loading: false, error: null, message: null });
      setStep(3);
    } catch {
      setStatus({
        loading: false,
        message: null,
        error: "Failed to save curriculum.",
      });
    }
  };

  // ==========================================
  // HANDLERS: STEP 3 (EXAM)
  // ==========================================
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, message: null });
    try {
      await api.post(`/courses/exams/${examId}/questions`, questionData);
      setAddedQuestions((prev) => prev + 1);

      // Explicit hard-reset of the form state
      setQuestionData({ ...initialQuestionState });

      setStatus({ loading: false, error: null, message: null });
    } catch (error) {
      setStatus({
        loading: false,
        message: null,
        error: error.response?.data?.error || "Error adding question.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 mb-20 p-10 bg-white rounded-2xl shadow-xl border border-slate-100">
      {/* Global Status Bar */}
      {status.error && (
        <p className="mb-6 p-4 bg-red-50 text-red-600 font-bold rounded-lg text-center">
          {status.error}
        </p>
      )}
      {status.message && (
        <p className="mb-6 p-4 bg-blue-50 text-blue-600 font-bold rounded-lg text-center">
          {status.message}
        </p>
      )}

      {/* Progress Indicators */}
      <div className="flex gap-2 mb-10 border-b pb-6">
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            className={`flex-1 h-2 rounded ${step >= num ? "bg-accent" : "bg-slate-100"}`}
          />
        ))}
      </div>

      {/* --- STEP 1: METADATA --- */}
      {step === 1 && (
        <div className="animate-fade-in">
          <h2 className="text-3xl font-extrabold text-brand mb-2">
            1. Course Metadata
          </h2>
          <p className="text-slate-500 mb-8">
            Establish the core identity and pricing of your course.
          </p>

          <form onSubmit={handleCourseSubmit} className="flex flex-col gap-6">
            <div className="flex gap-4">
              <div className="w-2/3">
                <label className="block text-sm font-bold text-brand mb-2">
                  Course Title
                </label>
                <input
                  className="w-full p-4 bg-canvas border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                  type="text"
                  name="title"
                  value={courseData.title}
                  onChange={handleCourseChange}
                  required
                />
              </div>
              <div className="w-1/3">
                <label className="block text-sm font-bold text-brand mb-2">
                  Scope / Level
                </label>
                <input
                  className="w-full p-4 bg-canvas border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                  type="text"
                  name="scope"
                  value={courseData.scope}
                  placeholder="e.g., Beginner"
                  onChange={handleCourseChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-brand mb-2">
                Primary Video URL (YouTube)
              </label>
              <input
                className="w-full p-4 bg-canvas border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                type="url"
                name="video_url"
                value={courseData.video_url}
                placeholder="https://youtube.com/watch?v=..."
                onChange={handleCourseChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-brand mb-2">
                Public Description
              </label>
              <textarea
                className="w-full p-4 bg-canvas border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                name="description"
                value={courseData.description}
                rows="3"
                onChange={handleCourseChange}
                required
              />
            </div>

            <button
              type="submit"
              disabled={status.loading}
              className="w-full mt-4 p-4 bg-brand text-white text-lg font-bold rounded-lg hover:bg-slate-800 transition shadow-md disabled:opacity-50"
            >
              Create Course & Proceed &rarr;
            </button>
          </form>
        </div>
      )}

      {/* --- STEP 2: CURRICULUM BUILDER --- */}
      {step === 2 && (
        <div className="animate-fade-in">
          <h2 className="text-3xl font-extrabold text-brand mb-2">
            2. Build Curriculum
          </h2>
          <p className="text-slate-500 mb-8">
            Structure your course into sections and attach videos or study
            notes.
          </p>

          <div className="space-y-6">
            {syllabus.map((section, sIdx) => (
              <div
                key={sIdx}
                className="bg-canvas p-6 rounded-xl border border-gray-200"
              >
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Section {sIdx + 1} Title
                  </label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                    required
                    placeholder="e.g., Introduction to Basics"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none font-bold"
                  />
                </div>

                <div className="pl-6 border-l-2 border-slate-200 space-y-4">
                  {section.materials.map((mat, mIdx) => (
                    <div
                      key={mIdx}
                      className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex gap-4"
                    >
                      <div className="w-1/4">
                        <label className="block text-xs font-bold text-slate-500 mb-1">
                          Type
                        </label>
                        <select
                          value={mat.type}
                          onChange={(e) =>
                            updateMaterial(sIdx, mIdx, "type", e.target.value)
                          }
                          className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-accent outline-none text-sm"
                        >
                          <option value="video">Video</option>
                          <option value="note">Study Note</option>
                        </select>
                      </div>
                      <div className="w-1/3">
                        <label className="block text-xs font-bold text-slate-500 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={mat.title}
                          onChange={(e) =>
                            updateMaterial(sIdx, mIdx, "title", e.target.value)
                          }
                          placeholder="Lesson name..."
                          className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-accent outline-none text-sm"
                        />
                      </div>
                      <div className="w-full flex-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">
                          Content (URL or Text)
                        </label>
                        {mat.type === "video" ? (
                          <input
                            type="url"
                            value={mat.content}
                            onChange={(e) =>
                              updateMaterial(
                                sIdx,
                                mIdx,
                                "content",
                                e.target.value,
                              )
                            }
                            placeholder="https://youtube.com/..."
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-accent outline-none text-sm"
                          />
                        ) : (
                          <textarea
                            value={mat.content}
                            onChange={(e) =>
                              updateMaterial(
                                sIdx,
                                mIdx,
                                "content",
                                e.target.value,
                              )
                            }
                            placeholder="Enter study notes here..."
                            rows="1"
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-accent outline-none text-sm"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => addMaterial(sIdx)}
                    className="text-sm font-bold text-accent hover:text-accent-strong"
                  >
                    + Add Lesson to Section
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between items-center border-t border-slate-200 pt-6">
            <button
              onClick={addSection}
              className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition"
            >
              + Add New Section
            </button>
            <button
              onClick={handleSyllabusSubmit}
              disabled={status.loading}
              className="px-8 py-3 bg-brand text-white font-bold rounded-lg hover:bg-slate-800 transition shadow-md"
            >
              Save Curriculum & Proceed &rarr;
            </button>
          </div>
        </div>
      )}

      {/* --- STEP 3: EXAM BUILDER --- */}
      {step === 3 && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-extrabold text-brand">
              3. Certification Exam
            </h2>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-black text-xl">
              {addedQuestions} Added
            </span>
          </div>

          <form
            onSubmit={handleAddQuestion}
            className="flex flex-col gap-6 bg-canvas p-6 rounded-xl border border-gray-200"
          >
            <div>
              <label className="block text-sm font-bold text-brand mb-2">
                Question Text
              </label>
              <textarea
                required
                name="question_text"
                value={questionData.question_text}
                onChange={(e) =>
                  setQuestionData({
                    ...questionData,
                    question_text: e.target.value,
                  })
                }
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none bg-white"
                rows="2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {["a", "b", "c", "d"].map((letter) => (
                <div key={letter}>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Option {letter}
                  </label>
                  <input
                    type="text"
                    name={`option_${letter}`}
                    required={letter === "a" || letter === "b"}
                    value={questionData[`option_${letter}`]}
                    onChange={(e) =>
                      setQuestionData({
                        ...questionData,
                        [`option_${letter}`]: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none bg-white"
                  />
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between mt-2">
              <label className="text-sm font-bold text-brand">
                Correct Answer:
              </label>
              <select
                name="correct_option"
                value={questionData.correct_option}
                onChange={(e) =>
                  setQuestionData({
                    ...questionData,
                    correct_option: e.target.value,
                  })
                }
                className="p-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-accent outline-none w-48"
              >
                <option value="option_a">Option A</option>
                <option value="option_b">Option B</option>
                <option value="option_c">Option C</option>
                <option value="option_d">Option D</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={status.loading}
              className="w-full bg-accent text-white py-4 rounded-lg font-bold hover:bg-accent-strong disabled:opacity-50 transition shadow-md"
            >
              {status.loading ? "Saving..." : "+ Add Question to Exam"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <button
              onClick={() =>
                navigate("/dashboard", {
                  state: {
                    successMessage:
                      "Course successfully published to the platform!",
                  },
                })
              }
              className="w-full bg-brand text-white p-4 text-lg font-bold rounded-lg hover:bg-slate-800 transition shadow-md"
            >
              Finish & Publish Entire Course
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCourse;
