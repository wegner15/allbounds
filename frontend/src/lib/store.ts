import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define types for our store
interface FilterState {
  [key: string]: any;
}

interface UserPreferences {
  darkMode: boolean;
  currency: string;
}

interface AppState {
  // Filter state for different pages
  filters: {
    packages: FilterState;
    groupTrips: FilterState;
    stays: FilterState;
    activities: FilterState;
  };
  
  // User preferences
  preferences: UserPreferences;
  
  // Recently viewed items
  recentlyViewed: {
    id: string;
    type: 'package' | 'groupTrip' | 'stay' | 'activity' | 'attraction';
    title: string;
    image?: string;
    slug: string;
    timestamp: number;
  }[];
  
  // Actions
  setFilters: (page: keyof AppState['filters'], filters: FilterState) => void;
  clearFilters: (page: keyof AppState['filters']) => void;
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  addRecentlyViewed: (item: Omit<AppState['recentlyViewed'][0], 'timestamp'>) => void;
  clearRecentlyViewed: () => void;
}

// Create store with persistence
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      filters: {
        packages: {},
        groupTrips: {},
        stays: {},
        activities: {},
      },
      
      preferences: {
        darkMode: false,
        currency: 'USD',
      },
      
      recentlyViewed: [],
      
      // Actions
      setFilters: (page, filters) => 
        set((state) => ({
          filters: {
            ...state.filters,
            [page]: filters,
          },
        })),
      
      clearFilters: (page) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [page]: {},
          },
        })),
      
      setPreference: (key, value) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: value,
          },
        })),
      
      addRecentlyViewed: (item) =>
        set((state) => {
          // Remove if already exists
          const filtered = state.recentlyViewed.filter((i) => !(i.id === item.id && i.type === item.type));
          
          // Add to beginning with timestamp
          return {
            recentlyViewed: [
              {
                ...item,
                timestamp: Date.now(),
              },
              ...filtered,
            ].slice(0, 10), // Keep only 10 most recent
          };
        }),
      
      clearRecentlyViewed: () =>
        set({ recentlyViewed: [] }),
    }),
    {
      name: 'allbounds-storage',
      partialize: (state) => ({
        preferences: state.preferences,
        recentlyViewed: state.recentlyViewed,
      }),
    }
  )
);

// Create a hook for search state (non-persisted)
interface SearchState {
  query: string;
  results: any[];
  isLoading: boolean;
  setQuery: (query: string) => void;
  setResults: (results: any[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  isLoading: false,
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setIsLoading: (isLoading) => set({ isLoading }),
  clearSearch: () => set({ query: '', results: [], isLoading: false }),
}));
