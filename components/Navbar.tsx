import React from 'react';
import { Wallet, FileText, Database, Shield, LogOut, User as UserIcon, BarChart3 } from 'lucide-react';
import { User, UserRole } from '../types';
import { LOGO_URL } from '../constants';

interface NavbarProps {
  onNavChange: (view: 'dashboard' | 'statement' | 'reports' | 'sql' | 'admin') => void;
  activeView: string;
  currentUser: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavChange, activeView, currentUser, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: <Wallet size={20} /> },
    { id: 'statement', label: 'History', icon: <FileText size={20} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
    ...(currentUser.role === UserRole.ADMIN ? [
      { id: 'admin', label: 'Admin', icon: <Shield size={20} /> },
      { id: 'sql', label: 'Dev', icon: <Database size={20} /> }
    ] : []),
  ];

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-[60] glass border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden rounded-lg shadow-sm bg-white">
              <img src={LOGO_URL} alt="SR Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-extrabold text-slate-900 tracking-tighter">
              SR <span className="text-[#E31E24]">INFOTECH</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <p className="text-[10px] font-bold text-slate-900">{currentUser.name}</p>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{currentUser.role}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Side Navigation / Fixed Desktop Nav */}
      <nav className="hidden md:flex fixed top-16 left-0 bottom-0 w-20 flex-col items-center py-8 glass border-r border-slate-200/50 z-[50]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavChange(item.id as any)}
            className={`p-4 mb-4 rounded-2xl transition-all relative group ${
              activeView === item.id
                ? 'bg-red-50 text-[#E31E24] shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {item.icon}
            <span className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] glass border-t border-slate-200/50 safe-bottom">
        <div className="flex justify-around items-center h-16 px-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id as any)}
              className={`flex flex-col items-center justify-center w-full h-full transition-all ${
                activeView === item.id
                  ? 'text-[#E31E24]'
                  : 'text-slate-400'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${activeView === item.id ? 'bg-red-50 scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-bold mt-1 tracking-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;