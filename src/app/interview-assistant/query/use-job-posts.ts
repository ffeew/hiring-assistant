import { useQuery } from "@tanstack/react-query";

interface JobPost {
  id: string;
  title: string;
  department?: string | null;
}

async function fetchJobPosts(): Promise<JobPost[]> {
  const response = await fetch("/api/job-posts");
  if (!response.ok) throw new Error("Failed to fetch job posts");
  const result = await response.json();
  return result.jobPosts;
}

export function useJobPosts() {
  return useQuery({
    queryKey: ["job-posts"],
    queryFn: fetchJobPosts,
  });
}