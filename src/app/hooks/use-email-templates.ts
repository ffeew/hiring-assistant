import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  EmailTemplateData, 
  CreateEmailTemplateData, 
  UpdateEmailTemplateData,
  TemplateCategory 
} from "../types";
import type { TemplateVariable } from "../api/email-templates/email-templates.validator";

interface EmailTemplatesQuery {
  category?: TemplateCategory;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

interface EmailTemplatesResponse {
  success: boolean;
  data: EmailTemplateData[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface EmailTemplateResponse {
  success: boolean;
  data: EmailTemplateData;
}

interface EmailTemplatePreviewResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    category: TemplateCategory;
    subject: string;
    content: string;
    variables: TemplateVariable[];
  };
}

// Fetch all email templates
async function fetchEmailTemplates(query: EmailTemplatesQuery = {}): Promise<EmailTemplatesResponse> {
  const params = new URLSearchParams();
  
  if (query.category) params.append('category', query.category);
  if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
  if (query.search) params.append('search', query.search);
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.offset) params.append('offset', query.offset.toString());

  const response = await fetch(`/api/email-templates?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch email templates");
  return response.json();
}

// Fetch single email template
async function fetchEmailTemplate(id: string): Promise<EmailTemplateResponse> {
  const response = await fetch(`/api/email-templates/${id}`);
  if (!response.ok) throw new Error("Failed to fetch email template");
  return response.json();
}

// Create email template
async function createEmailTemplate(data: CreateEmailTemplateData): Promise<EmailTemplateResponse> {
  const response = await fetch("/api/email-templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create email template");
  return response.json();
}

// Update email template
async function updateEmailTemplate(id: string, data: UpdateEmailTemplateData): Promise<EmailTemplateResponse> {
  const response = await fetch(`/api/email-templates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update email template");
  return response.json();
}

// Delete email template
async function deleteEmailTemplate(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`/api/email-templates/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete email template");
  return response.json();
}

// Duplicate email template
async function duplicateEmailTemplate(id: string, data: { name: string; category?: TemplateCategory }): Promise<EmailTemplateResponse> {
  const response = await fetch(`/api/email-templates/${id}/duplicate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to duplicate email template");
  return response.json();
}

// Get email template preview
async function fetchEmailTemplatePreview(id: string): Promise<EmailTemplatePreviewResponse> {
  const response = await fetch(`/api/email-templates/${id}/preview`);
  if (!response.ok) throw new Error("Failed to fetch email template preview");
  return response.json();
}

// React Query Hooks

export function useEmailTemplates(query: EmailTemplatesQuery = {}) {
  return useQuery({
    queryKey: ["email-templates", query],
    queryFn: () => fetchEmailTemplates(query),
    staleTime: 0, // Refresh on every query since templates may change frequently
  });
}

export function useEmailTemplate(id: string) {
  return useQuery({
    queryKey: ["email-template", id],
    queryFn: () => fetchEmailTemplate(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute cache for individual templates
  });
}

export function useEmailTemplatePreview(id: string) {
  return useQuery({
    queryKey: ["email-template-preview", id],
    queryFn: () => fetchEmailTemplatePreview(id),
    enabled: !!id,
    staleTime: 0, // Always fresh for preview
  });
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createEmailTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmailTemplateData }) =>
      updateEmailTemplate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      queryClient.invalidateQueries({ queryKey: ["email-template", id] });
      queryClient.invalidateQueries({ queryKey: ["email-template-preview", id] });
    },
  });
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteEmailTemplate,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      queryClient.removeQueries({ queryKey: ["email-template", id] });
      queryClient.removeQueries({ queryKey: ["email-template-preview", id] });
    },
  });
}

export function useDuplicateEmailTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; category?: TemplateCategory } }) =>
      duplicateEmailTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });
}

// Custom hooks for query invalidation
export function useInvalidateEmailTemplates() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["email-templates"] });
}

export function useInvalidateEmailTemplate() {
  const queryClient = useQueryClient();
  return (id: string) => {
    queryClient.invalidateQueries({ queryKey: ["email-template", id] });
    queryClient.invalidateQueries({ queryKey: ["email-template-preview", id] });
  };
}