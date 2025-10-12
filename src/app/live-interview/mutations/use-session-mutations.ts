import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface CreateSessionData {
  applicantId: string;
  jobPostId: string;
  resumeFileId?: string;
  title: string;
  interviewType?: 'screening' | 'technical' | 'behavioral' | 'final';
}

export interface AddTurnData {
  speaker: 'interviewer' | 'candidate';
  content: string;
  confidence?: number;
  duration?: number;
}

// Create new interview session
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSessionData) => {
      const response = await fetch('/api/interview-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create interview session');
      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview-sessions'] });
    },
  });
}

// Start interview session
export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/interview-sessions/${sessionId}/start`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to start interview session');
      return await response.json();
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['interview-session', sessionId] });
    },
  });
}

// End interview session
export function useEndSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/interview-sessions/${sessionId}/end`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to end interview session');
      return await response.json();
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['interview-session', sessionId] });
    },
  });
}

// Add conversation turn
export function useAddTurn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, turnData }: { sessionId: string; turnData: AddTurnData }) => {
      const response = await fetch(`/api/interview-sessions/${sessionId}/turns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(turnData),
      });
      if (!response.ok) throw new Error('Failed to add conversation turn');
      return await response.json();
    },
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversation-turns', sessionId] });
    },
  });
}

// Generate dynamic questions
export function useGenerateQuestions() {
  return useMutation({
    mutationFn: async ({
      sessionId,
      conversationContext,
      questionCount = 3,
      focusAreas,
      lastFewTurns = 5,
    }: {
      sessionId: string;
      conversationContext: string;
      questionCount?: number;
      focusAreas?: string[];
      lastFewTurns?: number;
    }) => {
      const response = await fetch(`/api/interview-sessions/${sessionId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationContext,
          questionCount,
          focusAreas,
          lastFewTurns,
        }),
      });
      if (!response.ok) throw new Error('Failed to generate dynamic questions');
      const result = await response.json();
      return result.data;
    },
  });
}

// Update session transcript
export function useUpdateTranscript() {
  return useMutation({
    mutationFn: async ({ sessionId, transcript }: { sessionId: string; transcript: string }) => {
      const response = await fetch(`/api/interview-sessions/${sessionId}/transcript`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullTranscript: transcript }),
      });
      if (!response.ok) throw new Error('Failed to update transcript');
      return await response.json();
    },
  });
}
