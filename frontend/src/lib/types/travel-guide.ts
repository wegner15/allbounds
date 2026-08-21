export interface TravelGuideCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TravelGuideCategoryCreate {
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  order_index?: number;
  is_active?: boolean;
}

export interface TravelGuideCategoryUpdate {
  name?: string;
  slug?: string;
  icon?: string;
  description?: string;
  order_index?: number;
  is_active?: boolean;
}

export interface DestinationGuideItem {
  id: number;
  country_id: number;
  category_id: number;
  title: string;
  content: string;
  icon?: string;
  order_index: number;
  is_active: boolean;
  category?: TravelGuideCategory;
  created_at?: string;
  updated_at?: string;
}

export interface DestinationGuideItemCreate {
  country_id: number;
  category_id: number;
  title: string;
  content: string;
  icon?: string;
  order_index?: number;
  is_active?: boolean;
}

export interface DestinationGuideItemUpdate {
  category_id?: number;
  title?: string;
  content?: string;
  icon?: string;
  order_index?: number;
  is_active?: boolean;
}
