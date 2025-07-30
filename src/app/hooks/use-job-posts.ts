"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { JobPost, CreateJobPostData } from "../types";

const QUERY_KEYS = {
  jobPosts: ['job-posts'] as const,
  jobPost: (id: string) => ['job-posts', id] as const,
};

// Fetch all job posts
export function useJobPosts(activeOnly = false) {
  return useQuery({
    queryKey: [...QUERY_KEYS.jobPosts, { activeOnly }],
    queryFn: async (): Promise<JobPost[]> => {
      const url = activeOnly ? '/api/job-posts?active=true' : '/api/job-posts';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch job posts');
      }
      const data = await response.json();
      return data.jobPosts;
    },
  });
}

// Fetch single job post
export function useJobPost(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.jobPost(id),
    queryFn: async (): Promise<JobPost> => {
      const response = await fetch(`/api/job-posts/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch job post');
      }
      const data = await response.json();
      return data.jobPost;
    },
    enabled: !!id,
  });
}

// Create job post mutation
export function useCreateJobPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJobPostData): Promise<JobPost> => {
      const response = await fetch('/api/job-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create job post');
      }
      const result = await response.json();
      return result.jobPost;
    },
    onSuccess: () => {
      // Invalidate and refetch job posts queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobPosts });
    },
  });
}

// Update job post mutation
export function useUpdateJobPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateJobPostData> }): Promise<JobPost> => {
      const response = await fetch(`/api/job-posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update job post');
      }
      const result = await response.json();
      return result.jobPost;
    },
    onSuccess: (updatedJobPost) => {
      // Update specific job post in cache
      queryClient.setQueryData(QUERY_KEYS.jobPost(updatedJobPost.id), updatedJobPost);
      // Invalidate list queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobPosts });
    },
  });
}

// Delete job post mutation
export function useDeleteJobPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/job-posts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete job post');
      }
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.jobPost(deletedId) });
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobPosts });
    },
  });
}

// Toggle job post active status
export function useToggleJobPostStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<JobPost> => {
      const response = await fetch(`/api/job-posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update job post status');
      }
      const result = await response.json();
      return result.jobPost;
    },
    onSuccess: (updatedJobPost) => {
      // Update specific job post in cache
      queryClient.setQueryData(QUERY_KEYS.jobPost(updatedJobPost.id), updatedJobPost);
      // Invalidate list queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobPosts });
    },
  });
}