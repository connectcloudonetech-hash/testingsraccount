
import { Transaction } from '../types';

export const downloadTransactionsAsCSV = (transactions: Transaction[]) => {
  if (transactions.length === 0) return;

  const headers = ['Date', 'Name', 'Particular', 'Category', 'Type', 'Amount'];
  const rows = transactions.map(t => [
    t.date,
    `"${(t.name || '').replace(/"/g, '""')}"`,
    `"${t.particular.replace(/"/g, '""')}"`,
    t.category,
    t.type,
    t.amount.toFixed(2)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `SR_INFOTECH_Statement_${timestamp}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
