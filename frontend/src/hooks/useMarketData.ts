import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types
export interface MarketPrice {
  market: string;
  district: string;
  state: string;
  commodity: string;
  variety: string;
  grade: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  date: string;
}

export interface CurrentPriceResponse {
  state: string;
  district: string;
  commodity: string;
  totalMarkets: number;
  averagePrice: number;
  dateRange: {
    latest: string;
    oldest: string;
  };
  bestPrice: {
    market: string;
    district: string;
    price: number;
    date: string;
  };
  worstPrice: {
    market: string;
    district: string;
    price: number;
    date: string;
  };
  priceSpread: {
    difference: string;
    percentageDiff: string;
  };
  markets: MarketPrice[];
  dataNote: string;
  fetchedAt: string;
}

export interface HistoryData {
  date: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  marketCount: number;
}

export interface PredictionData {
  state: string;
  commodity: string;
  district: string;
  dataPoints: number;
  analysis: {
    currentPrice: number;
    predictions: {
      '7days': { price: number; change: string; confidence: string };
      '15days': { price: number; change: string; confidence: string };
      '30days': { price: number; change: string; confidence: string };
    };
    trend: string;
    recommendation: {
      action: string;
      reason: string;
      bestTimeToSell: string;
    };
    factors: {
      positive: string[];
      negative: string[];
      seasonal: string;
    };
    riskAnalysis: {
      volatility: string;
      risks: string[];
    };
  };
  generatedAt: string;
}

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get auth token
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json',
  };
};

// Fetch current prices
export const useCurrentPrices = (
  state: string, 
  district: string, 
  commodity: string, 
  hasSearched: boolean
) => {
  return useQuery({
    queryKey: ['marketPrices', 'current', state, district, commodity],
    queryFn: async (): Promise<CurrentPriceResponse> => {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({ state, commodity });
      if (district) params.append('district', district);
      
      const response = await fetch(`${API_URL}/api/market/current?${params}`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch current prices');
      }
      
      return response.json();
    },
    enabled: hasSearched && !!state && !!commodity,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch price history
export const usePriceHistory = (
  state: string, 
  commodity: string, 
  days: number = 90, 
  hasSearched: boolean
) => {
  return useQuery({
    queryKey: ['marketPrices', 'history', state, commodity, days],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({ state, commodity, days: days.toString() });
      
      const response = await fetch(`${API_URL}/api/market/history?${params}`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch price history');
      }
      
      return response.json();
    },
    enabled: hasSearched && !!state && !!commodity,
    staleTime: 5 * 60 * 1000,
  });
};

// AI Price prediction
export const usePricePrediction = () => {
  return useMutation({
    mutationFn: async ({ state, commodity, district }: { 
      state: string; 
      commodity: string; 
      district?: string;
    }): Promise<PredictionData> => {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_URL}/api/market/predict`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ state, commodity, district }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get price prediction');
      }
      
      return response.json();
    },
  });
};

// Compare markets
export const useMarketComparison = (
  state: string, 
  commodity: string, 
  hasSearched: boolean
) => {
  return useQuery({
    queryKey: ['marketPrices', 'compare', state, commodity],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({ state, commodity });
      
      const response = await fetch(`${API_URL}/api/market/compare?${params}`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch market comparison');
      }
      
      return response.json();
    },
    enabled: hasSearched && !!state && !!commodity,
    staleTime: 5 * 60 * 1000,
  });
};