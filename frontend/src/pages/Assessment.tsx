import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface AssessmentStep {
  key: string;
  title: string;
  description: string;
  category: 'academic' | 'technical' | 'soft' | 'profile';
  type: 'rating' | 'cgpa' | 'profile';
}

const STEPS: AssessmentStep[] = [
  { key: 'cgpa', title: 'Academic CGPA', description: 'Enter your current cumulative grade point average (CGPA) score on a 1.0 to 10.0 scale.', category: 'academic', type: 'cgpa' },
  { key: 'programmingSkills', title: 'Programming & Algorithms', description: 'Rate your capability in writing clean code, optimization, data structures, and algorithmic logic.', category: 'technical', type: 'rating' },
  { key: 'problemSolving', title: 'Problem Solving & Critical Thinking', description: 'Fluency in handling logic puzzles, math models, reasoning challenges, and debugging complex bugs.', category: 'technical', type: 'rating' },
  { key: 'communication', title: 'Professional Communication', description: 'Collaborating in cross-functional technical teams, writing reports, and explaining project design structures.', category: 'soft', type: 'rating' },
  { key: 'leadership', title: 'Leadership & Initiative', description: 'Experience coordinating team activities, managing conflict, running sprint updates, or leading hackathon tasks.', category: 'soft', type: 'rating' },
  { key: 'projects', title: 'Technical Projects Count & Depth', description: 'Rate your practical experience building and deploying codebases (including full-stack or architecture complexity).', category: 'technical', type: 'rating' },
  { key: 'internships', title: 'Internship / Work Experience', description: 'Professional software engineering internships, open-source organization contributions, or paid work experience.', category: 'technical', type: 'rating' },
  { key: 'certifications', title: 'Credential Certifications Rating', description: 'Quantity and industry recognition of technical credentials acquired (e.g. AWS Solutions Architect, Cisco CCNA, Scrum Master).', category: 'technical', type: 'rating' },
  { key: 'technicalSkills', title: 'Technical Skills Depth', description: 'Rate your overall depth in database architecture (SQL/NoSQL), networking, cybersecurity, and frameworks.', category: 'technical', type: 'rating' },
  { key: 'softSkills', title: 'Interpersonal & Soft Skills', description: 'Adaptability, active listening, time management, and performance in placement mock evaluations.', category: 'soft', type: 'rating' },
  { key: 'profileDetails', title: 'Interests & Specializations', description: 'Indicate your specialization areas and target engineering certifications.', category: 'profile', type: 'profile' }
];

const INTEREST_OPTIONS = ["Web Development", "Data Engineering", "Machine Learning", "Cloud Infrastructure", "Cyber Security", "Product Strategy", "User Experience"];
const CERTIFICATION_OPTIONS = ["AWS/GCP Certified", "CCNA Certified", "Scrum Master (CSM)", "Oracle Java Professional", "CompTIA Security+", "None"];

