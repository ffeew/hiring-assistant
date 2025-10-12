import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ResumeFile {
  id: string;
  applicantId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileHash: string;
  resumeContent: string | null;
  extractionStatus: 'pending' | 'success' | 'failed';
  extractionError: string | null;
  createdAt: string;
  applicantFirstName: string;
  applicantLastName: string;
  applicantEmail: string;
  url: string;
}

interface ApiResponse {
  success: boolean;
  resumeFiles: ResumeFile[];
}

async function fetchResumeFiles(): Promise<ResumeFile[]> {
  const response = await fetch('/api/resumes');

  if (!response.ok) {
    throw new Error('Failed to fetch resume files');
  }

  const result: ApiResponse = await response.json();
  return result.resumeFiles;
}

export function useResumes() {
  return useQuery({
    queryKey: ['resumes'],
    queryFn: fetchResumeFiles,
    staleTime: 0, // Always refetch for up-to-date resume status
  });
}

// Invalidation utility
export function useInvalidateResumes() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['resumes'] });
}
