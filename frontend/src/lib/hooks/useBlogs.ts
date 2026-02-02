import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  summary?: string;
  slug: string;
  cover_image_id?: string;
  author_id: number;
  is_published: boolean;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string;
  tags: Tag[];
  package_ids?: number[];
  packages?: any[];
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface BlogPostCreateInput {
  title: string;
  content: string;
  summary?: string;
  cover_image_id?: string;
  tags?: string[];
  slug?: string;
  package_ids?: number[];
}

export interface BlogPostUpdateInput {
  title?: string;
  content?: string;
  summary?: string;
  cover_image_id?: string;
  tags?: string[];
  is_published?: boolean;
  is_active?: boolean;
  package_ids?: number[];
}

// Hook for fetching all blog posts
export const useBlogs = (includeDrafts: boolean = false) => {
  return useQuery<BlogPost[]>({
    queryKey: ['blogs', includeDrafts],
    queryFn: async () => {
      const params = includeDrafts ? '?include_drafts=true' : '';
      const response = await apiClient.get<BlogPost[]>(`/blog/${params}`);
      return response;
    }
  });
};

// Hook for fetching a single blog post by slug
export const useBlogBySlug = (slug: string) => {
  return useQuery<BlogPost>({
    queryKey: ['blogs', 'slug', slug],
    queryFn: async () => {
      const response = await apiClient.get<BlogPost>(`/blog/slug/${slug}`);
      return response;
    },
    enabled: !!slug,
  });
};

// Hook for fetching related blog posts
export const useRelatedBlogs = (currentBlogId?: number, limit: number = 3) => {
  return useQuery<BlogPost[]>({
    queryKey: ['blogs', 'related', currentBlogId, limit],
    queryFn: async () => {
      const response = await apiClient.get<BlogPost[]>(`/blog/?limit=${limit + 1}`);
      // Filter out the current blog and limit to the desired number
      return response.filter(blog => blog.id !== currentBlogId).slice(0, limit);
    },
    enabled: !!currentBlogId,
  });
};

// Hook for fetching a single blog post by ID
export const useBlog = (id: number) => {
  return useQuery({
    queryKey: ['blogs', id],
    queryFn: async () => {
      const response = await apiClient.get(`/blog/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

// Hook for creating a new blog post
export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BlogPostCreateInput) => {
      const response = await apiClient.post('/blog/', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
};

// Hook for updating a blog post
export const useUpdateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BlogPostUpdateInput }) => {
      const response = await apiClient.put(`/blog/${id}`, data);
      return response;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogs', id] });
    },
  });
};

// Hook for deleting a blog post
export const useDeleteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/blog/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
};

// Hook for publishing a blog post
export const usePublishBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(`/blog/${id}/publish`, {});
      return response;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogs', id] });
    },
  });
};

// Hook for unpublishing a blog post
export const useUnpublishBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(`/blog/${id}/unpublish`, {});
      return response;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogs', id] });
    },
  });
};

// Hook for featuring a blog post
export const useFeatureBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(`/blog/${id}/feature`, {});
      return response;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogs', id] });
    },
  });
};

// Hook for unfeaturing a blog post
export const useUnfeatureBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(`/blog/${id}/unfeature`, {});
      return response;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogs', id] });
    },
  });
};
