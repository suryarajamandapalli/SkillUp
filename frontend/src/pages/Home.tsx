import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Award, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const { firebaseUser } = useAuth();

  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="py-24 px-8 max-w-7xl mx-auto text-center space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-tight max-w-5xl mx-auto">
          Predict Your Career Pathway & Bridge the <span className="text-[#2563EB]">Skill Gap</span> with SkillUp
        </h1>
        <p className="text-lg md:text-xl text-[#475569] max-w-3xl mx-auto leading-relaxed">
          Evaluate your academic strengths and software engineering competencies. SkillUp (CareerIQ) uses machine learning models to classify your career match, run gap analysis reviews, and construct personalized study roadmaps.
        </p>
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={firebaseUser ? "/assessment" : "/login"}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-[#2563EB] text-white text-base font-bold rounded-md hover:bg-blue-700 transition-colors shadow-md"
          >
            Start Free Assessment <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/about"
            className="w-full sm:w-auto px-7 py-3.5 bg-white text-[#0F172A] text-base font-bold border border-[#E5E7EB] rounded-md hover:bg-[#F8FAFC] transition-colors"
          >
            Learn About Model
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-y border-[#E5E7EB] py-16 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          <div className="space-y-2">
            <p className="text-5xl font-black text-[#2563EB]">90%</p>
            <p className="text-base font-bold text-[#0F172A]">Model Prediction Accuracy</p>
            <p className="text-sm text-[#475569]">Trained on standard academic competencies</p>
          </div>
          <div className="space-y-2">
            <p className="text-5xl font-black text-[#2563EB]">6+</p>
            <p className="text-base font-bold text-[#0F172A]">Core Tech Job Profiles</p>
            <p className="text-sm text-[#475569]">Software, Data, Cloud & Cyber Security</p>
          </div>
          <div className="space-y-2">
            <p className="text-5xl font-black text-[#2563EB]">100%</p>
            <p className="text-base font-bold text-[#0F172A]">Personalized Roadmaps</p>
            <p className="text-sm text-[#475569]">Dynamic set-difference analysis matching skills</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-8 max-w-7xl mx-auto space-y-12">
        <h2 className="text-3xl font-extrabold text-center text-[#0F172A] tracking-tight">
          Comprehensive Evaluation Workflow
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 border border-[#E5E7EB] rounded-lg shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-md bg-blue-50 flex items-center justify-center text-[#2563EB]">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A]">Predictive Classification</h3>
            <p className="text-sm text-[#475569] leading-relaxed">
              Input academic performance and core technical competencies. Our Random Forest model predicts matching specializations.
            </p>
          </div>

          <div className="bg-white p-8 border border-[#E5E7EB] rounded-lg shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-md bg-blue-50 flex items-center justify-center text-[#2563EB]">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A]">Quantitative Skill Gap</h3>
            <p className="text-sm text-[#475569] leading-relaxed">
              Identify core requirements where your ratings lag. Review strength profiles and missing qualifications interactively.
            </p>
          </div>

          <div className="bg-white p-8 border border-[#E5E7EB] rounded-lg shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-md bg-blue-50 flex items-center justify-center text-[#2563EB]">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A]">Targeted Roadmap & PDF</h3>
            <p className="text-sm text-[#475569] leading-relaxed">
              Acquire courses, projects, and certifications on a chronological timeline. Export assessment reports instantly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
