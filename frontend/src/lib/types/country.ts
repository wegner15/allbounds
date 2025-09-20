export type VisitRating = 'excellent' | 'good' | 'fair' | 'poor' | 'discouraged';

export interface MonthlyVisitRating {
  month: string;
  rating: VisitRating;
  notes?: string;
}

export interface CountryVisitInfo {
  id: number;
  country_id: number;
  monthly_ratings: MonthlyVisitRating[];
  general_notes?: string;
}

export interface Country {
  id: number;
  name: string;
  code: string;
  continent: string;
  description?: string;
  capital?: string;
  currency?: string;
  language?: string;
  timezone?: string;
  image_url?: string;
  visit_info?: CountryVisitInfo;
}
