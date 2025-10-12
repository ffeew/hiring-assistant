import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { TemplateCategory } from "@/app/types";
import type { TemplateVariable } from "@/app/api/email-templates/email-templates.validator";

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

async function fetchEmailTemplatePreview(id: string): Promise<EmailTemplatePreviewResponse> {
  const response = await fetch(`/api/email-templates/${id}/preview`);
  if (!response.ok) throw new Error("Failed to fetch email template preview");
  return response.json();
}

export function useEmailTemplatePreview(id: string) {
  return useQuery({
    queryKey: ["email-template-preview", id],
    queryFn: () => fetchEmailTemplatePreview(id),
    enabled: !!id,
    staleTime: 0, // Always fresh for preview
  });
}

// Invalidation utility
export function useInvalidateEmailTemplatePreview() {
  const queryClient = useQueryClient();
  return (id: string) => queryClient.invalidateQueries({ queryKey: ["email-template-preview", id] });
}
