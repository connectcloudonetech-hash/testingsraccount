import React, { useState, useEffect, useRef } from 'react';
import { Transaction, TransactionType } from '../types';
import { CURRENCY } from '../constants';
import { 
  Sparkles, Loader2, Save, Trash2, Calendar, User, Tag, 
  MessageSquare, Wand2, X, ChevronDown, Check, Search,
  ShoppingCart, Briefcase, Utensils, Zap, Car, Home, Plus,
  ArrowDownCircle, ArrowUpCircle
} from 'lucide-react';
import { suggestCategory } from '../services/geminiService';

interface TransactionFormProps {
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  onUpdate: (t: Transaction) => void;
  onDelete: (id: string) => void;
  editingTransaction?: Transaction | null;
  onCancelEdit: () => void;
  availableNames: string[];
  availableParticulars: string[];
}

const PRESET_CATEGORIES = [
  { name: 'CARRY IN', icon: <ArrowDownCircle size={14} />, defaultType: TransactionType.INCOME },
  { name: 'CARRY OUT', icon: <ArrowUpCircle size={14} />, defaultType: TransactionType.EXPENSE },
  { name: 'Inventory', icon: <ShoppingCart size={14} /> },
  { name: 'Salary', icon: <Briefcase size={14} /> },
  { name: 'Food/Meals', icon: <Utensils size={14} /> },
  { name: 'Electricity', icon: <Zap size={14} /> },
  { name: 'Transport', icon: <Car size={14} /> },
  { name: 'Rent', icon: <Home size={14} /> },
  { name: 'Miscellaneous', icon: <Plus size={14} /> },
];

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onAdd, 
  onUpdate, 
  onDelete, 
  editingTransaction, 
  onCancelEdit,
  availableNames,
  availableParticulars
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState('');
  const [particular, setParticular] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingTransaction) {
      setDate(editingTransaction.date);
      setName(editingTransaction.name);
      setParticular(editingTransaction.particular);
      setDescription(editingTransaction.description || '');
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
    }
  }, [editingTransaction]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCategory = (cat: string) => {
    setParticular(cat);
    setIsDropdownOpen(false);
    setSearchTerm('');
    
    // Auto-toggle type if the category has a fixed default
    const preset = PRESET_CATEGORIES.find(p => p.name === cat);
    if (preset?.defaultType) {
      setType(preset.defaultType);
    }
  };

  const handleSuggest = async () => {
    if (!description.trim() || description.length < 3) return;
    setIsCategorizing(true);
    try {
      const suggestion = await suggestCategory(description, [...new Set([...availableParticulars, ...PRESET_CATEGORIES.map(c => c.name)])]);
      setSuggestedCategory(suggestion);
    } catch (err) {
      console.error("AI suggestion failed", err);
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !particular || !amount) return;

    const transactionData = {
      name,
      particular,
      description,
      amount: parseFloat(amount),
      type,
      category: particular,
      date
    };

    if (editingTransaction) {
      onUpdate({ ...transactionData, id: editingTransaction.id });
    } else {
      onAdd(transactionData);
    }
  };

  const allCategories = Array.from(new Set([...PRESET_CATEGORIES.map(c => c.name), ...availableParticulars]));
  const filteredCategories = allCategories.filter(cat => 
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
          {editingTransaction ? 'Edit Entry' : 'New Transaction'}
        </h2>
        <button type="button" onClick={onCancelEdit} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Type Selector Toggle */}
      <div className="relative p-1.5 bg-slate-100 rounded-[1.5rem] flex items-center">
        <div 
          className={`absolute h-[calc(100%-12px)] w-[calc(50%-6px)] bg-white rounded-[1.1rem] shadow-sm transition-all duration-300 ease-out ${
            type === TransactionType.INCOME ? 'translate-x-full' : 'translate-x-0'
          }`}
        />
        <button
          type="button"
          onClick={() => setType(TransactionType.EXPENSE)}
          className={`relative z-10 flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors ${
            type === TransactionType.EXPENSE ? 'text-rose-600' : 'text-slate-400'
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType(TransactionType.INCOME)}
          className={`relative z-10 flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors ${
            type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          Income
        </button>
      </div>

      {/* Main Form Fields */}
      <div className="space-y-5">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="date"
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#E31E24] text-sm font-bold text-slate-900 transition-all"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Paid To / Received From</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              list="names-list"
              type="text"
              placeholder="e.g. SR Vendor, Client Name"
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#E31E24] text-sm font-bold text-slate-900 transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <datalist id="names-list">
              {availableNames.map(n => <option key={n} value={n} />)}
            </datalist>
          </div>
        </div>

        {/* Improved Category Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Category</label>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full flex items-center justify-between pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl cursor-pointer transition-all ${isDropdownOpen ? 'ring-2 ring-[#E31E24]' : ''}`}
          >
            <Tag className="absolute left-4 top-[54px] text-slate-300" size={16} />
            <span className={`text-sm font-bold ${particular ? 'text-slate-900' : 'text-slate-300'}`}>
              {particular || 'Select a category...'}
            </span>
            <ChevronDown size={18} className={`text-slate-300 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {isDropdownOpen && (
            <div className="absolute z-[110] left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
                <Search size={14} className="text-slate-400" />
                <input 
                  type="text" 
                  autoFocus
                  className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 w-full placeholder:text-slate-400"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="max-h-60 overflow-y-auto no-scrollbar py-2">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${particular === cat ? 'bg-red-50 text-[#E31E24]' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 transition-colors'}`}>
                          {PRESET_CATEGORIES.find(p => p.name === cat)?.icon || <Tag size={14} />}
                        </div>
                        <span className={`text-sm ${particular === cat ? 'font-black text-slate-900' : 'font-bold text-slate-500'}`}>{cat}</span>
                      </div>
                      {particular === cat && <Check size={16} className="text-[#E31E24]" />}
                    </button>
                  ))
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectCategory(searchTerm)}
                    className="w-full flex items-center gap-2 px-5 py-3.5 hover:bg-slate-50 text-[#E31E24] transition-colors"
                  >
                    <Plus size={16} />
                    <span className="text-sm font-black">Add "{searchTerm}"</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Amount Field */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Amount</label>
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">
              {CURRENCY}
            </div>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full pl-14 pr-4 py-6 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-red-100 text-4xl font-black text-slate-900 transition-all placeholder:text-slate-200"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Description (Optional)</label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 text-slate-300" size={16} />
            <textarea
              placeholder="What was this for? (AI can suggest category from this)"
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#E31E24] text-sm font-bold min-h-[100px] text-slate-900 transition-all"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSuggest}
            />
            {isCategorizing && (
              <div className="absolute right-4 top-4">
                <Loader2 size={16} className="text-[#E31E24] animate-spin" />
              </div>
            )}
          </div>
        </div>

        {suggestedCategory && suggestedCategory !== particular && (
          <button
            type="button"
            onClick={() => handleSelectCategory(suggestedCategory!)}
            className="w-full flex items-center justify-between px-5 py-4 bg-[#E31E24]/5 text-[#E31E24] rounded-2xl text-[11px] font-black uppercase tracking-widest border border-red-100 animate-in slide-in-from-top-1"
          >
            <div className="flex items-center gap-3">
              <div className="bg-[#E31E24] text-white p-1.5 rounded-lg">
                <Sparkles size={14} />
              </div>
              <span>AI Recommends: {suggestedCategory}</span>
            </div>
            <Wand2 size={16} />
          </button>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        {editingTransaction && (
          <button
            type="button"
            onClick={() => onDelete(editingTransaction.id)}
            className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
          </button>
        )}
        <button
          type="submit"
          className="flex-[3] py-5 bg-[#E31E24] text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-200/50 flex items-center justify-center gap-2 active:scale-95 group"
        >
          {editingTransaction ? <Save size={20} /> : <Plus size={20} />}
          {editingTransaction ? 'Update Entry' : 'Add to Ledger'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;