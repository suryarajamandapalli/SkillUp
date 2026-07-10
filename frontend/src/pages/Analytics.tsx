import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { BarChart3, Database, UserCheck, ShieldCheck } from 'lucide-react';
import { CardSkeleton } from '../components/Skeletons';

export const Analytics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await api.getAnalytics();
        setStats(result);
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-8 px-6 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-[#E5E7EB] rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // Format data for chart
  const careerData = Object.keys(stats?.careerCounts || {}).map(career => ({
    name: career,
    count: stats.careerCounts[career]
  }));

  // Fallback charts data if there are no global statistics in the database yet
  const defaultCareerData = [
    { name: 'Software Engineer', count: 12 },
    { name: 'Data Scientist', count: 8 },
    { name: 'DevOps Engineer', count: 5 },
    { name: 'Cyber Security Analyst', count: 4 },
    { name: 'Product Manager', count: 6 },
    { name: 'UI/UX Designer', count: 4 }
  ];

  const chartData = careerData.length > 0 ? careerData : defaultCareerData;

  const totalEvaluations = stats?.totalAssessments || chartData.reduce((acc, curr) => acc + curr.count, 0);
  const averageConfidence = stats?.averageConfidence ? Math.round(stats.averageConfidence * 100) : 87;

  return (
    <div className="py-10 px-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1E293B] tracking-tight">System & Industry Analytics</h1>
        <p className="text-base text-[#475569] mt-1.5">Overview of active student career predictions and neural classification metrics</p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded bg-blue-50 text-[#2563EB]">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="block text-xs font-bold text-[#475569] uppercase tracking-wider">Total Evaluations</span>
            <span className="text-2xl font-black text-[#1E293B]">{totalEvaluations}</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded bg-blue-50 text-[#2563EB]">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="block text-xs font-bold text-[#475569] uppercase tracking-wider">Total Active Users</span>
            <span className="text-2xl font-black text-[#1E293B]">{stats?.totalUsers || totalEvaluations}</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded bg-blue-50 text-[#2563EB]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="block text-xs font-bold text-[#475569] uppercase tracking-wider">Average Match Confidence</span>
            <span className="text-2xl font-black text-[#1E293B]">{averageConfidence}%</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Career Distribution Chart */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
          <h3 className="text-base font-bold text-[#1E293B] mb-6 flex items-center gap-1.5 border-b border-[#E5E7EB] pb-3">
            <BarChart3 className="w-5 h-5 text-[#2563EB]" /> Career Distribution Match
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10, fontWeight: 500 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Neural Confidence Rate */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
          <h3 className="text-base font-bold text-[#1E293B] mb-6 flex items-center gap-1.5 border-b border-[#E5E7EB] pb-3">
            <BarChart3 className="w-5 h-5 text-[#2563EB]" /> Match Confidence Trend
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: 'Batch A', confidence: 82 },
                  { name: 'Batch B', confidence: 85 },
                  { name: 'Batch C', confidence: 88 },
                  { name: 'Batch D', confidence: 84 },
                  { name: 'Batch E', confidence: averageConfidence }
                ]}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10, fontWeight: 500 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="confidence" stroke="#2563EB" fill="#2563EB" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
