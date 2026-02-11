import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  URL: 'sr_supabase_url',
  KEY: 'sr_supabase_key'
};

// Default credentials provided by the user
const DEFAULT_URL = 'https://wpbwtarisjdesnumxoso.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYnd0YXJpc2pkZXNudW14b3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzU0MjksImV4cCI6MjA4NjMxMTQyOX0.Qg_WuWZMGVzpg_tFaBvUYtSVprH4VI4YhhKCuxWpApQ';

const getCredentials = () => {
  const envUrl = process.env.SUPABASE_URL || '';
  const envKey = process.env.SUPABASE_ANON_KEY || '';
  
  const localUrl = localStorage.getItem(STORAGE_KEYS.URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEYS.KEY) || '';

  // Priority: Env Var > Local Storage > Hardcoded Default
  const url = envUrl || localUrl || DEFAULT_URL;
  const key = envKey || localKey || DEFAULT_KEY;

  const isConfigured = 
    url !== '' && 
    key !== '' && 
    !url.includes('your-project') && 
    !key.includes('your-anon-key');

  return { url, key, isConfigured };
};

export const isSupabaseConfigured = () => getCredentials().isConfigured;

// Initialize with either defaults or existing storage
const { url: initialUrl, key: initialKey } = getCredentials();
let currentClient = createClient(
  initialUrl || 'https://placeholder.supabase.co',
  initialKey || 'placeholder'
);

export const getSupabaseClient = (): SupabaseClient => {
  const { url, key, isConfigured } = getCredentials();
  if (isConfigured) {
    // If the client isn't pointed at the current effective URL, recreate it
    if ((currentClient as any).supabaseUrl !== url) {
      currentClient = createClient(url, key);
    }
  }
  return currentClient;
};

// Standard instance for direct imports
export const supabase = getSupabaseClient();

export const saveCloudCredentials = (url: string, key: string) => {
  localStorage.setItem(STORAGE_KEYS.URL, url);
  localStorage.setItem(STORAGE_KEYS.KEY, key);
  // Immediately recreate the active client
  currentClient = createClient(url, key);
};

export const clearCloudCredentials = () => {
  localStorage.removeItem(STORAGE_KEYS.URL);
  localStorage.removeItem(STORAGE_KEYS.KEY);
};

export const TABLES = {
  TRANSACTIONS: 'transactions',
  USERS: 'users'
};