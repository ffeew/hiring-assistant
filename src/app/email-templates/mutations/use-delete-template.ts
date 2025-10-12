import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteEmailTemplate(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`/api/email-templates/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete email template");
  return response.json();
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
