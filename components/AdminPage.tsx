
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Shield, UserPlus, Trash2, ShieldCheck, ShieldAlert, X } from 'lucide-react';

interface AdminPageProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onRemoveUser: (id: string) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ users, onAddUser, onRemoveUser }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.STAFF);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername && newName) {
      onAddUser({
        username: newUsername,
        name: newName,
        role: newRole,
        password: 'password123' // Default password
      });
      setNewUsername('');
      setNewName('');
      setIsAddOpen(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Shield className="text-[#E31E24]" size={32} />
            System Administration
          </h1>
          <p className="text-slate-500 mt-1">Manage users and access permissions for SR INFOTECH.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-[#E31E24] text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-200"
        >
          <UserPlus size={20} />
          Add New User
        </button>
      </header>

      {isAddOpen && (
        <div className="bg-white rounded-[2rem] p-8 border border-red-100 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Add User Account</h3>
            <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24]"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                placeholder="e.g. jdoe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24]"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Access Level</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24]"
                value={newRole}
                onChange={e => setNewRole(e.target.value as UserRole)}
              >
                <option value={UserRole.STAFF}>Staff (Viewer)</option>
                <option value={UserRole.ADMIN}>Admin (Full Access)</option>
              </select>
            </div>
            <button type="submit" className="bg-slate-900 text-white h-[46px] rounded-xl font-bold hover:bg-slate-800 transition-all">
              Create Account
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Authorized Personnel</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-widest">
              <tr>
                <th className="px-10 py-6">Identity</th>
                <th className="px-10 py-6">Username</th>
                <th className="px-10 py-6">Permission Level</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 font-mono text-sm text-slate-500">@{u.username}</td>
                  <td className="px-10 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      u.role === UserRole.ADMIN 
                        ? 'bg-red-50 text-[#E31E24]' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role === UserRole.ADMIN ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    {users.length > 1 && (
                      <button 
                        onClick={() => onRemoveUser(u.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
