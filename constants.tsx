import React from 'react';
import { Transaction, TransactionType, User, UserRole } from './types';

export const CURRENCY = '₹';
export const LOGO_URL = 'https://raw.githubusercontent.com/connectcloudonetech-hash/srinfotechaccounts/7e2fc52ae6e1fa02e288c7d7f65a0e2b2b512018/image/logo-512.png';

export const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'admin', name: 'SR Admin', role: UserRole.ADMIN, password: 'password123' },
  { id: 'u2', username: 'staff', name: 'SR Staff', role: UserRole.STAFF, password: 'password123' }
];

export const NAMES: string[] = [
  'SR INFOTECH',
  'Aman Enterprises',
  'Rahul Sharma',
  'Priya Gupta',
  'Hindustan Traders',
  'Global Solutions',
  'Self Account'
];

export const PARTICULARS: string[] = [
  'CARRY IN',
  'CARRY OUT',
  'Inventory Purchase',
  'Client Payment',
  'Office Rent',
  'Electricity Bill',
  'Salary Payout',
  'Miscellaneous',
  'Conveyance'
];

export const CATEGORIES = PARTICULARS;

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    name: 'Aman Enterprises',
    particular: 'CARRY IN',
    description: 'Initial project fund transfer',
    amount: 50000,
    type: TransactionType.INCOME,
    category: 'CARRY IN',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 't2',
    name: 'Office Rent',
    particular: 'CARRY OUT',
    description: 'Monthly office rent for October',
    amount: 15000,
    type: TransactionType.EXPENSE,
    category: 'CARRY OUT',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 't3',
    name: 'Rahul Sharma',
    particular: 'Salary Payout',
    description: 'Senior Developer Monthly Salary',
    amount: 35000,
    type: TransactionType.EXPENSE,
    category: 'Salary Payout',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
  },
  {
    id: 't4',
    name: 'Hindustan Traders',
    particular: 'Inventory Purchase',
    description: 'Hardware components and monitors',
    amount: 22450.50,
    type: TransactionType.EXPENSE,
    category: 'Inventory Purchase',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0]
  },
  {
    id: 't5',
    name: 'Priya Gupta',
    particular: 'Client Payment',
    description: 'Web Design Project Milestone 1',
    amount: 12000,
    type: TransactionType.INCOME,
    category: 'Client Payment',
    date: new Date(Date.now() - 259200000).toISOString().split('T')[0]
  }
];

export const LOGO_SVG = (className?: string) => (
  <svg viewBox="0 0 400 500" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Crown */}
    <path d="M110 130 L130 70 L200 110 L270 70 L290 130 Z" fill="#E31E24" />
    <circle cx="110" cy="130" r="10" fill="#E31E24" />
    <circle cx="130" cy="70" r="10" fill="#E31E24" />
    <circle cx="200" cy="40" r="12" fill="#E31E24" />
    <path d="M200 40 L200 110" stroke="#E31E24" strokeWidth="4" />
    <circle cx="270" cy="70" r="10" fill="#E31E24" />
    <circle cx="290" cy="130" r="10" fill="#E31E24" />
    
    {/* Shield Base / "S" (Left Red Part) */}
    <path d="M200 160 L100 160 L100 350 L200 480 V160 Z" fill="#E31E24" />
    <path d="M125 220 H175 V250 H125 V320 H175 V350 H100 L100 320 H150 V280 H100 V220 H125 Z" fill="white" fillOpacity="0.1" />
    
    {/* Shield Base / "R" (Right Black Part) */}
    <path d="M200 160 H300 V350 L200 480 V160 Z" fill="#1A1A1A" />
    
    {/* Letter S Stylized Cutouts */}
    <path d="M125 210 H175 V240 L125 240 V290 H175 V320 H125 V360 H100 V320 H150 V270 H100 V210 H125 Z" fill="#F8F9FA" />
    
    {/* Letter R Stylized Cutouts */}
    <path d="M225 210 H275 V280 H250 L275 360 H245 L225 290 V360 H200 V210 H225 Z M225 240 V260 H250 V240 H225 Z" fill="#F8F9FA" />
  </svg>
);

export const SQL_SNIPPET = `-- Run this in your Supabase SQL Editor
-- This will ensure your schema matches the application requirements exactly.

-- 1. OPTIONAL: Cleanup existing table if you want to reset (CAUTION: DELETES DATA)
-- DROP TABLE IF EXISTS transactions;

-- 2. Create the Transactions Table with the 'date' column
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  particular TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE, -- THIS IS THE MISSING COLUMN
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create the Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'staff')) NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Insert Initial Admin User
INSERT INTO users (username, name, role, password)
VALUES ('admin', 'SR Admin', 'admin', 'password123')
ON CONFLICT (username) DO NOTHING;

-- 5. Set up Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. Create permissive policies for initial setup (Fine-tune these later)
DROP POLICY IF EXISTS "Public Read" ON transactions;
CREATE POLICY "Public Read" ON transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert" ON transactions;
CREATE POLICY "Public Insert" ON transactions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update" ON transactions;
CREATE POLICY "Public Update" ON transactions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Delete" ON transactions;
CREATE POLICY "Public Delete" ON transactions FOR DELETE USING (true);

DROP POLICY IF EXISTS "Users Public Read" ON users;
CREATE POLICY "Users Public Read" ON users FOR SELECT USING (true);
`;