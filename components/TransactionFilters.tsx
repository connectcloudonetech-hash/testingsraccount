import React from 'react';
import { TransactionType } from '../types';
import { Filter, Search, X } from 'lucide-react';

export interface FilterState {
  startDate: string;
  endDate: string;
  category: string;
  type: string;
  name: string;
  search: string;
}

interface TransactionFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  names: string[];
  particulars: string[];
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ 
  filters, 
  onFilterChange, 
  onReset,
  names,
  particulars
}) => {
  const hasActiveFilters = 
    filters.startDate || 
    filters.endDate || 
    filters.category !== 'All' || 
    filters.type !== 'All' || 
    filters.name !== 'All' ||
    filters.search !== '';

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#E31E24] transition-colors" size={18} />
        <input
          type="text"
          placeholder="Search by name, category or description..."
          className="w-full pl-12 pr-10 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold text-slate-900 text-sm shadow-sm placeholder-slate-300"
          value={filters.search}
          onChange={(e) => onFilterChange({...filters, search: e.target.value})}
        />
        {filters.search && (
          <button 
            onClick={() => onFilterChange({...filters, search: ''})}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        <button 
          onClick={onReset}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
            !hasActiveFilters ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <Filter size={12} />
          Reset
        </button>
        
        <select 
          value={filters.type}
          onChange={(e) => onFilterChange({...filters, type: e.target.value})}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border-none appearance-none cursor-pointer transition-all ${
            filters.type !== 'All' ? 'bg-red-50 text-[#E31E24] ring-1 ring-red-100' : 'bg-white text-slate-500 ring-1 ring-slate-100'
          }`}
        >
          <option value="All">All Types</option>
          <option value={TransactionType.INCOME}>Cash In</option>
          <option value={TransactionType.EXPENSE}>Cash Out</option>
        </select>

        <select 
          value={filters.name}
          onChange={(e) => onFilterChange({...filters, name: e.target.value})}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border-none appearance-none cursor-pointer transition-all ${
            filters.name !== 'All' ? 'bg-red-50 text-[#E31E24] ring-1 ring-red-100' : 'bg-white text-slate-500 ring-1 ring-slate-100'
          }`}
        >
          <option value="All">All Entities</option>
          {names.map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        <select 
          value={filters.category}
          onChange={(e) => onFilterChange({...filters, category: e.target.value})}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border-none appearance-none cursor-pointer transition-all ${
            filters.category !== 'All' ? 'bg-red-50 text-[#E31E24] ring-1 ring-red-100' : 'bg-white text-slate-500 ring-1 ring-slate-100'
          }`}
        >
          <option value="All">All Categories</option>
          {particulars.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <input
            type="date"
            className="w-full bg-white px-4 py-3 rounded-2xl text-[10px] font-bold text-slate-500 ring-1 ring-slate-100 border-none outline-none focus:ring-2 focus:ring-red-100 transition-all"
            value={filters.startDate}
            onChange={(e) => onFilterChange({...filters, startDate: e.target.value})}
          />
        </div>
        <div className="relative">
          <input
            type="date"
            className="w-full bg-white px-4 py-3 rounded-2xl text-[10px] font-bold text-slate-500 ring-1 ring-slate-100 border-none outline-none focus:ring-2 focus:ring-red-100 transition-all"
            value={filters.endDate}
            onChange={(e) => onFilterChange({...filters, endDate: e.target.value})}
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;