import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatCard from './components/StatCard';
import TransactionForm from './components/TransactionForm';
import ConfirmModal from './components/ConfirmModal';
import ExportModal from './components/ExportModal';
import LoginPage from './components/LoginPage';
import AdminPage from './components/AdminPage';
import ReportPage from './components/ReportPage';
import TransactionFilters, { FilterState } from './components/TransactionFilters';
import { Transaction, TransactionType, DashboardStats, User, UserRole } from './types';
import { MOCK_TRANSACTIONS, SQL_SNIPPET, PARTICULARS, INITIAL_USERS, CURRENCY, NAMES, LOGO_SVG } from './constants';
import { getSupabaseClient, TABLES, isSupabaseConfigured, saveCloudCredentials, clearCloudCredentials } from './services/supabaseClient';
import { History, Download, SearchX, Plus, ChevronRight, Inbox, Smartphone, X, AlertCircle, ExternalLink, RefreshCw, WifiOff, CloudOff, Info, Settings, Database, CheckCircle2, Filter } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'sr_fintrack_local_data';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [view, setView] = useState<'dashboard' | 'statement' | 'reports' | 'sql' | 'admin'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorBanner, setShowErrorBanner] = useState(true);
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);

  const [cloudUrl, setCloudUrl] = useState(localStorage.getItem('sr_supabase_url') || '');
  const [cloudKey, setCloudKey] = useState(localStorage.getItem('sr_supabase_key') || '');
  const [driveAccount, setDriveAccount] = useState(localStorage.getItem('sr_drive_account') || 'connectcloudonetech@gmail.com');
  
  const [availableNames, setAvailableNames] = useState<string[]>(NAMES);
  const [availableParticulars, setAvailableParticulars] = useState<string[]>(PARTICULARS);

  const [filters, setFilters] = useState<FilterState>({
    period: 'All',
    startDate: '',
    endDate: '',
    category: 'All',
    type: 'All',
    name: 'All',
    search: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch (e) {
        setTransactions(MOCK_TRANSACTIONS);
      }
    } else {
      setTransactions(MOCK_TRANSACTIONS);
    }
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions]);

  const fetchTransactions = async () => {
    const configured = isSupabaseConfigured();
    if (!configured) {
      setIsDbConnected(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const client = getSupabaseClient();
      const { data, error: fetchError } = await client
        .from(TABLES.TRANSACTIONS)
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) {
        if (fetchError.message.includes('relation "public.transactions" does not exist')) {
          throw new Error("The 'transactions' table is missing. Go to Dev Console to initialize it.");
        }
        if (fetchError.message.includes('column transactions.date does not exist')) {
          throw new Error("Schema Mismatch: Column 'date' is missing in your Supabase table. Please run the setup SQL.");
        }
        throw fetchError;
      }

      setTransactions(data || []);
      setIsDbConnected(true);
      setError(null);
      
      const uniqueNames = Array.from(new Set((data || []).map((t: any) => t.name))).sort() as string[];
      const uniqueParts = Array.from(new Set((data || []).map((t: any) => t.particular))).sort() as string[];
      setAvailableNames(uniqueNames.length ? uniqueNames : NAMES);
      setAvailableParticulars(uniqueParts.length ? uniqueParts : PARTICULARS);
    } catch (err: any) {
      console.error("Supabase fetch error:", err);
      setIsDbConnected(false);
      setError(err.message || "Cloud Sync Unavailable. Please verify your Supabase project status.");
      setShowErrorBanner(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchTransactions();

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      const channel = client
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: TABLES.TRANSACTIONS },
          () => fetchTransactions()
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, [currentUser]);

  const handleCloudSetup = (e: React.FormEvent) => {
    e.preventDefault();
    saveCloudCredentials(cloudUrl, cloudKey);
    localStorage.setItem('sr_drive_account', driveAccount);
    setShowCloudModal(false);
    fetchTransactions();
  };

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        const { data } = await client
          .from(TABLES.USERS)
          .select('*')
          .eq('username', username)
          .single();
        
        if (data && data.password === password) {
          setCurrentUser(data as User);
          return true;
        }
      } catch (err) {
        console.warn("Auth sync failed, checking local...");
      }
    }
    
    const localUser = allUsers.find(u => u.username === username && u.password === password);
    if (localUser) {
      setCurrentUser(localUser);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('dashboard');
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = filters.type === 'All' || t.type === filters.type;
      const matchesCategory = filters.category === 'All' || t.particular === filters.category;
      const matchesName = filters.name === 'All' || t.name === filters.name;
      const matchesStart = !filters.startDate || t.date >= filters.startDate;
      const matchesEnd = !filters.endDate || t.date <= filters.endDate;
      
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        t.name.toLowerCase().includes(searchLower) || 
        t.particular.toLowerCase().includes(searchLower) || 
        (t.description && t.description.toLowerCase().includes(searchLower));

      return matchesType && matchesCategory && matchesName && matchesStart && matchesEnd && matchesSearch;
    });
  }, [transactions, filters]);

  const stats: DashboardStats = useMemo(() => {
    const totalIn = filteredTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalOut = filteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyMap: Record<string, { income: number, expense: number }> = {};
    transactions.forEach(t => {
      const monthYear = t.date.substring(0, 7);
      if (!monthlyMap[monthYear]) monthlyMap[monthYear] = { income: 0, expense: 0 };
      if (t.type === TransactionType.INCOME) monthlyMap[monthYear].income += t.amount;
      else monthlyMap[monthYear].expense += t.amount;
    });

    const monthlyData = Object.entries(monthlyMap)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { totalIn, totalOut, balance: totalIn - totalOut, monthlyData };
  }, [filteredTransactions, transactions]);

  const handleAddTransaction = async (newT: Omit<Transaction, 'id'>) => {
    const localT = { ...newT, id: Math.random().toString(36).substr(2, 9) } as Transaction;
    setTransactions([localT, ...transactions]);
    setShowAddForm(false);

    if (isDbConnected && isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        await client.from(TABLES.TRANSACTIONS).insert([newT]);
      } catch (err) {
        console.error("Supabase Sync Error:", err);
      }
    }
  };

  const handleUpdateTransaction = async (updatedT: Transaction) => {
    setTransactions(transactions.map(t => t.id === updatedT.id ? updatedT : t));
    setEditingTransaction(null);
    setShowAddForm(false);

    if (isDbConnected && isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        const { id, ...data } = updatedT;
        await client.from(TABLES.TRANSACTIONS).update(data).eq('id', id);
      } catch (err) {
        console.error("Supabase Sync Error:", err);
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    setDeleteConfirmId(null);
    setShowAddForm(false);

    if (isDbConnected && isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        await client.from(TABLES.TRANSACTIONS).delete().eq('id', id);
      } catch (err) {
        console.error("Supabase Sync Error:", err);
      }
    }
  };

  const handleEditRequest = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setFilters({ period: 'All', startDate: '', endDate: '', category: 'All', type: 'All', name: 'All', search: '' });
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 md:pb-10 md:pl-20">
      <Navbar onNavChange={setView} activeView={view} currentUser={currentUser} onLogout={handleLogout} />

      <button 
        onClick={() => setShowCloudModal(true)}
        className="fixed top-20 right-4 z-[55] flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur border border-slate-100 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 group"
      >
        {isDbConnected ? (
          <>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest group-hover:text-[#E31E24]">Cloud Sync On</span>
          </>
        ) : (
          <>
            <WifiOff size={12} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest group-hover:text-[#E31E24]">Cloud Offline</span>
          </>
        )}
      </button>

      <main className="max-w-6xl mx-auto px-4 pt-24">
        {view === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {!isDbConnected && showErrorBanner && (
              <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 shadow-sm flex items-start gap-4 animate-in slide-in-from-top-2">
                <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
                  <Database size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-amber-900 font-bold text-sm">Action Required: Setup Needed</h3>
                  <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                    {error || "We couldn't reach the cloud database. Your changes will be saved to this browser and synced when the connection is restored."}
                  </p>
                  {(error?.includes('Missing') || error?.includes('date')) && (
                    <button onClick={() => setView('sql')} className="mt-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#E31E24] hover:underline bg-white px-3 py-1 rounded-full shadow-sm border border-red-100">
                      <Settings size={12} />
                      Fix Table Schema Now
                    </button>
                  )}
                </div>
                <button onClick={() => setShowErrorBanner(false)} className="p-2 hover:bg-amber-100 rounded-xl transition-colors">
                  <X size={16} className="text-amber-400" />
                </button>
              </div>
            )}

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-[#E31E24] font-bold text-xs uppercase tracking-[0.2em] mb-1">Financial Intelligence</p>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">SR INFOTECH ACCOUNTS</h1>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={fetchTransactions}
                  className={`flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold transition-all shadow-sm ${!isSupabaseConfigured() ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-slate-50'}`}
                  disabled={!isSupabaseConfigured()}
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </header>

            {/* Dashboard Filter Section */}
            <div className="bg-white/50 p-6 rounded-[2.5rem] border border-slate-100/50 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                <Filter size={14} className="text-[#E31E24]" />
                Intelligence Filters
              </div>
              <TransactionFilters 
                filters={filters} 
                onFilterChange={setFilters} 
                onReset={resetFilters} 
                names={availableNames} 
                particulars={availableParticulars} 
                hideSearch={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title={`Cash In (${filters.period})`} amount={stats.totalIn} type="income" />
              <StatCard title={`Cash Out (${filters.period})`} amount={stats.totalOut} type="expense" />
              <StatCard title={`Net Result (${filters.period})`} amount={stats.balance} type="total" />
            </div>

            <div className="flex items-center justify-between mt-12">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <History size={24} className="text-[#E31E24]" />
                Recent History
              </h2>
              {transactions.length > 0 && (
                <button onClick={() => setView('statement')} className="text-slate-500 font-bold text-xs hover:text-[#E31E24] transition-colors flex items-center gap-1">
                  Statement Ledger <ChevronRight size={14} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {isLoading && transactions.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-white rounded-[2rem] border border-slate-100 shimmer" />)
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.slice(0, 8).map((t) => (
                  <div key={t.id} onClick={() => handleEditRequest(t)} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group active:scale-[0.99]">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${t.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 group-hover:text-[#E31E24] transition-colors">{t.name}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.particular} • {t.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-xl ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {CURRENCY}{t.amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-[3rem] p-16 text-center border border-dashed border-slate-200">
                  <div className="inline-flex items-center justify-center p-6 bg-slate-50 rounded-full text-slate-200 mb-6"><Inbox size={48} /></div>
                  <h3 className="text-slate-900 font-black text-lg">Empty Ledger</h3>
                  <p className="text-slate-400 font-bold text-sm max-w-xs mx-auto mt-2">Start tracking SR INFOTECH finances by adding your first entry.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'statement' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex items-end justify-between">
              <div>
                <p className="text-[#E31E24] font-bold text-xs uppercase tracking-[0.2em] mb-1">Accounting</p>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Statement Ledger</h1>
              </div>
              <button onClick={() => setIsExportModalOpen(true)} disabled={transactions.length === 0} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-900 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-30">
                <Download size={24} />
              </button>
            </header>

            <TransactionFilters 
              filters={filters} 
              onFilterChange={setFilters} 
              onReset={resetFilters} 
              names={availableNames} 
              particulars={availableParticulars} 
              hideSearch={true}
            />

            <div className="space-y-4 pb-20">
              {isLoading && transactions.length === 0 ? (
                Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 bg-white rounded-[2rem] border border-slate-100 shimmer" />)
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <div key={t.id} onClick={() => handleEditRequest(t)} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group active:scale-[0.99]">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${t.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {t.particular.charAt(0) || 'T'}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 group-hover:text-[#E31E24] transition-colors">{t.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.particular} • {t.date}</p>
                      </div>
                    </div>
                    <div className="text-right mt-4 sm:mt-0">
                      <p className={`font-black text-2xl ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'}{CURRENCY}{t.amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center">
                  <SearchX size={64} className="mx-auto text-slate-200 mb-6" />
                  <h3 className="text-xl font-black text-slate-900">No results found</h3>
                  <p className="text-slate-400 font-bold text-sm mt-2">Adjust your search or filters to locate specific entries.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'reports' && (
          <ReportPage transactions={transactions} />
        )}

        {view === 'admin' && (
          <AdminPage 
            users={allUsers} 
            onAddUser={(u) => setAllUsers([...allUsers, { ...u, id: Math.random().toString(36).substr(2, 9) }])} 
            onRemoveUser={(id) => setAllUsers(allUsers.filter(u => u.id !== id))} 
          />
        )}

        {view === 'sql' && (
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Database className="text-[#E31E24]" size={32} />
              <h1 className="text-3xl font-black">Developer Console</h1>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-slate-300 mb-2 flex items-center gap-2">
                <Info size={16} /> Database Setup Script
              </h3>
              <p className="text-xs text-slate-400 mb-4">Run this in your Supabase SQL Editor to ensure the schema is up to date.</p>
              <pre className="bg-black/50 p-6 rounded-2xl overflow-x-auto text-xs font-mono text-emerald-400 no-scrollbar">
                {SQL_SNIPPET}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Modals & Overlays */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setShowAddForm(false); setEditingTransaction(null); }} />
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
            <TransactionForm 
              onAdd={handleAddTransaction} 
              onUpdate={handleUpdateTransaction} 
              onDelete={(id) => setDeleteConfirmId(id)}
              editingTransaction={editingTransaction}
              onCancelEdit={() => { setShowAddForm(false); setEditingTransaction(null); }}
              availableNames={availableNames}
              availableParticulars={availableParticulars}
            />
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deleteConfirmId} 
        onClose={() => setDeleteConfirmId(null)} 
        onConfirm={() => deleteConfirmId && handleDeleteTransaction(deleteConfirmId)} 
        title="Delete Transaction?" 
        message="This action cannot be undone. The entry will be permanently removed from the ledger." 
      />

      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        transactions={filteredTransactions} 
        driveAccount={driveAccount} 
      />

      {showCloudModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCloudModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CloudOff className="text-[#E31E24]" size={24} />
                <h2 className="text-2xl font-black text-slate-900">Cloud Sync</h2>
              </div>
              <button onClick={() => setShowCloudModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <form onSubmit={handleCloudSetup} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Supabase Project URL</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24] font-mono text-xs"
                  value={cloudUrl}
                  onChange={e => setCloudUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Anon API Key</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24] font-mono text-xs"
                  value={cloudKey}
                  onChange={e => setCloudKey(e.target.value)}
                  placeholder="eyJhbG..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Organization Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-xs"
                  value={driveAccount}
                  onChange={e => setDriveAccount(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs mt-4">Save Configuration</button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Add Button */}
      {!showAddForm && (
        <button 
          onClick={() => { setEditingTransaction(null); setShowAddForm(true); }}
          className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-[55] w-16 h-16 bg-[#E31E24] text-white rounded-full shadow-2xl shadow-red-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
        >
          <Plus size={32} className="group-hover:rotate-90 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default App;