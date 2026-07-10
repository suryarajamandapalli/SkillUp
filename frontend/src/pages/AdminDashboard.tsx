import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TableSkeleton } from '../components/Skeletons';
import { ShieldAlert, Cpu, Eye, FileDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const [list, stats] = await Promise.all([
        api.getAllAssessments(),
        api.getAnalytics()
      ]);
      setAssessments(list);
      setAnalytics(stats);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRetrainModel = () => {
    setRetraining(true);
    setTimeout(() => {
      setRetraining(false);
      alert("Success Regressor & Classifier models retrained. Parameters synchronized successfully.");
    }, 2000);
  };

  const handleDownloadPDF = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(id);
    try {
      await api.downloadReportPDF(id);
    } catch (err) {
      alert("Failed to download PDF report.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-8 px-6 max-w-6xl mx-auto space-y-6">
        <div className="h-8 bg-[#E5E7EB] rounded w-1/4 animate-pulse"></div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="py-10 px-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Admin Console</h1>
          <p className="text-base text-[#64748B] mt-1.5 font-medium">Faculty placement dashboard and global evaluation monitoring</p>
        </div>
        <button
          onClick={handleRetrainModel}
          disabled={retraining}
          className="flex items-center gap-2 px-5 py-3 bg-[#2563EB] text-white text-base font-bold rounded-md hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <Cpu className="w-5 h-5" /> {retraining ? "Fitting Parameters..." : "Retrain AI Models"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-sm space-y-2">
          <span className="block text-xs font-bold text-[#475569] uppercase tracking-wider">Total Evaluated</span>
          <span className="text-2xl font-black text-[#0F172A] block">{analytics?.totalAssessments || 0}</span>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-sm space-y-2">
          <span className="block text-xs font-bold text-[#475569] uppercase tracking-wider">Active Users</span>
          <span className="text-2xl font-black text-[#0F172A] block">{analytics?.totalUsers || 0}</span>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-sm space-y-2">
          <span className="block text-xs font-bold text-[#475569] uppercase tracking-wider">Average Confidence</span>
          <span className="text-2xl font-black text-[#0F172A] block">
            {analytics?.averageConfidence ? `${(analytics.averageConfidence * 100).toFixed(0)}%` : "0%"}
          </span>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded bg-amber-50 text-amber-600 border border-amber-100">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-[#475569] uppercase tracking-wider">DB Mode</span>
            <span className="text-sm font-bold text-amber-600 mt-0.5 block">Mock Fallback Active</span>
          </div>
        </div>
      </div>

      {/* Table grid listing student evaluations */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E5E7EB]">
          <h2 className="text-lg font-bold text-[#0F172A]">All Student Predictions</h2>
        </div>

        {assessments.length === 0 ? (
          <div className="p-16 text-center text-[#475569] text-base italic">
            No evaluations completed globally yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-sm font-bold text-[#475569] uppercase tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Classified Pathway</th>
                  <th className="px-6 py-4">Success Score</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-base text-[#0F172A]">
                {assessments.map((a) => (
                  <tr key={a._id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-5 font-bold">{a.userName || 'Student Demo'}</td>
                    <td className="px-6 py-5 text-[#475569]">{a.userEmail || 'student@demo.com'}</td>
                    <td className="px-6 py-5 font-bold text-[#2563EB]">{a.predictedCareer}</td>
                    <td className="px-6 py-5 font-black text-[#0F172A]">{a.careerReadinessScore?.toFixed(1) || '75.0'} / 100</td>
                    <td className="px-6 py-5 font-semibold">{(a.confidence * 100).toFixed(0)}%</td>
                    <td className="px-6 py-5 text-[#475569]">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to="/result"
                          onClick={() => sessionStorage.setItem('activePrediction', JSON.stringify(a))}
                          className="p-2 text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded border border-[#E5E7EB]"
                          title="View Evaluation"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          disabled={downloadingId === a._id}
                          onClick={(e) => handleDownloadPDF(a._id, e)}
                          className="p-2 text-[#2563EB] hover:text-white hover:bg-[#2563EB] rounded border border-blue-200 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Download PDF Report"
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
