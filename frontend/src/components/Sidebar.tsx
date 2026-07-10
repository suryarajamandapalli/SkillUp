import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ClipboardList, BarChart3, User, ShieldAlert, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, firebaseUser } = useAuth();

  if (!firebaseUser || !user) return null;

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/assessment', label: 'Career Assessment', icon: ClipboardList },
    { to: '/analytics', label: 'Analytics Panel', icon: BarChart3 },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  if (user.role === 'admin') {
    links.push({ to: '/admin', label: 'Admin Panel', icon: ShieldAlert });
  }

  const activeClass = "flex items-center gap-3 px-4 py-2.5 text-base font-bold text-[#2563EB] bg-blue-50 border-r-2 border-[#2563EB] rounded-l-md transition-all-200";
  const inactiveClass = "flex items-center gap-3 px-4 py-2.5 text-base font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-md transition-all-200";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 bg-white border-r border-[#E5E7EB] w-64 z-40 transition-transform duration-300 md:translate-x-0 md:sticky md:top-16 md:h-[calc(100vh-64px)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full py-6 pl-4 pr-0">
          <div className="flex items-center justify-between pr-4 mb-6 md:hidden">
            <span className="text-sm font-bold text-[#475569] uppercase tracking-wider">Navigation</span>
            <button onClick={onClose} className="p-1 text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-md">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>

          {/* User Profile Summary at bottom */}
          <div className="mt-auto border-t border-[#E5E7EB] pt-4 pr-4">
            <div className="flex items-center gap-3 px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-md">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-9 h-9 rounded-full border border-[#E5E7EB] object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-[#0F172A] truncate">{user.name}</p>
                <p className="text-xs text-[#475569] capitalize truncate">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
