import { createClient } from '@supabase/supabase-js';

// Make sure these are correct - no trailing slashes!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Remove any trailing slashes from URL
const cleanUrl = supabaseUrl.replace(/\/+$/, '');

export const supabase = createClient(cleanUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

console.log('Supabase URL:', cleanUrl);
console.log('Supabase Key exists:', !!supabaseKey);