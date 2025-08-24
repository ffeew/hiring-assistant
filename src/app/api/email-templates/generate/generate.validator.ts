import { z } from 'zod';

export const generateTemplateBodySchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(500, 'Prompt too long'),
  category: z.enum(['acknowledgment', 'screening', 'interview', 'offer', 'rejection', 'follow_up']),
  includeVariables: z.boolean().default(true),
  tone: z.enum(['professional', 'friendly', 'formal', 'casual']).default('professional'),
});

export type GenerateTemplateBody = z.infer<typeof generateTemplateBodySchema>;