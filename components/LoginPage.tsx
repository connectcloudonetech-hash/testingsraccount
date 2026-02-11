import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { LOGO_URL } from '../constants';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean> | boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await onLogin(username, password);
    if (!success) {
      setError('Check credentials and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="relative w-32 h-32 mb-8 flex items-center justify-center animate-in zoom-in-50 duration-700">
            <img src={LOGO_URL} alt="SR Logo" className="w-full h-full object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
            SR <span className="text-[#E31E24]">INFOTECH</span>
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">Financial Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <input
              type="text"
              required
              className="w-full px-6 py-5 bg-slate-100/50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold text-slate-900 text-sm placeholder-slate-300"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <input
              type="password"
              required
              className="w-full px-6 py-5 bg-slate-100/50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold text-slate-900 text-sm placeholder-slate-300"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="py-2 text-rose-500 text-[10px] font-black uppercase tracking-widest text-center animate-in fade-in duration-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#E31E24] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-2xl shadow-red-200 flex items-center justify-center gap-3 active:scale-95 mt-6"
          >
            Authenticate
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-16 flex items-center justify-center gap-2 text-slate-300 text-[9px] font-bold uppercase tracking-[0.2em]">
          <ShieldCheck size={14} className="text-emerald-500/50" />
          Enterprise Security Active
        </div>
      </div>
    </div>
  );
};

export default LoginPage;