import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../api';
import type { User } from '../types/api';

// Hook for fetching all users (admin only)
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      return apiClient.get<User[]>(endpoints.users.list());
    },
  });
};

// Hook for fetching a single user by ID (admin only)
export const useUser = (id: number) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      return apiClient.get<User>(endpoints.users.detail(id));
    },
    enabled: !!id, // Only run the query if id is provided
  });
};

// Hook for creating a new user (admin only)
export interface CreateUserData {
  email: string;
  password: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
}

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: CreateUserData) => {
      return apiClient.post<User>(endpoints.users.list(), userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Hook for updating a user (admin only)
export interface UpdateUserData {
  email?: string;
  password?: string;
  full_name?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

export const useUpdateUser = (id?: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: UpdateUserData) => {
      if (!id) throw new Error('User ID is required');
      return apiClient.put<User>(endpoints.users.detail(id), userData);
    },
    onSuccess: (data) => {
      if (id) {
        queryClient.setQueryData(['user', id], data);
        queryClient.invalidateQueries({ queryKey: ['users'] });
      }
    },
  });
};

// Hook for deleting a user (admin only)
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return apiClient.delete(endpoints.users.detail(id));
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
