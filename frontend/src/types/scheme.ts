export interface Scheme {
  id: string;
  title: string;
  description: string;
  scheme_type: 'central' | 'state';
  state: string | null;
  applicable_user_types: ('farmer' | 'agro_startup')[];
  applicable_crops: string[] | null;
  farm_size_criteria: string[] | null;
  income_limit: string | null;
  min_age: number | null;
  max_age: number | null;
  benefits: string;
  eligibility_details: string;
  how_to_apply: string | null;
  application_link: string | null;
  deadline: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SavedScheme {
  id: string;
  saved_at: string;
  scheme_id: string;
  schemes: Scheme;
}

export interface EligibleScheme {
  scheme_id: string;
  scheme_title: string;
  match_score: number;
  reasons: string[];
  action_required: string;
}

export interface PartiallyEligibleScheme {
  scheme_id: string;
  scheme_title: string;
  match_score: number;
  missing_criteria: string[];
  suggestions: string[];
}

export interface NotEligibleScheme {
  scheme_id: string;
  scheme_title: string;
  reasons: string[];
}

export interface EligibilityAnalysis {
  profile: {
    user_type: string;
    state: string;
    crops: string[];
    farm_size: string;
    annual_income: string;
  };
  analysis: {
    eligible_schemes: EligibleScheme[];
    partially_eligible: PartiallyEligibleScheme[];
    not_eligible: NotEligibleScheme[];
  };
}

export interface SchemeFilters {
  state?: string;
  scheme_type?: 'central' | 'state' | '';
  crop?: string;
}