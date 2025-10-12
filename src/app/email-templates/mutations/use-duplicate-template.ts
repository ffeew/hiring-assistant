import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TemplateCategory, EmailTemplateData } from "@/app/types";

interface EmailTemplateResponse {
  success: boolean;
  data: EmailTemplateData;
}

async function duplicateEmailTemplate(id: string, data: { name: string; category?: TemplateCategory }): Promise<EmailTemplateResponse> {
  const response = await fetch(`/api/email-templates/${id}/duplicate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to duplicate email template");
  return response.json();
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
