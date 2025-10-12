import { useMutation } from '@tanstack/react-query';
import type { GenerateTemplateBody } from '@/app/api/email-templates/generate/generate.validator';

interface GeneratedTemplate {
  name: string;
  subject: string;
  content: string;
}

interface GenerateTemplateResponse {
  success: boolean;
  data: GeneratedTemplate;
}

async function generateTemplate(data: GenerateTemplateBody): Promise<GeneratedTemplate> {
  const response = await fetch('/api/email-templates/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details?.[0]?.message || 'Failed to generate template');
  }

  const result: GenerateTemplateResponse = await response.json();
  return result.data;
}

export function useGenerateTemplate() {
  return useMutation({
    mutationFn: generateTemplate,
    onError: (error) => {
      console.error('Template generation failed:', error);
    },
  });
}
