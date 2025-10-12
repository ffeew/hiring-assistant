import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateEmailTemplateData, EmailTemplateData } from "@/app/types";

interface EmailTemplateResponse {
  success: boolean;
  data: EmailTemplateData;
}

async function createEmailTemplate(data: CreateEmailTemplateData): Promise<EmailTemplateResponse> {
  const response = await fetch("/api/email-templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create email template");
  return response.json();
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
