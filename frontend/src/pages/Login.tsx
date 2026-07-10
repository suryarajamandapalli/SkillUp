import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, AlertCircle, Mail, Lock, User, GraduationCap, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

/* =====================================================
   PORTAL SELECTION PAGE
   ===================================================== */
export const LoginSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-[#F8FAFC]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full space-y-8"
      >
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-blue-50 text-[#2563EB] rounded-md">
            <Compass className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Welcome to SkillUp</h1>
          <p className="text-base text-[#64748B] max-w-md mx-auto">
            Choose your portal below to sign in or manage your assessments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Student Portal */}
          <div className="bg-white p-8 border border-[#E5E7EB] rounded-lg shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">🎓 Student Portal</h2>
              <p className="text-base text-[#475569] leading-relaxed">
                Complete assessments, view Career Readiness Score, Skill Gap Analysis, AI Mentor, Learning Roadmap and Reports.
              </p>
            </div>
            <button
              onClick={() => navigate('/student/login')}
              className="w-full py-3 px-4 bg-[#2563EB] hover:bg-blue-700 text-white rounded-md text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              Continue
            </button>
          </div>

          {/* Card 2: Administrator Portal */}
          <div className="bg-white p-8 border border-[#E5E7EB] rounded-lg shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded bg-slate-50 text-[#475569] flex items-center justify-center border border-slate-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">🛡 Administrator Portal</h2>
              <p className="text-base text-[#475569] leading-relaxed">
                Manage students, analytics, prediction reports, AI monitoring and application settings.
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/login')}
              className="w-full py-3 px-4 bg-[#0F172A] hover:bg-slate-800 text-white rounded-md text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* =====================================================
   STUDENT LOGIN PAGE
   ===================================================== */
export const StudentLogin: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRedirect = (profile: any) => {
    if (profile.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const profile = await loginWithGoogle('student');
      handleRedirect(profile);
    } catch (err: any) {
      setError(err.message || "Google Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error("Full Name is required for registration.");
        const profile = await registerWithEmail(email, password, name.trim(), 'student');
        handleRedirect(profile);
      } else {
        const profile = await loginWithEmail(email, password);
        handleRedirect(profile);
      }
    } catch (err: any) {
      let friendlyError = err.message || "Authentication failed.";
      if (err.code === 'auth/user-not-found') friendlyError = "No account found with this email.";
      if (err.code === 'auth/wrong-password') friendlyError = "Incorrect password.";
      if (err.code === 'auth/email-already-in-use') friendlyError = "This email is already registered.";
      if (err.code === 'auth/weak-password') friendlyError = "Password must be at least 6 characters.";
      setError(friendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-[#F8FAFC]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 border border-[#E5E7EB] rounded-lg max-w-md w-full shadow-sm space-y-6"
      >
        {/* Back option */}
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#64748B] hover:text-[#0F172A]">
          <ArrowLeft className="w-4 h-4" /> Back to Portal Selection
        </Link>

        {/* Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-50 text-[#2563EB] rounded-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Welcome to SkillUp</h2>
          <p className="text-sm font-bold text-[#2563EB] tracking-wide uppercase">Student Portal</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-md flex items-start gap-2.5 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Authentication */}
        {!isSignUp && (
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-[#E5E7EB] rounded-md text-sm font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.7 3.42-4.51 6.76-4.51z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.57l3.77 2.92c2.2-2.03 3.48-5.02 3.48-8.64z"/>
              <path fill="#FBBC05" d="M5.24 14.81c-.23-.69-.37-1.44-.37-2.21s.14-1.52.37-2.21L1.39 7.4C.5 9.18 0 11.18 0 13.25s.5 4.07 1.39 5.85l3.85-2.99z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.77-2.92c-1.12.75-2.54 1.2-4.19 1.2-3.34 0-5.86-1.81-6.76-4.51l-3.85 2.99C3.37 20.33 7.35 23 12 23z"/>
            </svg>
            Continue with Google
          </button>
        )}

        {!isSignUp && (
          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]"></div>
            </div>
            <span className="relative bg-white px-3 text-xs text-[#64748B] uppercase tracking-wider font-bold">
              OR
            </span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleManualAuth} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-[#0F172A]">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB]"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-[#0F172A]">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB]"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-[#0F172A]">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-blue-700 text-white rounded-md text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              isSignUp ? 'Sign Up' : 'Sign In'
            )}
          </button>
        </form>

        <div className="flex flex-col gap-2 items-center text-xs font-semibold text-[#64748B] pt-2 border-t border-[#E5E7EB] mt-4">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-sm font-bold text-[#2563EB] hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* =====================================================
   ADMINISTRATOR LOGIN PAGE (No registration allowed)
   ===================================================== */
export const AdminLogin: React.FC = () => {
  const { loginWithGoogle, loginWithEmail } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRedirect = (profile: any) => {
    if (profile.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const profile = await loginWithGoogle('admin');
      handleRedirect(profile);
    } catch (err: any) {
      setError(err.message || "Google Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const profile = await loginWithEmail(email, password);
      handleRedirect(profile);
    } catch (err: any) {
      let friendlyError = err.message || "Authentication failed.";
      if (err.code === 'auth/user-not-found') friendlyError = "No account found with this email.";
      if (err.code === 'auth/wrong-password') friendlyError = "Incorrect password.";
      setError(friendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-[#F8FAFC]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 border border-[#E5E7EB] rounded-lg max-w-md w-full shadow-sm space-y-6"
      >
        {/* Back option */}
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#64748B] hover:text-[#0F172A]">
          <ArrowLeft className="w-4 h-4" /> Back to Portal Selection
        </Link>

        {/* Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-slate-50 border border-slate-100 text-[#475569] rounded-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Welcome to SkillUp</h2>
          <p className="text-sm font-bold text-[#475569] tracking-wide uppercase">Administrator Portal</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-md flex items-start gap-2.5 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Authentication */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-[#E5E7EB] rounded-md text-sm font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.7 3.42-4.51 6.76-4.51z"/>
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.57l3.77 2.92c2.2-2.03 3.48-5.02 3.48-8.64z"/>
            <path fill="#FBBC05" d="M5.24 14.81c-.23-.69-.37-1.44-.37-2.21s.14-1.52.37-2.21L1.39 7.4C.5 9.18 0 11.18 0 13.25s.5 4.07 1.39 5.85l3.85-2.99z"/>
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.77-2.92c-1.12.75-2.54 1.2-4.19 1.2-3.34 0-5.86-1.81-6.76-4.51l-3.85 2.99C3.37 20.33 7.35 23 12 23z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center justify-center py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E7EB]"></div>
          </div>
          <span className="relative bg-white px-3 text-xs text-[#64748B] uppercase tracking-wider font-bold">
            OR
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-[#0F172A]">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB]"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-[#0F172A]">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-[#0F172A] hover:bg-slate-800 text-white rounded-md text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
