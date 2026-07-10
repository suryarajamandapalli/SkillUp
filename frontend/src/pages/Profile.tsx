import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Shield, Plus, X, Check, Save } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();

  // Edit fields
  const [college, setCollege] = useState(user?.college || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [year, setYear] = useState(user?.year || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [cgpa, setCgpa] = useState(user?.cgpa || 0);
  const [careerGoal, setCareerGoal] = useState(user?.careerGoal || '');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills(prev => [...prev, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests(prev => [...prev, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(prev => prev.filter(i => i !== interestToRemove));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        college,
        branch,
        year,
        phone,
        cgpa: Number(cgpa),
        careerGoal,
        skills,
        interests
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Failed to save profile. Verify Firestore connection.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Account Profile</h1>
        <p className="text-base text-[#64748B] mt-1.5">Manage your personal settings, academics, and verified credentials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column info */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm h-fit space-y-6">
          <div className="flex flex-col items-center text-center">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.name} 
                className="w-20 h-20 rounded-full border border-[#E5E7EB] object-cover mb-4"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-2xl shadow-sm mb-4">
                {user.name.charAt(0)}
              </div>
            )}
            <h2 className="text-lg font-bold text-[#0F172A]">{user.name}</h2>
            <span className="inline-block bg-blue-50 border border-blue-100 text-[#2563EB] text-xs font-bold px-3 py-1 rounded-md mt-2 capitalize">
              {user.role} Account
            </span>
          </div>

          <div className="border-t border-[#E5E7EB] pt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm text-[#475569]">
              <Mail className="w-5 h-5 text-[#2563EB] shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#475569]">
              <Shield className="w-5 h-5 text-[#2563EB] shrink-0" />
              <span className="capitalize">{user.role} access permissions</span>
            </div>
          </div>
        </div>

        {/* Edit fields form */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm lg:col-span-2 space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#0F172A] border-b border-[#E5E7EB] pb-3">Academic & Contact details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#0F172A]">College / Institution</label>
                <input 
                  type="text" 
                  value={college} 
                  onChange={(e) => setCollege(e.target.value)} 
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  placeholder="University Name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#0F172A]">Branch / Major</label>
                <input 
                  type="text" 
                  value={branch} 
                  onChange={(e) => setBranch(e.target.value)} 
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  placeholder="Computer Science"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#0F172A]">Graduation Year</label>
                <input 
                  type="text" 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)} 
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  placeholder="2027"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#0F172A]">Contact Phone</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  placeholder="+1 234 567 890"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#0F172A]">CGPA Score</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={cgpa} 
                  onChange={(e) => setCgpa(Number(e.target.value))} 
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  placeholder="8.5"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#0F172A]">Target Career Goal</label>
                <input 
                  type="text" 
                  value={careerGoal} 
                  onChange={(e) => setCareerGoal(e.target.value)} 
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  placeholder="Software Engineer"
                />
              </div>
            </div>
          </div>

          {/* Skills list manager */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#0F172A] border-b border-[#E5E7EB] pb-3">Technical Competencies</h3>
            
            <form onSubmit={handleAddSkill} className="flex gap-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                placeholder="Add technology tag (e.g. Node.js)"
              />
              <button
                type="submit"
                className="p-3 bg-[#2563EB] text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <div className="border border-[#E5E7EB] rounded-md p-5 bg-[#F8FAFC] min-h-24">
              {skills.length === 0 ? (
                <p className="text-sm text-[#475569] italic text-center py-6">No skills added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-md text-sm font-bold text-[#0F172A]"
                    >
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-[#64748B] hover:text-red-500 rounded-full">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interests list manager */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#0F172A] border-b border-[#E5E7EB] pb-3">Specialization Interests</h3>
            
            <form onSubmit={handleAddInterest} className="flex gap-3">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                placeholder="Add interest area (e.g. Cybersecurity)"
              />
              <button
                type="submit"
                className="p-3 bg-[#2563EB] text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <div className="border border-[#E5E7EB] rounded-md p-5 bg-[#F8FAFC] min-h-24">
              {interests.length === 0 ? (
                <p className="text-sm text-[#475569] italic text-center py-6">No interests added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-md text-sm font-bold text-[#0F172A]"
                    >
                      {interest}
                      <button type="button" onClick={() => handleRemoveInterest(interest)} className="text-[#64748B] hover:text-red-500 rounded-full">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 border-t border-[#E5E7EB] pt-5">
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveProfile}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#2563EB] text-white text-sm font-bold rounded-md hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : saved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving Changes..." : saved ? "Changes Saved!" : "Save Profile Details"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
