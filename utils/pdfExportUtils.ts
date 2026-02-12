import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, TransactionType } from '../types';

interface PDFExportOptions {
  title: string;
  period: string;
  stats: {
    income: number;
    expense: number;
    balance: number;
  };
}

export const generateFinancialPDF = (transactions: Transaction[], options: PDFExportOptions) => {
  const doc = new jsPDF();
  const { title, period, stats } = options;

  // Header Branding
  doc.setFillColor(227, 30, 36); // SR Red
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SR INFOTECH', 15, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(title.toUpperCase(), 15, 32);
  
  // Enhanced Scope Information in Header
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTING PERIOD', 195, 20, { align: 'right' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(period.toUpperCase(), 195, 28, { align: 'right' });
  
  doc.setFontSize(7);
  doc.text(`${transactions.length} TOTAL RECORDS ANALYZED`, 195, 33, { align: 'right' });

  // Summary Section
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Overview', 15, 55);

  doc.setDrawColor(241, 245, 249);
  doc.line(15, 58, 195, 58);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('Total Cash In:', 15, 70);
  doc.text('Total Cash Out:', 80, 70);
  doc.text('Net Balance:', 145, 70);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Emerald 500
  // Removed currency icon
  doc.text(`${stats.income.toLocaleString()}`, 15, 80);
  
  doc.setTextColor(227, 30, 36); // SR Red
  doc.text(`${stats.expense.toLocaleString()}`, 80, 80);
  
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(`${stats.balance.toLocaleString()}`, 145, 80);

  // Table with separate Cash In and Cash Out columns
  const tableData = transactions.map(t => [
    t.date,
    t.name,
    t.particular,
    t.type === TransactionType.INCOME ? t.amount.toLocaleString() : '-',
    t.type === TransactionType.EXPENSE ? t.amount.toLocaleString() : '-'
  ]);

  autoTable(doc, {
    startY: 95,
    head: [['Date', 'Entity Name', 'Category', 'Cash In', 'Cash Out']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [227, 30, 36], 
      textColor: [255, 255, 255], 
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 'auto' },
      3: { halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] },
      4: { halign: 'right', fontStyle: 'bold', textColor: [227, 30, 36] }
    }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
  }

  doc.save(`SR_Financial_Statement_${period.replace(/ /g, '_')}.pdf`);
};