import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DashboardSkeleton } from '../components/Skeletons';
import { ClipboardList, FileDown, Eye, Trophy, Calendar, Compass, BarChart } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await api.getUserAssessments();
        setAssessments(history);
      } catch (err) {
        console.error("Error loading history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDownloadPDF = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(id);
    try {
      await api.downloadReportPDF(id);
    } catch (err) {
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRowClick = (id: string) => {
    const matched = assessments.find(a => a._id === id);
    if (matched) {
      sessionStorage.setItem('activePrediction', JSON.stringify(matched));
      navigate('/result');
    }
  };

  if (loading) {
    return (
      <div className="py-8 px-6 max-w-6xl mx-auto space-y-6">
        <div className="h-8 bg-[#E5E7EB] rounded w-1/4 animate-pulse"></div>
        <DashboardSkeleton />
      </div>
    );
  }

  const latestAssessment = assessments[0];
  const hasHistory = assessments.length > 0;

  return (
    <div className="py-10 px-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Welcome back, {user?.name}</h1>
          <p className="text-base text-[#64748B] mt-1.5 font-medium">Manage your predictive models and AI coaching logs</p>
        </div>
        <Link
          to="/assessment"
          className="flex items-center gap-2 px-5 py-3 bg-[#2563EB] text-white text-base font-bold rounded-md hover:bg-blue-700 transition-colors shadow-md cursor-pointer"
        >
          <ClipboardList className="w-5 h-5" /> Start Success Assessment
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Latest Career recommendation */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Top Recommendation</span>
            <Compass className="w-6 h-6 text-[#2563EB]" />
          </div>
          <p className="text-xl font-bold text-[#0F172A] truncate">
            {hasHistory ? latestAssessment.predictedCareer : "No Assessment Yet"}
          </p>
          <p className="text-sm text-[#475569]">
            {hasHistory ? `Match confidence: ${(latestAssessment.confidence * 100).toFixed(1)}%` : "Start assessment to get prediction"}
          </p>
        </div>

        {/* Readiness Index Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Success Readiness Score</span>
            <Trophy className="w-6 h-6 text-[#2563EB]" />
          </div>
          <p className="text-xl font-bold text-[#0F172A]">
            {hasHistory ? `${latestAssessment.careerReadinessScore?.toFixed(1) || '75.0'} / 100` : "N/A"}
          </p>
          <p className="text-sm text-[#475569]">
            {hasHistory ? "Continuous placement index score" : "Scores are calculated dynamically"}
          </p>
        </div>

        {/* Diagnostic strengths count card */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Strengths Identified</span>
            <BarChart className="w-6 h-6 text-[#2563EB]" />
          </div>
          <p className="text-xl font-bold text-[#0F172A]">
            {hasHistory ? `${latestAssessment.strengths?.length || 0} Strengths` : "N/A"}
          </p>
          <p className="text-sm text-[#475569]">
            {hasHistory ? "Areas with scores above target" : "Acquire projects to satisfy targets"}
          </p>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0F172A]">AI Diagnosis History</h2>
          <span className="text-sm bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-1.5 text-[#475569] font-bold rounded-md">
            {assessments.length} Record{assessments.length !== 1 ? 's' : ''}
          </span>
        </div>

        {!hasHistory ? (
          <div className="p-16 text-center max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
              <ClipboardList className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A]">No diagnoses found</h3>
            <p className="text-base text-[#475569] leading-relaxed">
              Begin by taking your placement success assessment to evaluate your career preparedness.
            </p>
            <Link
              to="/assessment"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              Take Success Assessment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-sm font-bold text-[#475569] uppercase tracking-wider">
                  <th className="px-6 py-4">Recommended Pathway</th>
                  <th className="px-6 py-4">Readiness Index</th>
                  <th className="px-6 py-4">Model Confidence</th>
                  <th className="px-6 py-4">Evaluation Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-base text-[#0F172A]">
                {assessments.map((a) => (
                  <tr
                    key={a._id}
                    onClick={() => handleRowClick(a._id)}
                    className="hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-5 font-bold text-[#2563EB]">{a.predictedCareer}</td>
                    <td className="px-6 py-5 font-black text-[#0F172A]">{a.careerReadinessScore?.toFixed(1) || '75.0'} / 100</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#2563EB] h-full"
                            style={{ width: `${a.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-bold">{(a.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[#475569] font-semibold">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#2563EB] shrink-0" />
                        {new Date(a.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleRowClick(a._id)}
                          className="p-2 text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded border border-[#E5E7EB] transition-colors cursor-pointer"
                          title="View Results"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          disabled={downloadingId === a._id}
                          onClick={(e) => handleDownloadPDF(a._id, e)}
                          className="p-2 text-[#2563EB] hover:text-white hover:bg-[#2563EB] rounded border border-blue-200 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Download PDF"
                        >
                          {downloadingId === a._id ? (
                            <span className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin block"></span>
                          ) : (
                            <FileDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
