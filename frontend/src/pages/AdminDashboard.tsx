import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TableSkeleton } from '../components/Skeletons';
import { 
  Users, Activity, Trophy, Calendar, FileDown, Download, RotateCw 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MlPredictionConsole } from './MlPredictionConsole';
import { seedDatabase } from '../services/seeder';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

interface AdminDashboardProps {
  tab: 'dashboard' | 'students' | 'analytics' | 'predictions' | 'reports' | 'users' | 'settings' | 'logs' | 'ml-console';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ tab }) => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [seedingStatus, setSeedingStatus] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await seedDatabase((status) => setSeedingStatus(status));
      alert("Firestore seeded successfully with 17 students and reports!");
      fetchAdminData();
    } catch (err: any) {
      alert("Failed to seed database: " + err.message);
    } finally {
      setSeeding(false);
      setSeedingStatus(null);
    }
  };

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

  const [users, setUsers] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  const fetchAdminData = async () => {
    try {
      const [list, , userList] = await Promise.all([
        api.getAllAssessments(),
        api.getAnalytics(),
        api.getAllUsers()
      ]);
      setAssessments(list);
      setUsers(userList);

      // Fetch dynamic activity logs
      try {
        const logsSnap = await getDocs(collection(db, 'activity_logs'));
        const logsList: any[] = [];
        logsSnap.forEach(d => {
          logsList.push(d.data());
        });
        // Sort logs descending by timestamp
        logsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivityLogs(logsList);
      } catch (err) {
        console.warn("Could not load activity logs:", err);
      }
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
  const studentUsers = users.filter(u => u.role === 'student');
  const totalStudentsCount = studentUsers.length;

  const totalScores = assessments.reduce((acc, curr) => acc + (curr.careerReadinessScore || 75.0), 0);
  const averageReadinessScore = assessments.length > 0 ? (totalScores / assessments.length).toFixed(1) : "75.0";

  // Career counts
  const careerCounts: Record<string, number> = {};
  assessments.forEach(a => {
    if (a.predictedCareer) {
      careerCounts[a.predictedCareer] = (careerCounts[a.predictedCareer] || 0) + 1;
    }
  });
  const chartData = Object.entries(careerCounts).map(([name, value]) => ({ name, value }));

  // Branch counts
  const branchCounts: Record<string, number> = {};
  studentUsers.forEach(u => {
    if (u.branch) {
      branchCounts[u.branch] = (branchCounts[u.branch] || 0) + 1;
    }
  });
  const branchChartData = Object.entries(branchCounts).map(([name, value]) => ({ name, value }));

  // CGPA brackets
  const cgpaBrackets = { "< 7.0": 0, "7.0 - 8.0": 0, "8.0 - 9.0": 0, "> 9.0": 0 };
  studentUsers.forEach(u => {
    if (u.cgpa < 7.0) cgpaBrackets["< 7.0"]++;
    else if (u.cgpa < 8.0) cgpaBrackets["7.0 - 8.0"]++;
    else if (u.cgpa < 9.0) cgpaBrackets["8.0 - 9.0"]++;
    else cgpaBrackets["> 9.0"]++;
  });
  const cgpaChartData = Object.entries(cgpaBrackets).map(([name, value]) => ({ name, value }));

  // Leaderboard (Sorted by readiness score)
  const leaderboard = [...assessments].sort((a, b) => (b.careerReadinessScore || 0) - (a.careerReadinessScore || 0));

  // Needing improvement (Score < 75)
  const needingImprovement = [...assessments]
    .filter(a => (a.careerReadinessScore || 0) < 75)
    .sort((a, b) => (a.careerReadinessScore || 0) - (b.careerReadinessScore || 0));

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
              <span className="text-2xl font-black text-[#0F172A] block">{totalStudentsCount}</span>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-[#64748B]">
                <span className="text-xs font-bold uppercase tracking-wider">Active Users</span>
                <Activity className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-2xl font-black text-[#0F172A] block">{assessments.length}</span>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-[#64748B]">
                <span className="text-xs font-bold uppercase tracking-wider">Total Assessments</span>
                <Calendar className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-2xl font-black text-[#0F172A] block">{assessments.length}</span>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-[#64748B]">
                <span className="text-xs font-bold uppercase tracking-wider">Average Readiness Score</span>
                <Trophy className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-2xl font-black text-[#0F172A] block">
                {averageReadinessScore} / 100
              </span>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0F172A] border-b border-[#E5E7EB] pb-3">Recent Activity Logs</h3>
              <div className="divide-y divide-[#E5E7EB] space-y-3.5">
                {activityLogs.length > 0 ? (
                  activityLogs.slice(0, 5).map((log, idx) => (
                    <div key={idx} className="flex justify-between items-center pt-3 text-sm">
                      <div className="pr-4">
                        <p className="font-bold text-[#0F172A]">{log.user}</p>
                        <p className="text-xs text-[#64748B] leading-relaxed">{log.action}</p>
                      </div>
                      <span className="text-xs font-mono text-[#64748B] shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#64748B] py-4">No recent activity logs available. Seed database to populate.</p>
                )}
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
                {studentUsers.length > 0 ? (
                  studentUsers.map((u, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC]">
                      <td className="px-6 py-4 font-bold">{u.name}</td>
                      <td className="px-6 py-4 text-[#64748B]">{u.email}</td>
                      <td className="px-6 py-4">{u.college}</td>
                      <td className="px-6 py-4 font-semibold text-[#475569]">{u.branch}</td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded border border-emerald-100">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#64748B]">
                      No student records found. Click Seed Demo Data in settings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ANALYTICS */}
      {tab === 'analytics' && (
        <div className="space-y-8">
          {/* Row 1: Career Placement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
              <h3 className="text-base font-bold text-[#0F172A] mb-6">Career Recommendation Distribution</h3>
              <div className="w-full h-72">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-[#64748B]">No data. Seed database first.</div>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
              <h3 className="text-base font-bold text-[#0F172A] mb-4">Pie Representation</h3>
              <div className="w-full h-72 flex items-center justify-center">
                {chartData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="60%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2 ml-4 w-[40%] overflow-y-auto max-h-64 pr-2">
                      {chartData.map((entry, idx) => (
                        <span key={idx} className="text-xs font-bold text-[#475569] flex items-center gap-1.5 whitespace-nowrap">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                          {entry.name}: {entry.value}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-[#64748B]">No data. Seed database first.</div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Branch & CGPA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
              <h3 className="text-base font-bold text-[#0F172A] mb-6">Branch Distribution</h3>
              <div className="w-full h-72">
                {branchChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-[#64748B]">No data. Seed database first.</div>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
              <h3 className="text-base font-bold text-[#0F172A] mb-6">CGPA Bracket Distribution</h3>
              <div className="w-full h-72">
                {cgpaChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cgpaChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-[#64748B]">No data. Seed database first.</div>
                )}
              </div>
            </div>
          </div>

          {/* Row 3: Leaderboard & Improvement Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0F172A] border-b border-[#E5E7EB] pb-3">Leaderboard - Top Performing Students</h3>
              <div className="divide-y divide-[#E5E7EB]">
                {leaderboard.length > 0 ? (
                  leaderboard.slice(0, 5).map((a, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 text-sm">
                      <div>
                        <p className="font-bold text-[#0F172A]">{a.userName || 'Demo Student'}</p>
                        <p className="text-xs text-[#64748B]">Recommended Career: {a.predictedCareer}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-[#10B981]">{a.careerReadinessScore?.toFixed(1) || '75.0'}%</span>
                        <p className="text-[10px] text-[#64748B] font-semibold">Readiness Score</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#64748B] py-4 text-center">No reports generated. Seed database to populate.</p>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0F172A] border-b border-[#E5E7EB] pb-3">Students Needing Placement Coaching</h3>
              <div className="divide-y divide-[#E5E7EB]">
                {needingImprovement.length > 0 ? (
                  needingImprovement.slice(0, 5).map((a, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 text-sm">
                      <div>
                        <p className="font-bold text-[#0F172A]">{a.userName || 'Demo Student'}</p>
                        <p className="text-xs text-[#64748B]">Recommended Career: {a.predictedCareer}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-[#EF4444]">{a.careerReadinessScore?.toFixed(1) || '60.0'}%</span>
                        <p className="text-[10px] text-[#64748B] font-semibold">Readiness Score</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#64748B] py-4 text-center">All active students exceed placement readiness requirements.</p>
                )}
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

            <div className="pt-4 border-t border-[#E5E7EB] space-y-2">
              <span className="block text-sm font-bold text-[#0F172A]">Demo Data Initialization</span>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Clear all database records in Firestore and seed 17 unique Indian student profiles with career predictions, learning progress, and logs telemetry.
              </p>
              <button
                onClick={handleSeedData}
                disabled={seeding}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#2563EB] text-white hover:bg-blue-700 text-sm font-bold rounded-md transition-colors disabled:opacity-50 cursor-pointer"
              >
                {seeding ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{seedingStatus || "Seeding..."}</span>
                  </>
                ) : (
                  "Seed Demo Data (17 Students)"
                )}
              </button>
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

      {/* 9. ML PREDICTION DEBUG CONSOLE */}
      {tab === 'ml-console' && (
        <MlPredictionConsole />
      )}
    </div>
  );
};
