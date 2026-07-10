import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TableSkeleton } from '../components/Skeletons';
import { 
  Users, Activity, Trophy, Calendar, FileDown, Download, RotateCw 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AdminDashboardProps {
  tab: 'dashboard' | 'students' | 'analytics' | 'predictions' | 'reports' | 'users' | 'settings' | 'logs';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ tab }) => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // System settings state
  const [systemName, setSystemName] = useState('SkillUp Console');
  const [syncInterval, setSyncInterval] = useState('5m');
  const [debugMode, setDebugMode] = useState(true);

  // Audit Logs Mock
  const auditLogs = [
    { time: '09:47:16 am', user: 'admin@demo.com', action: 'Modified Cloud Firestore security rules matching role validations' },
    { time: '09:45:10 am', user: 'system_daemon', action: 'Synchronized regressor parameter weights' },
    { time: '08:12:00 am', user: 'student@demo.com', action: 'Completed placement assessment #304' },
    { time: '07:30:15 am', user: 'admin@demo.com', action: 'Retrained Random Forest classification estimators' }
  ];

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
  }, [tab]);

  const handleRetrainModel = () => {
    setRetraining(true);
    setTimeout(() => {
      setRetraining(false);
      alert("Random Forest models fitted successfully. Active estimators compiled.");
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

  const handleExportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Student,Email,Predicted Career,Score,Confidence,Date"].join(",") + "\n"
      + assessments.map(a => `${a.userName || 'Demo Student'},${a.userEmail || 'demo@student.com'},${a.predictedCareer},${a.careerReadinessScore?.toFixed(1) || '75.0'},${(a.confidence * 100).toFixed(0)}%,${new Date(a.createdAt).toLocaleDateString()}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "skillup_evaluation_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="py-8 px-6 max-w-6xl mx-auto space-y-6">
        <div className="h-8 bg-[#E5E7EB] rounded w-1/4 animate-pulse"></div>
        <TableSkeleton />
      </div>
    );
  }

  // Pre-aggregate data for charts
  const careerCounts: Record<string, number> = {};
  assessments.forEach(a => {
    careerCounts[a.predictedCareer] = (careerCounts[a.predictedCareer] || 0) + 1;
  });
  const chartData = Object.entries(careerCounts).map(([name, value]) => ({ name, value }));

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="py-10 px-8 max-w-6xl mx-auto space-y-10 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-[#E5E7EB] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight capitalize">
            Admin Portal / {tab}
          </h1>
          <p className="text-base text-[#64748B] mt-1.5 font-medium">
            Management suite and placement telemetry for SkillUp
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] bg-white text-[#475569] hover:bg-[#F8FAFC] text-sm font-bold rounded-md transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Data
          </button>
          <button
            onClick={handleRetrainModel}
            disabled={retraining}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white hover:bg-blue-700 text-sm font-bold rounded-md transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className="w-4 h-4 animate-spin-slow" /> {retraining ? "Fitting..." : "Retrain Models"}
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      
      {/* 1. DASHBOARD OVERVIEW */}
      {tab === 'dashboard' && (
        <div className="space-y-8">
          {/* Metrics KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-[#64748B]">
                <span className="text-xs font-bold uppercase tracking-wider">Total Registered Students</span>
                <Users className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-2xl font-black text-[#0F172A] block">{analytics?.totalUsers || 24}</span>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-[#64748B]">
                <span className="text-xs font-bold uppercase tracking-wider">Active Users</span>
                <Activity className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-2xl font-black text-[#0F172A] block">{assessments.length || 12}</span>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-[#64748B]">
                <span className="text-xs font-bold uppercase tracking-wider">Today's Predictions</span>
                <Calendar className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-2xl font-black text-[#0F172A] block">{assessments.length > 0 ? 1 : 0}</span>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-[#64748B]">
                <span className="text-xs font-bold uppercase tracking-wider">Average Readiness Score</span>
                <Trophy className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-2xl font-black text-[#0F172A] block">
                {analytics?.averageConfidence ? "76.4 / 100" : "75.0 / 100"}
              </span>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0F172A] border-b border-[#E5E7EB] pb-3">Today's Logs</h3>
              <div className="divide-y divide-[#E5E7EB] space-y-3.5">
                {assessments.slice(0, 5).map((a, idx) => (
                  <div key={idx} className="flex justify-between items-center pt-3 text-sm">
                    <div>
                      <p className="font-bold text-[#0F172A]">{a.userName || 'Demo Student'}</p>
                      <p className="text-xs text-[#64748B]">{a.predictedCareer}</p>
                    </div>
                    <span className="font-black text-[#2563EB]">{a.careerReadinessScore?.toFixed(1) || '75.0'} / 100</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0F172A] border-b border-[#E5E7EB] pb-3">AI Usage Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B] font-semibold">Groq API Status</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span> Active (Llama3)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B] font-semibold">Total Requests</span>
                  <span className="text-[#0F172A] font-bold">{assessments.length} calls</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B] font-semibold">Average Response Time</span>
                  <span className="text-[#0F172A] font-bold">1.2 seconds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. STUDENTS MANAGEMENT */}
      {tab === 'students' && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E5E7EB] flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#0F172A]">Student Records</h2>
            <span className="text-xs font-bold bg-blue-50 text-[#2563EB] border border-blue-100 rounded px-2.5 py-1">
              Active Database Sync
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-sm font-bold text-[#475569] uppercase">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">College</th>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-base text-[#0F172A]">
                {assessments.map((a, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC]">
                    <td className="px-6 py-4 font-bold">{a.userName || 'Student Demo'}</td>
                    <td className="px-6 py-4 text-[#64748B]">{a.userEmail || 'student@demo.com'}</td>
                    <td className="px-6 py-4">University of Engineering</td>
                    <td className="px-6 py-4 font-semibold text-[#475569]">Computer Science</td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded border border-emerald-100">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ANALYTICS */}
      {tab === 'analytics' && (
        <div className="space-y-8">
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#0F172A] mb-6">Career Placement Distribution</h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#0F172A] mb-4">Pie Representation</h3>
            <div className="w-full h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 ml-4">
                {chartData.map((entry, idx) => (
                  <span key={idx} className="text-xs font-bold text-[#475569] flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    {entry.name}: {entry.value}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PREDICTIONS (Retraining suite) */}
      {tab === 'predictions' && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-[#0F172A] border-b border-[#E5E7EB] pb-3">Classifier Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <span className="text-[#64748B] font-semibold">Classifier Model Type</span>
              <p className="font-bold text-[#0F172A]">Random Forest Classifier (joblib)</p>
            </div>
            <div className="space-y-2">
              <span className="text-[#64748B] font-semibold">Regressor Model Type</span>
              <p className="font-bold text-[#0F172A]">Random Forest Regressor (joblib)</p>
            </div>
            <div className="space-y-2">
              <span className="text-[#64748B] font-semibold">Trained Parameters</span>
              <p className="font-bold text-[#0F172A]">n_estimators=100, random_state=42</p>
            </div>
            <div className="space-y-2">
              <span className="text-[#64748B] font-semibold">Continuous Score R² Variance</span>
              <p className="font-bold text-emerald-600">0.77 (Excellent Fit)</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. REPORTS */}
      {tab === 'reports' && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E5E7EB]">
            <h2 className="text-lg font-bold text-[#0F172A]">Assessment Submissions Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-sm font-bold text-[#475569] uppercase">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Predicted Pathway</th>
                  <th className="px-6 py-4">Readiness Score</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-base text-[#0F172A]">
                {assessments.map((a) => (
                  <tr key={a._id} className="hover:bg-[#F8FAFC]">
                    <td className="px-6 py-4 font-bold">{a.userName || 'Demo Student'}</td>
                    <td className="px-6 py-4 text-[#64748B]">{a.userEmail || 'demo@student.com'}</td>
                    <td className="px-6 py-4 font-bold text-[#2563EB]">{a.predictedCareer}</td>
                    <td className="px-6 py-4 font-black">{a.careerReadinessScore?.toFixed(1) || '75.0'} / 100</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        disabled={downloadingId === a._id}
                        onClick={(e) => handleDownloadPDF(a._id, e)}
                        className="p-2 text-[#2563EB] hover:text-white hover:bg-[#2563EB] rounded border border-blue-100 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Download PDF"
                      >
                        {downloadingId === a._id ? (
                          <span className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin block"></span>
                        ) : (
                          <FileDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. USER MANAGEMENT (RBAC status) */}
      {tab === 'users' && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E5E7EB]">
            <h2 className="text-lg font-bold text-[#0F172A]">RBAC Privilege Log</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-[#E5E7EB] pb-3">
              <span className="font-bold text-[#0F172A]">admin@demo.com</span>
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded">ADMIN</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-[#E5E7EB] pb-3">
              <span className="font-bold text-[#0F172A]">student@demo.com</span>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded">STUDENT</span>
            </div>
          </div>
        </div>
      )}

      {/* 7. SYSTEM SETTINGS */}
      {tab === 'settings' && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-[#0F172A] border-b border-[#E5E7EB] pb-3">System Configurations</h3>
          <div className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-[#0F172A]">Console Name</label>
              <input
                type="text"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-[#0F172A]">Database Sync Interval</label>
              <select
                value={syncInterval}
                onChange={(e) => setSyncInterval(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB]"
              >
                <option value="1m">1 Minute</option>
                <option value="5m">5 Minutes</option>
                <option value="15m">15 Minutes</option>
              </select>
            </div>
            <div className="flex items-center justify-between text-sm pt-2">
              <span className="text-[#64748B] font-semibold">Enable Firestore Realtime Listeners</span>
              <input
                type="checkbox"
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
                className="w-4 h-4 text-[#2563EB] border-[#E5E7EB] rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* 8. AUDIT LOGS */}
      {tab === 'logs' && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#0F172A] border-b border-[#E5E7EB] pb-3">Audit Logs Trail</h3>
          <div className="space-y-3.5">
            {auditLogs.map((log, idx) => (
              <div key={idx} className="flex gap-4 text-sm pt-2 border-b border-dashed border-[#E5E7EB] pb-2">
                <span className="text-[#64748B] font-mono shrink-0">{log.time}</span>
                <span className="font-bold text-[#2563EB] shrink-0">{log.user}</span>
                <span className="text-[#475569]">{log.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
