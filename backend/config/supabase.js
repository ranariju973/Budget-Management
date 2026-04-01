/**
 * Supabase Client Configuration
 * 
 * Uses two clients:
 * - supabase: Regular client with anon key (respects RLS)
 * - supabaseAdmin: Service role client (bypasses RLS for admin operations)
 */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Regular client (respects RLS)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (bypasses RLS - use for server-side operations)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = { supabase, supabaseAdmin };
