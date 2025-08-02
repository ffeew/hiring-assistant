import { useMutation } from "@tanstack/react-query";

interface GenerateQuestionsRequest {
  applicantId: string;
  jobPostId: string;
  resumeFileId: string;
  questionCount?: number;
  focusAreas?: ("technical" | "experience" | "soft_skills" | "verification")[];
}

interface InterviewQuestion {
  question: string;
  category: "technical" | "experience" | "soft_skills" | "verification";
  reasoning: string;
  expectedResponse: string;
  exampleResponse: string;
}

interface GenerateQuestionsResponse {
  questions: InterviewQuestion[];
  applicant: {
    id: string;
    name: string;
    email: string;
  };
  jobPost: {
    id: string;
    title: string;
    department: string | null;
  };
  resume: {
    id: string;
    fileName: string;
  };
}

async function generateQuestions(data: GenerateQuestionsRequest): Promise<GenerateQuestionsResponse> {
  const response = await fetch("/api/interview-assistant", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate interview questions");
  }

  const result = await response.json();
  return result.data;
}

export function useInterviewAssistant() {
  const generateQuestionsMutation = useMutation({
    mutationFn: generateQuestions,
    onError: (error) => {
      console.error("Error generating interview questions:", error);
    },
  });

  return {
    generateQuestions: generateQuestionsMutation.mutate,
    generateQuestionsAsync: generateQuestionsMutation.mutateAsync,
    isGenerating: generateQuestionsMutation.isPending,
    error: generateQuestionsMutation.error,
    data: generateQuestionsMutation.data,
    isSuccess: generateQuestionsMutation.isSuccess,
    reset: generateQuestionsMutation.reset,
  };
}