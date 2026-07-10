import React from 'react';
import { Cpu, CheckCircle2, Server, HelpCircle } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">System Architecture & Machine Learning</h1>
        <p className="text-base text-[#64748B] mt-2">Technical description of the SkillUp (CareerIQ) predictive modeling framework and data pipeline</p>
      </div>

      <div className="space-y-8">
        {/* ML model description */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[#2563EB] mb-4">
            <Cpu className="w-6 h-6" />
            <h2 className="text-lg font-bold text-[#0F172A]">Predictive Classification Model</h2>
          </div>
          <p className="text-base text-[#475569] leading-relaxed mb-4">
            The core prediction engine uses a <strong>Random Forest Classifier</strong> trained on historical academic performance and technical assessment data. Random Forest is an ensemble learning method that fits multiple decision trees on subsamples of the dataset and uses averaging to improve prediction accuracy and control over-fitting.
          </p>
          <div className="border-t border-[#E5E7EB] pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-[#F8FAFC] p-3 rounded border border-[#E5E7EB]">
              <span className="block text-sm font-bold text-[#0F172A]">StandardScaler</span>
              <span className="text-xs text-[#64748B]">Feature normalization</span>
            </div>
            <div className="bg-[#F8FAFC] p-3 rounded border border-[#E5E7EB]">
              <span className="block text-sm font-bold text-[#0F172A]">LabelEncoder</span>
              <span className="text-xs text-[#64748B]">Target career encoding</span>
            </div>
            <div className="bg-[#F8FAFC] p-3 rounded border border-[#E5E7EB]">
              <span className="block text-sm font-bold text-[#0F172A]">RandomForest</span>
              <span className="text-xs text-[#64748B]">100 estimators, max depth 8</span>
            </div>
          </div>
        </div>

        {/* Evaluation features */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[#2563EB] mb-4">
            <Server className="w-6 h-6" />
            <h2 className="text-lg font-bold text-[#0F172A]">Input Parameters (Features)</h2>
          </div>
          <p className="text-base text-[#475569] leading-relaxed mb-4">
            The system evaluates students across nine structured dimensions on a 1-to-10 scale:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-base text-[#0F172A]">
            {[
              "Academic Foundation (GPA & Coursework)",
              "Programming Concepts & Algorithms",
              "Web & Frontend Development",
              "Data Analysis & Databases",
              "Information & Cyber Security",
              "Computer Networks & Cloud Infrastructure",
              "System Design & Architecture",
              "Professional Communication & Leadership",
              "Project Management & Agile Methodologies"
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Roadmap logic */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[#2563EB] mb-4">
            <HelpCircle className="w-6 h-6" />
            <h2 className="text-lg font-bold text-[#0F172A]">Skill Gap & Recommendation Logic</h2>
          </div>
          <p className="text-base text-[#475569] leading-relaxed">
            Once a career prediction is generated, the system performs a <strong>set-difference analysis</strong> between the student's scoring and the target profile requirements. Any requirement where the student scores below 7 is flagged as a <i>Missing Skill</i>. The recommendation engine then maps these gaps to specific learning resources, technical capstones, industry-standard certifications, and schedules a phased preparation timeline.
          </p>
        </div>
      </div>
    </div>
  );
};
