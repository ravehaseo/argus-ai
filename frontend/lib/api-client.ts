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
        // Check for admin token in localStorage first
        const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
        
        if (adminToken) {
          // Use admin token bypass
          config.headers.Authorization = `Bearer ${adminToken}`;
        } else {
          // Regular user - get token from Supabase session
          const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession());
          if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  get instance() {
    return this.client;
  }
}

export const apiClient = new APIClient().instance;

