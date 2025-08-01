import { z } from 'zod';

export const updateProfileBodySchema = z.object({
  gmailAddress: z.string().email('Valid Gmail address is required'),
  gmailAppPassword: z.string().min(1, 'Gmail app password is required'),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
});

export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;