import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

// Types for Legal Templates
export interface LegalTemplate {
  id: string;
  name: string;
  size: number;
  created_at: string;
  updated_at: string;
  download_url: string;
  type: string;
}

// Types for Document Analysis
export interface PartyAndDates {
  parties: string[];
  start_date: string | null;
  end_date: string | null;
  signing_date: string | null;
}

export interface KeyClauses {
  payment_terms: string | null;
  termination: string | null;
  liability: string | null;
  dispute_resolution: string | null;
  force_majeure: string | null;
}

export interface Obligations {
  party1_obligations: string[];
  party2_obligations: string[];
}

export interface RisksAndMissingTerms {
  identified_risks: string[];
  missing_important_clauses: string[];
}

export interface DocumentAnalysis {
  parties_and_dates: PartyAndDates;
  contract_type: string;
  key_clauses: KeyClauses;
  obligations: Obligations;
  risks_and_missing_terms: RisksAndMissingTerms;
  plain_summary: string;
}

export interface ParsedDocument {
  filename: string;
  filesize: number;
  pages: number;
  analysis: DocumentAnalysis;
}

// API Functions
export const legalService = {
  // Get all legal templates
  getTemplates: async (): Promise<{ templates: LegalTemplate[]; count: number }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/legal/templates`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch templates');
    }
  },

  // Parse and analyze PDF document
  parseDocument: async (file: File): Promise<ParsedDocument> => {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await axios.post(`${API_BASE_URL}/legal/parser`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds timeout for AI processing
      });

      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. The document is taking too long to process.');
      }
      throw new Error(error.response?.data?.error || 'Failed to parse document');
    }
  },
};