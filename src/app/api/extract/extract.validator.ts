import { z } from 'zod';

// Since this is a FormData endpoint, we don't validate with Zod but with manual checks
// The files are validated in the route handler for file type and count

export const extractResumesFormDataSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, 'At least one file is required'),
});

export type ExtractResumesFormData = z.infer<typeof extractResumesFormDataSchema>;