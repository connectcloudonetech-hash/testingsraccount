
import React from 'react';
import { ArrowUpRight, ArrowDownRight, IndianRupee, LayoutGrid } from 'lucide-react';
import { CURRENCY } from '../constants';

interface StatCardProps {
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'total';
}

const StatCard: React.FC<StatCardProps> = ({ title, amount, type }) => {
  const isIncome = type === 'income';
  const isExpense = type === 'expense';

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-slate-200/50 group active:scale-[0.98]">
      <div className="flex items-center justify-between mb-8">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
          isIncome ? 'bg-emerald-50 text-emerald-600' : 
          isExpense ? 'bg-rose-50 text-rose-600' : 'bg-red-50 text-[#E31E24]'
        }`}>
          {isIncome ? <ArrowUpRight size={24} /> : isExpense ? <ArrowDownRight size={24} /> : <IndianRupee size={24} />}
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
          isIncome ? 'bg-emerald-100/50 text-emerald-600' : 
          isExpense ? 'bg-rose-100/50 text-rose-600' : 'bg-red-100/50 text-[#E31E24]'
        }`}>
          {type === 'total' ? 'Balance' : type}
        </div>
      </div>
      
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-tight mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-slate-400 font-bold text-lg">{CURRENCY}</span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            <span className="text-slate-300 text-sm ml-1">.{(amount % 1).toFixed(2).split('.')[1]}</span>
          </h3>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
