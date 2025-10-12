"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Users, MessageSquare, Clock, AlertCircle } from "lucide-react";

import type { CreateSessionData } from "@/app/live-interview/mutations/use-session-mutations";
import { useSpeechRecognition } from "@/app/live-interview/hooks/use-speech-recognition";
import { useInterviewSessionQuery } from "@/app/live-interview/queries/use-interview-session-query";
import { useConversationTurnsQuery } from "@/app/live-interview/queries/use-conversation-turns-query";
import {
	useCreateSession,
	useStartSession,
	useEndSession,
	useAddTurn,
	useGenerateQuestions,
} from "@/app/live-interview/mutations/use-session-mutations";
import { useApplicants } from "@/app/interview-assistant/query/use-applicants";
import { useJobPosts } from "@/app/job-posts/queries/use-job-posts";
import { useResumeFiles } from "@/app/interview-assistant/query/use-resume-files";

import { SessionSetupModal } from "./session-setup-modal";
import { LiveTranscript } from "./live-transcript";
import { QuestionSuggestions } from "./question-suggestions";
import { InterviewControls } from "./interview-controls";
import { SessionSummary } from "./session-summary";

export function LiveInterviewDashboard() {
	const [showSetupModal, setShowSetupModal] = useState(false);
	const [currentSpeaker, setCurrentSpeaker] = useState<
		"interviewer" | "candidate"
	>("candidate");
	const [lastSpeechTime, setLastSpeechTime] = useState<number>(0);
	const [accumulatedTranscript, setAccumulatedTranscript] = useState<string>("");
	const [lastInterimTime, setLastInterimTime] = useState<number>(0);

	// Data fetching
	const { data: applicants = [], isLoading: isLoadingApplicants } =
		useApplicants();
	const { data: jobPosts = [], isLoading: isLoadingJobPosts } = useJobPosts();
	const { data: resumeFiles = [], isLoading: isLoadingResumes } =
		useResumeFiles();

	// Interview session management
	const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(
		undefined
	);

	// Queries
	const {
		data: session,
		isLoading: isLoadingSession,
		error: sessionError,
	} = useInterviewSessionQuery(currentSessionId);
	const { data: conversationTurns = [] } =
		useConversationTurnsQuery(currentSessionId);

	// Mutations
	const createSessionMutation = useCreateSession();
	const startSessionMutation = useStartSession();
	const endSessionMutation = useEndSession();
	const addTurnMutation = useAddTurn();
	const generateQuestionsMutation = useGenerateQuestions();

	// Derived state
	const isStarting = startSessionMutation.isPending;
	const isEnding = endSessionMutation.isPending;
	const isGeneratingQuestions = generateQuestionsMutation.isPending;
	const generatedQuestions = generateQuestionsMutation.data?.questions || [];
	const conversationAnalysis =
		generateQuestionsMutation.data?.conversationAnalysis;
	const addTurnError = addTurnMutation.error;
	const generateQuestionsError = generateQuestionsMutation.error;

	// Action functions
	const createSession = async (data: CreateSessionData) => {
		const result = await createSessionMutation.mutateAsync(data);
		setCurrentSessionId(result.id);
		return result;
	};

	const startSession = (sessionId: string) =>
		startSessionMutation.mutateAsync(sessionId);
	const endSession = (sessionId: string) =>
		endSessionMutation.mutateAsync(sessionId);
	const addConversationTurn = (turnData: {
		speaker: "interviewer" | "candidate";
		content: string;
		confidence?: number;
	}) => {
		if (!currentSessionId) return;
		return addTurnMutation.mutateAsync({
			sessionId: currentSessionId,
			turnData,
		});
	};
	const generateDynamicQuestions = (params: {
		conversationContext: string;
		questionCount?: number;
		lastFewTurns?: number;
	}) => {
		if (!currentSessionId) return;
		return generateQuestionsMutation.mutateAsync({
			sessionId: currentSessionId,
			...params,
		});
	};

	// Helper function to save accumulated transcript as a conversation turn
	const saveAccumulatedTranscript = (speaker: "interviewer" | "candidate") => {
		if (!accumulatedTranscript.trim() || !currentSessionId) return;

		addConversationTurn({
			speaker,
			content: accumulatedTranscript.trim(),
			confidence: Math.round(confidence),
		});

		// Auto-generate questions after candidate responses
		if (speaker === "candidate" && conversationTurns.length > 0) {
			const recentContext = conversationTurns
				.slice(-3)
				.map((turn) => `${turn.speaker}: ${turn.content}`)
				.join("\n");

			generateDynamicQuestions({
				conversationContext: recentContext + `\ncandidate: ${accumulatedTranscript}`,
				questionCount: 3,
				lastFewTurns: 5,
			});
		}

		// Clear accumulated transcript after saving
		setAccumulatedTranscript("");
	};

	// Speech recognition
	const {
		interimTranscript,
		isListening,
		isSupported: isSpeechSupported,
		confidence,
		error: speechError,
		startListening,
		stopListening,
	} = useSpeechRecognition({
		continuous: true,
		interimResults: true,
		onResult: handleSpeechResult,
		onEnd: handleSpeechEnd,
	});

	// Handle speech recognition results
	function handleSpeechResult(
		text: string,
		_confidenceScore: number,
		isFinal: boolean
	) {
		if (!currentSessionId || session?.status !== "in_progress") return;

		const now = Date.now();

		if (isFinal) {
			// Accumulate final results
			setAccumulatedTranscript((prev) => (prev + " " + text).trim());
			setLastSpeechTime(now);
			// Don't reset lastInterimTime here - we want to track the last interim activity
		} else if (text.trim()) {
			// Track interim results timing only when there's actual content
			// This helps distinguish between active speech and silence
			setLastInterimTime(now);
		}
	}

	// Handle manual speaker change
	const handleSpeakerChange = (newSpeaker: "interviewer" | "candidate") => {
		if (newSpeaker === currentSpeaker) return;

		// Save accumulated transcript for previous speaker before switching
		saveAccumulatedTranscript(currentSpeaker);

		// Switch to new speaker
		setCurrentSpeaker(newSpeaker);
		setLastSpeechTime(0);
		setLastInterimTime(0);
	};

	// Handle speech recognition end
	function handleSpeechEnd() {
		// Auto-restart if session is active
		if (session?.status === "in_progress" && currentSessionId) {
			setTimeout(() => {
				if (session?.status === "in_progress") {
					startListening();
				}
			}, 1000);
		}
	}

	// Auto-save transcript after 3 seconds of complete silence
	useEffect(() => {
		if (!session || session.status !== "in_progress" || !accumulatedTranscript.trim() || !lastSpeechTime) {
			return;
		}

		// Only trigger auto-save if there's been actual interim activity followed by silence
		// This prevents premature saves during natural pauses while speaking
		if (!lastInterimTime) {
			// No interim activity yet, don't auto-save (user might still be speaking)
			return;
		}

		// Set a timer to save after 3 seconds of complete silence (no final or interim results)
		const timeoutId = setTimeout(() => {
			const now = Date.now();
			const timeSinceLastSpeech = now - lastSpeechTime;
			const timeSinceLastInterim = now - lastInterimTime;

			// Save only if BOTH final and interim results have stopped for 3+ seconds
			// This indicates true end of speech, not just a pause
			if (timeSinceLastSpeech >= 3000 && timeSinceLastInterim >= 3000) {
				saveAccumulatedTranscript(currentSpeaker);
				setLastSpeechTime(0);
				setLastInterimTime(0);
			}
		}, 3100); // Check slightly after 3 seconds to ensure we meet the threshold

		return () => clearTimeout(timeoutId);
	}, [session, accumulatedTranscript, lastSpeechTime, lastInterimTime, currentSpeaker, saveAccumulatedTranscript]);

	// Start new interview session
	const handleStartNewSession = async (sessionData: CreateSessionData) => {
		try {
			await createSession(sessionData);
			setShowSetupModal(false);
		} catch (error) {
			console.error("Failed to create session:", error);
		}
	};

	// Start interview
	const handleStartInterview = async () => {
		if (!currentSessionId) return;

		try {
			await startSession(currentSessionId);
			if (isSpeechSupported) {
				startListening();
			}
		} catch (error) {
			console.error("Failed to start interview:", error);
		}
	};

	// End interview
	const handleEndInterview = async () => {
		if (!currentSessionId) return;

		try {
			stopListening();
			await endSession(currentSessionId);
		} catch (error) {
			console.error("Failed to end interview:", error);
		}
	};

	// Loading state
	if (
		isLoadingApplicants ||
		isLoadingJobPosts ||
		isLoadingResumes ||
		isLoadingSession
	) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center space-y-2">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					<p className="text-muted-foreground">
						Loading interview dashboard...
					</p>
				</div>
			</div>
		);
	}

	// No session state
	if (!currentSessionId) {
		return (
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Live Interview Assistant
						</CardTitle>
						<CardDescription>
							Create a new interview session to begin real-time conversation
							analysis
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button onClick={() => setShowSetupModal(true)} size="lg">
							<Play className="h-4 w-4 mr-2" />
							Start New Interview
						</Button>
					</CardContent>
				</Card>

				<SessionSetupModal
					isOpen={showSetupModal}
					onClose={() => setShowSetupModal(false)}
					onSubmit={handleStartNewSession}
					applicants={applicants}
					jobPosts={jobPosts}
					resumeFiles={resumeFiles}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Session Header */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<CardTitle className="flex items-center gap-2">
								<MessageSquare className="h-5 w-5" />
								{session?.title}
							</CardTitle>
							<CardDescription>
								{session?.applicant.firstName} {session?.applicant.lastName} -{" "}
								{session?.jobPost.title}
							</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Badge
								variant={
									session?.status === "in_progress" ? "default" : "secondary"
								}
								className="flex items-center gap-1"
							>
								<Clock className="h-3 w-3" />
								{session?.status}
							</Badge>
							{session?.interviewType && (
								<Badge variant="outline">{session.interviewType}</Badge>
							)}
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* Speech Recognition Status */}
			{!isSpeechSupported && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Speech recognition is not supported in your browser. You can still
						manually add conversation turns.
					</AlertDescription>
				</Alert>
			)}

			{speechError && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Speech recognition error: {speechError}
					</AlertDescription>
				</Alert>
			)}

			{/* Main Interview Interface */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Transcript */}
				<div className="lg:col-span-2 space-y-4">
					<LiveTranscript
						conversationTurns={conversationTurns}
						currentTranscript={accumulatedTranscript}
						interimTranscript={interimTranscript}
						currentSpeaker={currentSpeaker}
						isListening={isListening}
						confidence={confidence}
					/>

					<InterviewControls
						session={session}
						isListening={isListening}
						currentSpeaker={currentSpeaker}
						onSpeakerChange={handleSpeakerChange}
						onStartInterview={handleStartInterview}
						onEndInterview={handleEndInterview}
						onToggleListening={() =>
							isListening ? stopListening() : startListening()
						}
						isStarting={isStarting}
						isEnding={isEnding}
						isSpeechSupported={isSpeechSupported}
					/>
				</div>

				{/* Right Column - Question Suggestions */}
				<div className="space-y-4">
					<QuestionSuggestions
						questions={generatedQuestions}
						conversationAnalysis={conversationAnalysis}
						isGenerating={isGeneratingQuestions}
						onGenerateQuestions={() => {
							if (conversationTurns.length > 0) {
								const recentContext = conversationTurns
									.slice(-5)
									.map((turn) => `${turn.speaker}: ${turn.content}`)
									.join("\n");
								generateDynamicQuestions({
									conversationContext: recentContext,
									questionCount: 5,
								});
							}
						}}
						error={generateQuestionsError}
					/>
				</div>
			</div>

			{/* Session Complete */}
			{session?.status === "completed" && (
				<SessionSummary
					session={session}
					conversationTurns={conversationTurns}
					conversationAnalysis={conversationAnalysis}
				/>
			)}

			{/* Error Alerts */}
			{sessionError && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Session error: {sessionError.message}
					</AlertDescription>
				</Alert>
			)}

			{addTurnError && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Failed to add conversation turn: {addTurnError.message}
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}
