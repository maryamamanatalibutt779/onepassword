import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Extract the Bearer token from an incoming Next.js request.
 * @param {Request} request
 * @returns {string|null}
 */
export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

/**
 * Create a Supabase client authenticated with the user's JWT.
 * @param {string} token
 */
export function createAuthedClient(token) {
  return createClient(
    supabaseUrl || 'https://placeholder-project.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

/**
 * Create a Supabase client with the service role key (bypasses RLS).
 * Requires SUPABASE_SERVICE_ROLE_KEY to be set.
 */
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
  }
  return createClient(
    supabaseUrl || 'https://placeholder-project.supabase.co',
    serviceKey
  );
}
