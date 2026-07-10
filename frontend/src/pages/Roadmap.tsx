import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, CircleDot } from 'lucide-react';

export const Roadmap: React.FC = () => {
  const rawPrediction = sessionStorage.getItem('activePrediction');

  if (!rawPrediction) {
    return (
      <div className="max-w-md mx-auto py-16 px-6 text-center">
        <h2 className="text-xl font-bold text-[#1E293B]">No Active Evaluation Found</h2>
        <Link to="/assessment" className="text-sm text-[#2563EB] underline mt-2 block">Take assessment first</Link>
      </div>
    );
  }

  const result = JSON.parse(rawPrediction);

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-10">
      {/* Back button */}
      <div>
        <Link to="/result" className="inline-flex items-center gap-2 text-sm font-bold text-[#475569] hover:text-[#1E293B]">
          <ArrowLeft className="w-4 h-4" /> Back to Recommendation
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1E293B] tracking-tight">Personalized Learning Roadmap</h1>
        <p className="text-base text-[#475569] mt-1.5 font-medium">Phased milestones to acquire competencies for a career as a <span className="font-bold text-[#1E293B]">{result.predictedCareer}</span></p>
      </div>

      {/* Timeline Section */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 shadow-sm">
        <div className="relative border-l border-[#E5E7EB] ml-4 pl-8 space-y-12">
          {result.roadmap && result.roadmap.map((phase: any, index: number) => (
            <div key={index} className="relative">
              {/* Point Indicator */}
              <span className="absolute -left-[42px] top-1 bg-white p-0.5 rounded-full z-10 flex items-center justify-center">
                <CircleDot className="w-6 h-6 text-[#2563EB]" />
              </span>

              {/* Phase Content */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <h3 className="text-lg font-bold text-[#1E293B]">{phase.phase}</h3>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-100 text-[#2563EB] text-xs font-bold rounded-md w-max">
                    <Calendar className="w-3.5 h-3.5" /> {phase.timeline}
                  </span>
                </div>
                
                <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-md p-5 space-y-3 shadow-inner">
                  <div className="flex items-center gap-1.5 text-sm text-[#1E293B] font-bold">
                    <BookOpen className="w-4 h-4 text-[#2563EB]" />
                    <span>Focus Objective</span>
                  </div>
                  <p className="text-base text-[#475569] leading-relaxed">{phase.objectives}</p>
                </div>

                {/* Tasks List */}
                <div className="space-y-3 pl-1">
                  <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Action Plan</h4>
                  <ul className="space-y-3.5 text-base text-[#475569]">
                    {phase.tasks && phase.tasks.map((task: string, taskIdx: number) => (
                      <li key={taskIdx} className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#2563EB] mt-2 shrink-0"></span>
                        <span className="leading-relaxed">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
