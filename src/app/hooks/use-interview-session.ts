"use client";

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types for interview session management
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

export interface ConversationTurn {
  id: string;
  sessionId: string;
  speaker: 'interviewer' | 'candidate';
  content: string;
  timestamp: string;
  turnOrder: number;
  confidence?: number;
  duration?: number;
  generatedQuestions: Array<{ question: string; category: string; priority: string; }>;
  questionSuggestions: Array<{ question: string; category: string; priority: string; }>;
  analysis: Record<string, string | number | boolean | null>;
}

export interface DynamicQuestion {
  question: string;
  category: 'technical' | 'experience' | 'soft_skills' | 'verification' | 'follow_up' | 'clarification';
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  timing: 'immediate' | 'later' | 'if_time_permits';
  context: string;
  expectedResponse: string;
}

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

// ============================================================================
// INTERVIEW SESSION HOOK
// ============================================================================

export function useInterviewSession(sessionId?: string) {
  const queryClient = useQueryClient();
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);

  // Fetch interview session details
  const {
    data: session,
    isLoading: isLoadingSession,
    error: sessionError,
    refetch: refetchSession,
  } = useQuery({
    queryKey: ['interview-session', currentSessionId],
    queryFn: async (): Promise<InterviewSession | undefined> => {
      if (!currentSessionId) return undefined;
      const response = await fetch(`/api/interview-sessions/${currentSessionId}`);
      if (!response.ok) throw new Error('Failed to fetch interview session');
      const result = await response.json();
      return result.data as InterviewSession;
    },
    enabled: !!currentSessionId,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch conversation turns
  const {
    data: conversationTurns = [],
    isLoading: isLoadingTurns,
    error: turnsError,
    refetch: refetchTurns,
  } = useQuery({
    queryKey: ['conversation-turns', currentSessionId],
    queryFn: async () => {
      if (!currentSessionId) return [];
      const response = await fetch(`/api/interview-sessions/${currentSessionId}/turns`);
      if (!response.ok) throw new Error('Failed to fetch conversation turns');
      const result = await response.json();
      return result.data as ConversationTurn[];
    },
    enabled: !!currentSessionId,
    staleTime: 0, // Always refetch for real-time updates
  });

  // Create new interview session
  const createSessionMutation = useMutation({
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
    onSuccess: (data) => {
      setCurrentSessionId(data.id);
      queryClient.invalidateQueries({ queryKey: ['interview-sessions'] });
    },
  });

  // Start interview session
  const startSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/interview-sessions/${sessionId}/start`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to start interview session');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview-session', currentSessionId] });
    },
  });

  // End interview session
  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/interview-sessions/${sessionId}/end`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to end interview session');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview-session', currentSessionId] });
    },
  });

  // Add conversation turn
  const addTurnMutation = useMutation({
    mutationFn: async ({ sessionId, turnData }: { sessionId: string; turnData: AddTurnData }) => {
      const response = await fetch(`/api/interview-sessions/${sessionId}/turns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(turnData),
      });
      if (!response.ok) throw new Error('Failed to add conversation turn');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-turns', currentSessionId] });
    },
  });

  // Generate dynamic questions
  const generateQuestionsMutation = useMutation({
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

  // Update session transcript
  const updateTranscriptMutation = useMutation({
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

  // Helper functions
  const createSession = useCallback((data: CreateSessionData) => {
    return createSessionMutation.mutateAsync(data);
  }, [createSessionMutation]);

  const startSession = useCallback((sessionId: string) => {
    return startSessionMutation.mutateAsync(sessionId);
  }, [startSessionMutation]);

  const endSession = useCallback((sessionId: string) => {
    return endSessionMutation.mutateAsync(sessionId);
  }, [endSessionMutation]);

  const addConversationTurn = useCallback((turnData: AddTurnData) => {
    if (!currentSessionId) throw new Error('No active session');
    return addTurnMutation.mutateAsync({ sessionId: currentSessionId, turnData });
  }, [currentSessionId, addTurnMutation]);

  const generateDynamicQuestions = useCallback((params: {
    conversationContext: string;
    questionCount?: number;
    focusAreas?: string[];
    lastFewTurns?: number;
  }) => {
    if (!currentSessionId) throw new Error('No active session');
    return generateQuestionsMutation.mutateAsync({
      sessionId: currentSessionId,
      ...params,
    });
  }, [currentSessionId, generateQuestionsMutation]);

  const updateTranscript = useCallback((transcript: string) => {
    if (!currentSessionId) throw new Error('No active session');
    return updateTranscriptMutation.mutateAsync({ sessionId: currentSessionId, transcript });
  }, [currentSessionId, updateTranscriptMutation]);

  return {
    // Data
    session,
    conversationTurns,
    currentSessionId,

    // Loading states
    isLoadingSession,
    isLoadingTurns,
    isCreating: createSessionMutation.isPending,
    isStarting: startSessionMutation.isPending,
    isEnding: endSessionMutation.isPending,
    isAddingTurn: addTurnMutation.isPending,
    isGeneratingQuestions: generateQuestionsMutation.isPending,
    isUpdatingTranscript: updateTranscriptMutation.isPending,

    // Errors
    sessionError,
    turnsError,
    createError: createSessionMutation.error,
    startError: startSessionMutation.error,
    endError: endSessionMutation.error,
    addTurnError: addTurnMutation.error,
    generateQuestionsError: generateQuestionsMutation.error,
    updateTranscriptError: updateTranscriptMutation.error,

    // Generated questions data
    generatedQuestions: generateQuestionsMutation.data?.questions || [],
    conversationAnalysis: generateQuestionsMutation.data?.conversationAnalysis,

    // Actions
    createSession,
    startSession,
    endSession,
    addConversationTurn,
    generateDynamicQuestions,
    updateTranscript,
    setCurrentSessionId,
    refetchSession,
    refetchTurns,
  };
}