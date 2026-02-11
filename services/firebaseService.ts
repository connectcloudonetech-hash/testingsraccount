/**
 * Deprecated: Project has migrated to Supabase as per latest requirements.
 * This file is kept to prevent import errors but no longer initializes Firestore
 * to resolve the "Service firestore is not available" issue.
 */

export const db = null as any;
export const COLLECTIONS = {
  TRANSACTIONS: 'transactions',
  USERS: 'users'
};