
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff'
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  password?: string;
}

export interface Transaction {
  id: string;
  name: string;
  particular: string;
  description?: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export interface MonthlyReport {
  month: string;
  income: number;
  expense: number;
}

export interface DashboardStats {
  totalIn: number;
  totalOut: number;
  balance: number;
  monthlyData: MonthlyReport[];
}
