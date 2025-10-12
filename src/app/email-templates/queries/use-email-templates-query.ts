import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { EmailTemplateData, TemplateCategory } from "@/app/types";

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

export function useEmailTemplates(query: EmailTemplatesQuery = {}) {
  return useQuery({
    queryKey: ["email-templates", query],
    queryFn: () => fetchEmailTemplates(query),
    staleTime: 0, // Refresh on every query since templates may change frequently
  });
}

// Invalidation utility
export function useInvalidateEmailTemplates() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["email-templates"] });
}
