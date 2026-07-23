// TypeScript types for the Content Tagging system

export interface ContentTag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  icon?: string;
  color?: string;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ContentTagCreate {
  name: string;
  slug: string;
  description?: string;
  category?: string;
  icon?: string;
  color?: string;
  order_index?: number;
  is_active?: boolean;
}

export interface ContentTagUpdate {
  name?: string;
  slug?: string;
  description?: string;
  category?: string;
  icon?: string;
  color?: string;
  order_index?: number;
  is_active?: boolean;
}

export type TagCategory =
  | 'style'
  | 'vibe'
  | 'activity_type'
  | 'destination_type'
  | 'budget'
  | 'duration'
  | 'general';
