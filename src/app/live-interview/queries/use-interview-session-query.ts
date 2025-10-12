import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface InterviewSession {
  id: string;
  title: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  startTime?: string;
  endTime?: string;
  fullTranscript?: string;
  sessionNotes?: string;
  interviewType: 'screening' | 'technical' | 'behavioral' | 'final';
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  jobPost: {
    id: string;
    title: string;
    department?: string;
  };
  resumeFile?: {
    id: string;
    fileName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export function useInterviewSessionQuery(sessionId?: string) {
  return useQuery({
    queryKey: ['interview-session', sessionId],
    queryFn: async (): Promise<InterviewSession | undefined> => {
      if (!sessionId) return undefined;
      const response = await fetch(`/api/interview-sessions/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch interview session');
      const result = await response.json();
      return result.data as InterviewSession;
    },
    enabled: !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Invalidation utility
export function useInvalidateInterviewSession() {
  const queryClient = useQueryClient();
  return (sessionId: string) => queryClient.invalidateQueries({ queryKey: ['interview-session', sessionId] });
}
