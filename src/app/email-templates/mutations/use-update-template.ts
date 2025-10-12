import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateEmailTemplateData, EmailTemplateData } from "@/app/types";

interface EmailTemplateResponse {
  success: boolean;
  data: EmailTemplateData;
}

async function updateEmailTemplate(id: string, data: UpdateEmailTemplateData): Promise<EmailTemplateResponse> {
  const response = await fetch(`/api/email-templates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update email template");
  return response.json();
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
