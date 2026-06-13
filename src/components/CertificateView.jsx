import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const CertificateView = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get(`/courses/certificate/${certificateId}`)
      .then((res) => setData(res.data))
      .catch(() => setError(true));
  }, [certificateId]);

  if (error) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center text-white gap-4 p-6">
        <p className="text-slate-300">We couldn't load this certificate.</p>
        <button onClick={() => navigate("/dashboard")} className="bg-accent px-6 py-3 rounded-xl font-bold">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center text-white gap-4">
        <div className="w-12 h-12 border-4 border-white/20 border-t-accent rounded-full animate-spin" />
        <p className="text-slate-400">Generating your certificate…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Action bar (hidden when printing) */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-6 print:hidden">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-slate-300 hover:text-white font-semibold flex items-center gap-1.5 transition-colors"
        >
          &larr; Back to Dashboard
        </button>
        <button
          onClick={() => window.print()}
          className="bg-accent text-white px-5 py-2.5 rounded-xl font-bold hover:bg-accent-strong transition-colors shadow-md flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print / Save PDF
        </button>
      </div>

      {/* Certificate */}
      <div className="relative max-w-3xl w-full bg-white shadow-2xl animate-scale-in">
        <div className="absolute inset-0 border-[10px] border-accent m-3 pointer-events-none" />
        <div className="relative p-8 sm:p-14 text-center">
          <div className="flex justify-center mb-6">
            <svg className="w-14 h-14 text-accent" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z" />
            </svg>
          </div>

          <p className="text-sm font-bold text-accent uppercase tracking-[0.3em] mb-3">SkillAddis</p>
          <h1 className="text-3xl sm:text-5xl font-black text-brand uppercase mb-4 tracking-tight">
            Certificate of Completion
          </h1>
          <p className="text-lg text-slate-500 mb-6">This is proudly presented to</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-brand inline-block border-b-2 border-slate-200 pb-2 mb-6 px-6">
            {data.student_name}
          </h2>
          <p className="text-lg text-slate-600 mb-2">for successfully completing</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-accent mb-12">{data.course_title}</h3>

          <div className="flex justify-between items-end text-slate-400 font-mono text-xs sm:text-sm border-t border-slate-100 pt-6">
            <span>ID: {data.certificate_id}</span>
            <span>Issued: {new Date(data.issued_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
