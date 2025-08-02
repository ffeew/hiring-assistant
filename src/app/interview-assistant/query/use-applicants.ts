"use client";

import { useQuery } from "@tanstack/react-query";

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobPostId?: string | null;
}

async function fetchApplicants(): Promise<Applicant[]> {
  const response = await fetch("/api/applicants");
  if (!response.ok) throw new Error("Failed to fetch applicants");
  const result = await response.json();
  return result.applicants;
}

export function useApplicants() {
  return useQuery({
    queryKey: ["applicants"],
    queryFn: fetchApplicants,
  });
}