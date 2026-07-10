import React from 'react';
import { Link } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowLeft, ArrowRight, BarChart, CheckCircle2, XCircle } from 'lucide-react';

export const SkillGap: React.FC = () => {
  const rawPrediction = sessionStorage.getItem('activePrediction');

  if (!rawPrediction) {
    return (
      <div className="max-w-md mx-auto py-16 px-6 text-center">
        <h2 className="text-xl font-bold text-[#0F172A]">No Active Evaluation Found</h2>
        <Link to="/assessment" className="text-sm text-[#2563EB] underline mt-2 block">Take assessment first</Link>
      </div>
    );
  }

  const result = JSON.parse(rawPrediction);

  // Map scores for Recharts Radar Chart
  const radarData = [
    { subject: 'CGPA', rating: result.cgpa || 7, required: 7.5 },
    { subject: 'Programming', rating: result.programmingSkills || 5, required: 7 },
    { subject: 'Problem Solving', rating: result.problemSolving || 5, required: 7 },
    { subject: 'Communication', rating: result.communication || 5, required: 7 },
    { subject: 'Leadership', rating: result.leadership || 5, required: 6 },
    { subject: 'Projects Depth', rating: result.projects || 5, required: 7 },
    { subject: 'Internships', rating: result.internships || 5, required: 6 },
    { subject: 'Certifications', rating: result.certifications || 5, required: 6 },
    { subject: 'Technical Depth', rating: result.technicalSkills || 5, required: 7 },
    { subject: 'Soft Skills', rating: result.softSkills || 5, required: 7 }
  ];

  const hasGaps = result.weaknesses && result.weaknesses.length > 0;

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-10">
      {/* Back to Result */}
      <div>
        <Link to="/result" className="inline-flex items-center gap-2 text-sm font-bold text-[#475569] hover:text-[#0F172A]">
          <ArrowLeft className="w-4 h-4" /> Back to Recommendation
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Competency Skill Gap Matrix</h1>
        <p className="text-base text-[#475569] mt-1.5 font-medium">Comparing your skill profile against placement success criteria for a career as: <span className="font-bold text-[#0F172A]">{result.predictedCareer}</span></p>
      </div>

      {/* Main Grid: Chart and Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
          <h2 className="text-base font-bold text-[#0F172A] mb-4 flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <BarChart className="w-5 h-5 text-[#2563EB]" /> Radar Skill Matrix
          </h2>
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#94A3B8' }} />
                <Radar name="My Score" dataKey="rating" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '12px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs font-bold text-[#475569] border-t border-[#E5E7EB] pt-4 mt-3">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#2563EB]/15 border border-[#2563EB] rounded"></span> Assessed Rating (Max 10)</span>
          </div>
        </div>

        {/* Missing Skills and Strengths */}
        <div className="space-y-6">
          {/* Missing Skills */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
              <XCircle className="w-5 h-5 text-red-500" /> Focus Gaps (Score &lt; 7)
            </h3>
            
            {!hasGaps ? (
              <div className="text-center py-6 text-sm text-[#475569] italic">
                No technical gaps identified. Excellent!
              </div>
            ) : (
              <div className="space-y-4">
                {result.weaknesses.map((w: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2.5 text-base text-[#475569] bg-[#FFF5F5] border border-red-100 p-3 rounded-md">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <span className="font-bold text-[#0F172A]">{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Strengths */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A]" /> Profile Strengths (Score &ge; 7)
            </h3>
            
            {(!result.strengths || result.strengths.length === 0) ? (
              <div className="text-center py-6 text-sm text-[#475569] italic">
                No strengths rated above threshold yet.
              </div>
            ) : (
              <div className="space-y-4">
                {result.strengths.map((s: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2.5 text-base text-[#475569] bg-[#F0FDF4] border border-emerald-100 p-3 rounded-md">
                    <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                    <span className="font-bold text-[#0F172A]">{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Button to Roadmap */}
      <div className="flex justify-end pt-4">
        <Link
          to="/roadmap"
          className="flex items-center gap-1.5 px-6 py-3 bg-[#2563EB] text-white text-sm font-bold rounded-md hover:bg-blue-700 transition-colors shadow-md cursor-pointer"
        >
          Check Personal Learning Roadmap <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
