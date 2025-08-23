import { z } from 'zod';

export const updateProfileBodySchema = z
  .object({
    gmailAddress: z.string().email('Valid Gmail address is required').optional().or(z.literal("")),
    gmailAppPassword: z
      .string()
      .optional()
      .refine((val) => !val || (val.length === 16), {
        message: "Gmail app password must be 16 characters if provided",
      }),
    companyName: z.string().optional(),
    jobTitle: z.string().optional(),
  })
  .refine((data) => {
    // If one email field is provided, both should be provided
    const hasGmailAddress = data.gmailAddress && data.gmailAddress.trim() !== "";
    const hasGmailPassword = data.gmailAppPassword && data.gmailAppPassword.trim() !== "";
    return (hasGmailAddress && hasGmailPassword) || (!hasGmailAddress && !hasGmailPassword);
  }, {
    message: "Both Gmail address and app password are required if you want to configure email",
    path: ["gmailAppPassword"],
  });

export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;