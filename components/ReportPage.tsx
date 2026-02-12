import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { CURRENCY, LOGO_URL } from '../constants';
import { 
  FileText, Calendar, Download, ChevronDown, PieChart, 
  ArrowUpRight, ArrowDownRight, Wallet, Printer, 
  FileCheck, Clock, User, Tag, CalendarDays
} from 'lucide-react';
import { generateFinancialPDF } from '../utils/pdfExportUtils';

interface ReportPageProps {
  transactions: Transaction[];
}

type ReportType = 'monthly' | 'quarterly' | 'annual' | 'customer' | 'category' | 'custom';

const ReportPage: React.FC<ReportPageProps> = ({ transactions }) => {
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);

  const years = useMemo(() => {
    const yearsSet = new Set<number>(transactions.map(t => new Date(t.date).getFullYear()));
    yearsSet.add(new Date().getFullYear());
    return Array.from(yearsSet).sort((a: number, b: number) => b - a);
  }, [transactions]);

  const uniqueCustomers = useMemo(() => {
    const names = Array.from(new Set(transactions.map(t => t.name))).sort();
    if (names.length > 0 && !selectedCustomer) setSelectedCustomer(names[0]);
    return names;
  }, [transactions]);

  const uniqueCategories = useMemo(() => {
    const particulars = Array.from(new Set(transactions.map(t => t.particular))).sort();
    if (particulars.length > 0 && !selectedCategory) setSelectedCategory(particulars[0]);
    return particulars;
  }, [transactions]);

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      if (reportType === 'customer') {
        return t.name === selectedCustomer;
      }

      if (reportType === 'category') {
        return t.particular === selectedCategory;
      }

      if (reportType === 'custom') {
        return t.date >= customStartDate && t.date <= customEndDate;
      }

      const date = new Date(t.date);
      const yearMatches = date.getFullYear() === selectedYear;
      
      if (!yearMatches) return false;

      if (reportType === 'monthly') {
        return date.getMonth() === selectedMonth;
      } else if (reportType === 'quarterly') {
        const q = Math.floor(date.getMonth() / 3) + 1;
        return q === selectedQuarter;
      } else {
        return true; // Annual just matches year
      }
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, reportType, selectedYear, selectedMonth, selectedQuarter, selectedCustomer, selectedCategory, customStartDate, customEndDate]);

  const stats = useMemo(() => {
    const income = filteredData.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    const expense = filteredData.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filteredData]);

  const handlePDFExport = () => {
    let period = '';
    let title = 'Financial Intelligence Portal';
    
    if (reportType === 'monthly') {
      period = `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(selectedYear, selectedMonth))} ${selectedYear}`;
    } else if (reportType === 'quarterly') {
      period = `Q${selectedQuarter} ${selectedYear}`;
    } else if (reportType === 'annual') {
      period = `Annual Report ${selectedYear}`;
    } else if (reportType === 'customer') {
      period = `Customer: ${selectedCustomer}`;
      title = 'Customer Specific Ledger';
    } else if (reportType === 'category') {
      period = `Category: ${selectedCategory}`;
      title = 'Category Distribution Report';
    } else if (reportType === 'custom') {
      period = `Range: ${customStartDate} to ${customEndDate}`;
    }

    generateFinancialPDF(filteredData, { title, period, stats });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[#E31E24] font-bold text-xs uppercase tracking-[0.2em] mb-1">Financial Analysis</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Financial Reports</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-x-auto no-scrollbar max-w-[90vw] md:max-w-none">
            {(['monthly', 'quarterly', 'annual', 'customer', 'category', 'custom'] as ReportType[]).map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${
                  reportType === type ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button 
            onClick={handlePDFExport}
            className="flex items-center gap-2 px-6 py-3 bg-[#E31E24] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-100 hover:bg-red-700 active:scale-95 transition-all"
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </header>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        
        {reportType !== 'customer' && reportType !== 'category' && reportType !== 'custom' && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reporting Year</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border-none rounded-2xl appearance-none outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 text-sm"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
            </div>
          </div>
        )}

        {reportType === 'monthly' && (
          <div className="space-y-2 animate-in zoom-in-95">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Specific Month</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border-none rounded-2xl appearance-none outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 text-sm"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>{new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2000, i, 1))}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
            </div>
          </div>
        )}

        {reportType === 'quarterly' && (
          <div className="space-y-2 animate-in zoom-in-95">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fiscal Quarter</label>
            <div className="relative">
              <PieChart className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <select 
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border-none rounded-2xl appearance-none outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 text-sm"
              >
                <option value={1}>Q1 (Jan - Mar)</option>
                <option value={2}>Q2 (Apr - Jun)</option>
                <option value={3}>Q3 (Jul - Sep)</option>
                <option value={4}>Q4 (Oct - Dec)</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
            </div>
          </div>
        )}

        {reportType === 'customer' && (
          <div className="space-y-2 animate-in zoom-in-95 col-span-1 md:col-span-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Customer / Entity</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <select 
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border-none rounded-2xl appearance-none outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 text-sm"
              >
                {uniqueCustomers.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
            </div>
          </div>
        )}

        {reportType === 'category' && (
          <div className="space-y-2 animate-in zoom-in-95 col-span-1 md:col-span-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Category</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border-none rounded-2xl appearance-none outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 text-sm"
              >
                {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
            </div>
          </div>
        )}

        {reportType === 'custom' && (
          <>
            <div className="space-y-2 animate-in zoom-in-95">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 text-sm"
                />
              </div>
            </div>
            <div className="space-y-2 animate-in zoom-in-95">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">End Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 text-sm"
                />
              </div>
            </div>
            <div className="hidden md:block"></div> {/* Spacer for grid consistency */}
          </>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
            <ArrowUpRight size={28} />
          </div>
          <div>
            <p className="text-emerald-700/60 font-black text-[10px] uppercase tracking-widest mb-1">Period Cash In</p>
            <h3 className="text-3xl font-black text-emerald-900">{CURRENCY}{stats.income.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-rose-50 rounded-[2.5rem] p-8 border border-rose-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-rose-600 shadow-sm">
            <ArrowDownRight size={28} />
          </div>
          <div>
            <p className="text-rose-700/60 font-black text-[10px] uppercase tracking-widest mb-1">Period Cash Out</p>
            <h3 className="text-3xl font-black text-rose-900">{CURRENCY}{stats.expense.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 flex items-center gap-6">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white shadow-sm">
            <Wallet size={28} />
          </div>
          <div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Net Flow</p>
            <h3 className="text-3xl font-black text-white">{CURRENCY}{stats.balance.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <FileCheck className="text-[#E31E24]" size={20} />
            <h2 className="text-lg font-black text-slate-900">Statement Preview</h2>
          </div>
          <p className="text-slate-400 text-xs font-bold">{filteredData.length} entries found</p>
        </div>
        
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-white text-slate-400 uppercase text-[9px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4">Entity Name</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length > 0 ? (
                filteredData.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">{t.date}</td>
                    <td className="px-8 py-4 text-sm font-black text-slate-900">{t.name}</td>
                    <td className="px-8 py-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-1 bg-slate-100 rounded-lg">{t.particular}</span>
                    </td>
                    <td className={`px-8 py-4 text-right text-sm font-black ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'}{CURRENCY}{t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Printer className="mx-auto text-slate-100 mb-4" size={48} />
                    <p className="text-slate-400 font-bold text-sm">No transaction records found for this period.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
