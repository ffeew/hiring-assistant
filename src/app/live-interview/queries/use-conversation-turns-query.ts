import { useQuery, useQueryClient } from '@tanstack/react-query';

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

export function useConversationTurnsQuery(sessionId?: string) {
  return useQuery({
    queryKey: ['conversation-turns', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const response = await fetch(`/api/interview-sessions/${sessionId}/turns`);
      if (!response.ok) throw new Error('Failed to fetch conversation turns');
      const result = await response.json();
      return result.data as ConversationTurn[];
    },
    enabled: !!sessionId,
    staleTime: 0, // Always refetch for real-time updates
  });
}

// Invalidation utility
export function useInvalidateConversationTurns() {
  const queryClient = useQueryClient();
  return (sessionId: string) => queryClient.invalidateQueries({ queryKey: ['conversation-turns', sessionId] });
}
