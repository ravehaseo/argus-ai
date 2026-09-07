/** API client with authentication. */

import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from './constants';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      async (config) => {
        // Only add Authorization header if we have a valid token
        // This allows public endpoints to work without authentication
        
        // Check for admin token in localStorage first
        const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
        
        if (adminToken) {
          // Use admin token bypass
          config.headers.Authorization = `Bearer ${adminToken}`;
        } else {
          // Regular user - get token from Supabase session
          try {
            const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession());
            if (session?.access_token) {
              config.headers.Authorization = `Bearer ${session.access_token}`;
            }
            // If no session, don't add Authorization header (allows public access)
          } catch (error) {
            // If Supabase is not available or fails, don't add Authorization header
            // This allows the request to proceed without authentication
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (typeof window === 'undefined') return Promise.reject(error);

        const status = error.response?.status;
        if (status === 401) {
          // Unauthorized: clear session and redirect to login
          import('./supabase').then(({ supabase }) => supabase.auth.signOut());
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          window.location.href = '/login?reason=session_expired';
          return Promise.reject(error);
        }
        if (status && status >= 500) {
          console.error('[API] Server error:', status, error.response?.data || error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  get instance() {
    return this.client;
  }
}

export const apiClient = new APIClient().instance;

