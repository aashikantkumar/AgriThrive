import { supabase } from '@/lib/supabase';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

// Helper to get auth token from Supabase
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || ''}`,
  };
};

export const schemeService = {
  // Get all schemes with optional filters
  getAllSchemes: async (filters?: { 
    state?: string; 
    scheme_type?: string; 
    crop?: string 
  }) => {
    const params = new URLSearchParams();
    if (filters?.state) params.append('state', filters.state);
    if (filters?.scheme_type) params.append('scheme_type', filters.scheme_type);
    if (filters?.crop) params.append('crop', filters.crop);
    
    const response = await fetch(
      `${API_BASE_URL}/schemes?${params.toString()}`,
      {
        headers: await getAuthHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch schemes');
    }
    
    return response.json();
  },

  // Get single scheme by ID
  getSchemeById: async (id: string) => {
    const response = await fetch(
      `${API_BASE_URL}/schemes/${id}`,
      {
        headers: await getAuthHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch scheme');
    }
    
    return response.json();
  },

  // Check AI eligibility
  checkEligibility: async () => {
    const response = await fetch(
      `${API_BASE_URL}/schemes/check-eligibility`,
      {
        method: 'POST',
        headers: await getAuthHeaders(),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to check eligibility');
    }
    
    return response.json();
  },

  // Get saved schemes
  getSavedSchemes: async () => {
    const response = await fetch(
      `${API_BASE_URL}/schemes/saved/list`,
      {
        headers: await getAuthHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch saved schemes');
    }
    
    return response.json();
  },

  // Save a scheme
  saveScheme: async (schemeId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/schemes/${schemeId}/save`,
      {
        method: 'POST',
        headers: await getAuthHeaders(),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save scheme');
    }
    
    return response.json();
  },

  // Unsave a scheme
  unsaveScheme: async (schemeId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/schemes/${schemeId}/save`,
      {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to unsave scheme');
    }
    
    return response.json();
  },
};