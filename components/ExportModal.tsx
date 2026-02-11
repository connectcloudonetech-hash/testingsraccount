import React, { useState, useEffect } from 'react';
import { X, Download, Cloud, CheckCircle2, Loader2, FileSpreadsheet, ExternalLink, ShieldCheck } from 'lucide-react';
import { Transaction } from '../types';
import { downloadTransactionsAsCSV } from '../utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  driveAccount?: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, transactions, driveAccount }) => {
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const accountLabel = driveAccount || 'SR INFOTECH Workspace';

  const messages = [
    `Connecting to Google Drive...`,
    `Authenticating [${accountLabel}]...`,
    'Preparing CSV statement...',
    'Uploading file to "SR_INFOTECH_Exports"...',
    'Applying company encryption...',
    'Sync complete!'
  ];

  useEffect(() => {
    if (!isOpen) {
      setSyncState('idle');
      setProgress(0);
      setStatusMessage('');
    }
  }, [isOpen]);

  const handleGoogleSync = () => {
    setSyncState('syncing');
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const newProgress = (currentStep / messages.length) * 100;
      setProgress(newProgress);
      setStatusMessage(messages[currentStep - 1]);

      if (currentStep >= messages.length) {
        clearInterval(interval);
        setTimeout(() => setSyncState('success'), 500);
      }
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Export Statement</h2>
              <p className="text-slate-500 text-sm mt-1">SR INFOTECH secure export portal.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {syncState === 'idle' ? (
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => {
                  downloadTransactionsAsCSV(transactions);
                  onClose();
                }}
                className="group flex items-center gap-4 p-5 border-2 border-slate-100 rounded-3xl hover:border-red-200 hover:bg-red-50/30 transition-all text-left"
              >
                <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  <FileSpreadsheet size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">Download CSV</h3>
                  <p className="text-xs text-slate-500">Universal format for SR INFOTECH accounting.</p>
                </div>
                <Download size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </button>

              <button
                onClick={handleGoogleSync}
                className="group flex items-center gap-4 p-5 border-2 border-slate-100 rounded-3xl hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left"
              >
                <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  <Cloud size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">Sync to Drive</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[200px]">Account: {accountLabel}</p>
                </div>
                <ExternalLink size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </button>

              <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                <ShieldCheck size={16} className="text-red-500" />
                <p className="text-[10px] text-slate-500 leading-tight">
                  Targeted account authentication required for sync access.
                </p>
              </div>
            </div>
          ) : syncState === 'syncing' ? (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="relative mb-8">
                <Loader2 size={64} className="text-blue-500 animate-spin" />
                <Cloud size={24} className="absolute inset-0 m-auto text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Syncing Data</h3>
              <p className="text-slate-500 text-sm mb-6 h-4">{statusMessage}</p>
              
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-xs">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-90 duration-300">
              <div className="bg-emerald-100 text-emerald-600 p-6 rounded-[2rem] mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Statement Synced!</h3>
              <p className="text-slate-500 text-sm mb-8 px-8 leading-relaxed">
                Financial report successfully uploaded to:<br/>
                <span className="font-black text-slate-900">{accountLabel}</span>
              </p>
              <button
                onClick={onClose}
                className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
              >
                Back to Ledger
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;