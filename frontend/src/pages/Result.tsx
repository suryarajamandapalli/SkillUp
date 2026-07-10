import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileDown, Award, AlertCircle, HelpCircle, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

const MOCK_QUESTIONS: Record<string, { q: string; a: string }[]> = {
  "Software Engineer": [
    { q: "What is the difference between an Abstract Class and an Interface?", a: "An abstract class allows you to create functional methods with default behavior, supporting single inheritance. An interface is a contract that only defines method signatures and supports multiple inheritance." },
    { q: "How does a hash map resolve collisions?", a: "Hash maps resolve collisions using techniques like Chaining (linked lists or balanced trees at the index bin) or Open Addressing (probing empty slots using linear, quadratic, or double hashing)." }
  ],
  "Data Scientist": [
    { q: "Explain the difference between L1 and L2 regularization.", a: "L1 (Lasso) adds absolute value of coefficients as penalty term to loss, driving coefficients to zero (useful for feature selection). L2 (Ridge) adds squared value of coefficients, reducing their sizes but keeping them non-zero." },
    { q: "What is the curse of dimensionality?", a: "As the number of features increases, the volume of feature space grows exponentially, causing training data points to appear sparse and making similarity metrics (like Euclidean distance) lose discriminative power." }
  ],
  "DevOps Engineer": [
    { q: "How does Kubernetes handle self-healing?", a: "K8s monitors containers and automatically restarts crashed ones, replaces containers when nodes die, and doesn't advertise them to clients until they pass readiness probes." }
  ]
};

export const Result: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  const rawPrediction = sessionStorage.getItem('activePrediction');

  if (!rawPrediction) {
    return (
      <div className="max-w-md mx-auto py-16 px-6 text-center">
        <h2 className="text-xl font-bold text-[#0F172A]">No Active Prediction Found</h2>
        <Link to="/assessment" className="text-sm text-[#2563EB] underline mt-2 block">Take assessment first</Link>
      </div>
    );
  }

  const result = JSON.parse(rawPrediction);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await api.downloadReportPDF(result._id);
    } catch (err) {
      alert("Failed to download PDF report. Check backend server.");
    } finally {
      setDownloading(false);
    }
  };

  const matchedQuestions = MOCK_QUESTIONS[result.predictedCareer] || [
    { q: "Can you detail a complex technical challenge you solved?", a: "Explain using the STAR method: situation, task, action, and outcome. Emphasize metrics, quantitative impact, and scaling factors." }
  ];

  // Readiness Score circle parameters
  const score = result.careerReadinessScore || 75.0;

  // Format AI report markdown sections into HTML containers
  const renderAiReport = (reportText: string) => {
    if (!reportText) return <p className="text-sm text-[#475569]">No AI feedback compiled.</p>;
    
    // Split by headings
    const sections = reportText.split(/###\s+/);
    return (
      <div className="space-y-6">
        {sections.map((section, idx) => {
          if (!section.trim()) return null;
          const lines = section.split('\n');
          const title = lines[0].trim();
          const contentLines = lines.slice(1);

          return (
            <div key={idx} className="space-y-2 border-l-2 border-blue-500 pl-4 py-1">
              <h4 className="text-base font-bold text-[#0F172A]">{title}</h4>
              <div className="text-sm text-[#475569] leading-relaxed space-y-1.5">
                {contentLines.map((line, lIdx) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;
                  if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
                    return (
                      <div key={lIdx} className="flex items-start gap-2 pl-2">
                        <span className="text-[#2563EB] mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
                        <span>{trimmed.replace(/^[-*•]\s+/, '')}</span>
                      </div>
                    );
                  }
                  return <p key={lIdx}>{trimmed}</p>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-10">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">AI Placement Success Diagnosis</h1>
          <p className="text-base text-[#64748B] mt-1.5">Personalized success prediction metrics and Groq AI coaching logs</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-5 py-3 bg-[#2563EB] text-white text-sm font-bold rounded-md hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <FileDown className="w-4 h-4" /> {downloading ? "Compiling PDF..." : "Download Success Report"}
        </button>
      </div>

      {/* Grid: Gauge and Diagnosis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Score Gauge */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Career Readiness Score</h3>
          
          <div className="relative flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-36 h-36 transform -rotate-90">
              <circle cx="72" cy="72" r="60" stroke="#F1F5F9" strokeWidth="12" fill="transparent" />
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="#2563EB"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray="377"
                strokeDashoffset={377 - (377 * score) / 100}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-[#0F172A]">{score.toFixed(1)}</span>
              <span className="text-xs text-[#64748B] font-bold">out of 100</span>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-bold text-[#0F172A] capitalize">{result.predictedCareer}</h4>
            <p className="text-xs text-[#64748B] font-semibold">Model Match Confidence: {Math.round(result.confidence * 100)}%</p>
          </div>
        </div>

        {/* Diagnostic info strengths / weaknesses */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm md:col-span-2 space-y-6">
          <h3 className="text-base font-bold text-[#0F172A] border-b border-[#E5E7EB] pb-3 flex items-center gap-1.5">
            <Award className="w-5 h-5 text-[#2563EB]" /> AI Profile Diagnostics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider block">Top Strengths</span>
              <div className="space-y-2">
                {result.strengths && result.strengths.map((str: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-[#475569]">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span className="font-semibold text-[#0F172A]">{str}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-red-500 uppercase tracking-wider block">Areas of Focus</span>
              <div className="space-y-2">
                {result.weaknesses && result.weaknesses.map((w: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-[#475569]">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="font-semibold text-[#0F172A]">{w}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Importance Chart */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
        <h3 className="text-base font-bold text-[#0F172A] mb-6 border-b border-[#E5E7EB] pb-3">
          Predictive Feature Contributions (ML Importance)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={result.featureImportance || []}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} />
              <YAxis dataKey="feature" type="category" tick={{ fill: '#0F172A', fontSize: 10, fontWeight: 600 }} width={120} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '11px' }}
              />
              <Bar dataKey="importance" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Mentor Coaching Logs */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-[#0F172A] border-b border-[#E5E7EB] pb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" /> Groq AI Coaching Report
        </h3>
        {renderAiReport(result.aiReport)}
      </div>

      {/* Mock Interview prep section */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-[#0F172A] border-b border-[#E5E7EB] pb-3 flex items-center gap-1.5">
          <HelpCircle className="w-5 h-5 text-[#2563EB]" /> Target Mock Interview Simulator
        </h3>

        <div className="space-y-4">
          {matchedQuestions.map((qObj, index) => (
            <div key={index} className="border border-[#E5E7EB] rounded-md overflow-hidden">
              <button
                onClick={() => setActiveQuestion(activeQuestion === index ? null : index)}
                className="w-full flex justify-between items-center p-4 text-left bg-[#F8FAFC] hover:bg-slate-100 transition-colors text-sm font-bold text-[#0F172A] cursor-pointer"
              >
                <span>Q{index + 1}: {qObj.q}</span>
                <ChevronRight className={`w-4 h-4 text-[#64748B] transform transition-transform ${activeQuestion === index ? 'rotate-90' : ''}`} />
              </button>
              
              {activeQuestion === index && (
                <div className="p-4 border-t border-[#E5E7EB] bg-white text-sm text-[#475569] leading-relaxed">
                  <p className="font-bold text-[#2563EB] mb-1">AI Guided Answer Checklist:</p>
                  {qObj.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
