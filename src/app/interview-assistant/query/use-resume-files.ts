"use client";

import { queryClient } from "@/app/providers/query-provider";
import { useQuery } from "@tanstack/react-query";

interface ResumeFile {
  id: string;
  fileName: string;
  applicantId: string;
  jobPostId?: string | null;
}

async function fetchResumeFiles(): Promise<ResumeFile[]> {
  const response = await fetch("/api/resumes");
  if (!response.ok) throw new Error("Failed to fetch resume files");
  const result = await response.json();
  return result.resumeFiles;
}

export function useResumeFiles() {
  return useQuery({
    queryKey: ["resume-files"],
    queryFn: fetchResumeFiles,
    staleTime: 0, // Always refetch when component mounts or invalidates
  });
}

export function invalidateResumeFiles() {
  return queryClient.invalidateQueries({ queryKey: ["resume-files"] });

}