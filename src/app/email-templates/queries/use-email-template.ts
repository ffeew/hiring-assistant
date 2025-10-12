import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { EmailTemplateData } from "@/app/types";

interface EmailTemplateResponse {
  success: boolean;
  data: EmailTemplateData;
}

async function fetchEmailTemplate(id: string): Promise<EmailTemplateResponse> {
  const response = await fetch(`/api/email-templates/${id}`);
  if (!response.ok) throw new Error("Failed to fetch email template");
  return response.json();
}

export function useEmailTemplate(id: string) {
  return useQuery({
    queryKey: ["email-template", id],
    queryFn: () => fetchEmailTemplate(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute cache for individual templates
  });
}

// Invalidation utility
export function useInvalidateEmailTemplate() {
  const queryClient = useQueryClient();
  return (id: string) => queryClient.invalidateQueries({ queryKey: ["email-template", id] });
}
