import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Compass, Menu } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, firebaseUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error("Sign-out error:", err);
    }
  };

  return (
    <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40 h-16 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        {firebaseUser && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 text-[#475569] hover:text-[#1E293B] hover:bg-[#F8FAFC] rounded-md md:hidden transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2">
          <Compass className="w-7 h-7 text-[#2563EB]" />
          <span className="font-bold text-xl text-[#0F172A] tracking-tight">SkillUp</span>
        </Link>
      </div>

      <nav className="flex items-center gap-6">
        <Link to="/about" className="text-base font-semibold text-[#475569] hover:text-[#0F172A] transition-colors">
          About
        </Link>
        {firebaseUser && user ? (
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-2 text-base font-semibold text-[#475569] hover:text-[#0F172A] transition-colors">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.name} 
                  className="w-7 h-7 rounded-full border border-[#E5E7EB] object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-[#2563EB]" />
              )}
              <span className="hidden sm:inline">{user.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-md border border-red-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-base font-bold bg-[#2563EB] text-white px-5 py-2.5 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            >
              Login / Sign Up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};