export const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    cgpa: 7.5,
    programmingSkills: 5,
    problemSolving: 5,
    communication: 5,
    leadership: 5,
    projects: 5,
    internships: 5,
    certifications: 5,
    technicalSkills: 5,
    softSkills: 5
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [certificationsList, setCertificationsList] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepInfo = STEPS[currentStep];

  const handleScoreChange = (score: number) => {
    setScores(prev => ({
      ...prev,
      [stepInfo.key]: score
    }));
  };

  const handleCgpaChange = (val: string) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = 0;
    num = Math.max(1.0, Math.min(10.0, num));
    setScores(prev => ({
      ...prev,
      cgpa: num
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleCertToggle = (cert: string) => {
    setCertificationsList(prev =>
      prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
    );
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...scores,
        interests,
        certificationsList
      };
      const result = await api.submitAssessment(payload);
      sessionStorage.setItem('activePrediction', JSON.stringify(result));
      navigate('/result');
    } catch (err) {
      alert("Error generating prediction. Please verify all services are active.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress percentage calculation
  const progressPercent = Math.round(((currentStep + 1) / STEPS.length) * 100);

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 space-y-8">
      {/* Header and Progress */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm font-bold text-[#475569]">
          <span className="uppercase tracking-wider">Placement Success Assessment</span>
          <span>Step {currentStep + 1} of {STEPS.length}</span>
        </div>
        
        {/* Progress Bar Container */}
        <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#2563EB] h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-10 shadow-sm min-h-[380px] flex flex-col justify-between">
        <div className="space-y-6">
          <span className="inline-flex px-3 py-1 bg-blue-50 border border-blue-100 text-[#2563EB] text-xs font-bold rounded-md uppercase tracking-wider">
            {stepInfo.category} Rating
          </span>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">{stepInfo.title}</h2>
            <p className="text-base text-[#475569] leading-relaxed">{stepInfo.description}</p>
          </div>

          {/* RATING INPUT SECTION */}
          {stepInfo.type === 'rating' && (
            <div className="py-6 space-y-6">
              <div className="flex justify-between items-center text-sm font-bold text-[#475569]">
                <span>Needs Improvement</span>
                <span className="text-[#2563EB] text-2xl font-black">Rating: {scores[stepInfo.key]} / 10</span>
                <span>Expert / Mastery</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={scores[stepInfo.key]}
                onChange={(e) => handleScoreChange(parseInt(e.target.value))}
                className="w-full h-2 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
              />
              <div className="grid grid-cols-10 gap-1.5 pt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleScoreChange(num)}
                    className={`py-2 text-sm font-bold border rounded-md transition-colors cursor-pointer ${
                      scores[stepInfo.key] === num
                        ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-sm'
                        : 'bg-white border-[#E5E7EB] text-[#0F172A] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CGPA INPUT SECTION */}
          {stepInfo.type === 'cgpa' && (
            <div className="py-8 flex flex-col items-center justify-center space-y-4">
              <div className="relative w-48">
                <input
                  type="number"
                  step="0.01"
                  min="1.0"
                  max="10.0"
                  value={scores.cgpa}
                  onChange={(e) => handleCgpaChange(e.target.value)}
                  className="w-full px-6 py-4 text-3xl font-black text-center bg-white border-2 border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  placeholder="8.50"
                />
                <span className="absolute right-4 bottom-4 text-xs font-bold text-[#64748B]">CGPA Max 10</span>
              </div>
              <p className="text-sm text-[#64748B]">Average score must fall between 1.00 and 10.00.</p>
            </div>
          )}

          {/* PROFILE SELECTION SECTION */}
          {stepInfo.type === 'profile' && (
            <div className="space-y-6 pt-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Select Specialization Fields</h4>
                <div className="flex flex-wrap gap-2.5">
                  {INTEREST_OPTIONS.map((interest) => {
                    const isSelected = interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-4 py-2 text-sm font-bold border rounded-md transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#2563EB] border-[#2563EB] text-white'
                            : 'bg-white border-[#E5E7EB] text-[#0F172A] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Target Certifications Profile</h4>
                <div className="flex flex-wrap gap-2.5">
                  {CERTIFICATION_OPTIONS.map((cert) => {
                    const isSelected = certificationsList.includes(cert);
                    return (
                      <button
                        key={cert}
                        type="button"
                        onClick={() => handleCertToggle(cert)}
                        className={`px-4 py-2 text-sm font-bold border rounded-md transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#2563EB] border-[#2563EB] text-white'
                            : 'bg-white border-[#E5E7EB] text-[#0F172A] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        {cert}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center border-t border-[#E5E7EB] pt-8 mt-6">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0 || isSubmitting}
            className="flex items-center gap-1.5 px-5 py-3 border border-[#E5E7EB] rounded-md text-sm font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>
          
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-6 py-3 bg-[#2563EB] text-white text-sm font-bold rounded-md hover:bg-blue-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Predicting...
              </span>
            ) : currentStep === STEPS.length - 1 ? (
              <span className="flex items-center gap-1.5">
                Calculate Career Success <Sparkles className="w-4 h-4" />
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Next Step <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
