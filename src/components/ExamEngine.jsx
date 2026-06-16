import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const ExamEngine = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [examState, setExamState] = useState("loading"); // loading, taking, grading, results
  const [examId, setExamId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  
  // Results Data
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [certificateId, setCertificateId] = useState(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/courses/${courseId}/exam`);
        if (res.data.questions && res.data.questions.length > 0) {
            setQuestions(res.data.questions);
            setExamId(res.data.exam_id); // Save the ID for submission
            setExamState("taking");
        } else {
            setExamState("no_exam");
        }
      } catch (err) {
        console.error("Failed to load exam", err);
        setExamState("error");
      }
    };
    fetchExam();
  }, [courseId]);

  const handleSelectOption = (questionId, selectedOption) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
  };

  // NEW: Secure Server-Side Grading
  const submitExamToServer = async () => {
    setExamState("grading");
    
    console.log("REACT: Sending answers:", userAnswers);
    console.log("REACT: Using Exam ID:", examId);

    try {
        const res = await api.post(`/courses/exams/${examId}/submit`, {
            answers: userAnswers
        });
        
        setScore(res.data.score);
        setPassed(res.data.passed);
        setCertificateId(res.data.certificate_id);
        setExamState("results");
        
    } catch (err) {
        console.error("Failed to submit exam:", err);
        alert("Server error grading exam. Please try again.");
        setExamState("taking");
    }
  };

  if (examState === "loading") return <div className="p-20 text-center font-bold">Loading Exam...</div>;
  if (examState === "grading") return <div className="p-20 text-center font-bold text-accent">Grading your answers...</div>;
  if (examState === "no_exam") return <div className="p-20 text-center">No exam available.</div>;
  if (examState === "error") return <div className="p-20 text-center text-red-500">Failed to load exam.</div>;

  if (examState === "results") {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface p-8 rounded-2xl shadow-lg border border-line text-center">
            <h2 className="text-3xl font-black text-ink mb-2">Exam Complete!</h2>
            
            <div className={`text-6xl font-black my-6 ${passed ? 'text-green-500' : 'text-red-500'}`}>
                {score}%
            </div>
            
            {passed ? (
                <div>
                    <p className="text-green-600 font-bold mb-6">Congratulations! You passed the course.</p>
                    <button 
                        onClick={() => navigate(`/certificate/${certificateId}`)}
                        className="w-full bg-accent text-white py-3 rounded-lg font-bold glow-accent hover:bg-accent-strong transition"
                    >
                        View Certificate
                    </button>
                </div>
            ) : (
                <div>
                    <p className="text-red-600 font-bold mb-6">You did not meet the minimum passing score.</p>
                    <button 
                        onClick={() => {
                            setExamState("taking");
                            setCurrentIdx(0);
                            setUserAnswers({});
                        }}
                        className="w-full bg-brand text-white py-3 rounded-lg font-bold hover:bg-brand-2 transition"
                    >
                        Retake Exam
                    </button>
                </div>
            )}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;

  return (
    <div className="min-h-screen bg-canvas py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-ink">Final Assessment</h1>
            <span className="bg-surface-2 text-ink px-4 py-1 rounded-full text-sm font-bold">
                Question {currentIdx + 1} of {questions.length}
            </span>
        </div>

        {/* Progress */}
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden mb-8">
            <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
        </div>

        <div key={currentIdx} className="bg-surface p-6 sm:p-8 rounded-2xl shadow-sm border border-line mb-8 animate-fade-in">
            <h2 className="text-xl font-semibold text-ink mb-6">
                {currentQuestion.question_text}
            </h2>

            <div className="flex flex-col gap-4">
                {['option_a', 'option_b', 'option_c', 'option_d'].map((optKey) => (
                    currentQuestion[optKey] && (
                        <label 
                            key={optKey} 
                            className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${
                                userAnswers[currentQuestion.question_id] === optKey 
                                ? 'border-accent bg-accent-soft' 
                                : 'border-line hover:bg-surface-2'
                            }`}
                        >
                            <input 
                                type="radio" 
                                name={`question-${currentQuestion.question_id}`}
                                value={optKey}
                                checked={userAnswers[currentQuestion.question_id] === optKey}
                                onChange={() => handleSelectOption(currentQuestion.question_id, optKey)}
                                className="w-5 h-5 text-accent focus:ring-accent"
                            />
                            <span className="ml-3 text-ink font-medium">
                                {currentQuestion[optKey]}
                            </span>
                        </label>
                    )
                ))}
            </div>
        </div>

        <div className="flex justify-between">
            <button 
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => prev - 1)}
                className="px-6 py-3 font-bold text-ink-muted hover:text-ink disabled:opacity-50"
            >
                &larr; Previous
            </button>
            
            {isLastQuestion ? (
                <button 
                    onClick={submitExamToServer}
                    disabled={Object.keys(userAnswers).length !== questions.length}
                    className="bg-brand text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-2 disabled:opacity-50"
                >
                    Submit Exam
                </button>
            ) : (
                <button 
                    onClick={() => setCurrentIdx(prev => prev + 1)}
                    disabled={!userAnswers[currentQuestion.question_id]}
                    className="bg-accent text-white px-8 py-3 rounded-lg font-bold glow-accent hover:bg-accent-strong disabled:opacity-50"
                >
                    Next &rarr;
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ExamEngine;