"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Play, 
  Square, 
  Mic, 
  MicOff, 
  User, 
  UserCheck,
  Settings,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface InterviewSession {
  id: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  startTime?: string;
  endTime?: string;
}

interface InterviewControlsProps {
  session: InterviewSession | undefined;
  isListening: boolean;
  currentSpeaker: 'interviewer' | 'candidate';
  onSpeakerChange: (speaker: 'interviewer' | 'candidate') => void;
  onStartInterview: () => void;
  onEndInterview: () => void;
  onToggleListening: () => void;
  isStarting: boolean;
  isEnding: boolean;
  isSpeechSupported: boolean;
}

export function InterviewControls({
  session,
  isListening,
  currentSpeaker,
  onSpeakerChange,
  onStartInterview,
  onEndInterview,
  onToggleListening,
  isStarting,
  isEnding,
  isSpeechSupported,
}: InterviewControlsProps) {
  const canStart = session?.status === 'scheduled';
  const canEnd = session?.status === 'in_progress';
  const isInProgress = session?.status === 'in_progress';

  const formatTime = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Session controls */}
          <div className="flex items-center gap-3">
            {canStart && (
              <Button
                onClick={onStartInterview}
                disabled={isStarting}
                size="lg"
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {isStarting ? 'Starting...' : 'Start Interview'}
              </Button>
            )}

            {canEnd && (
              <Button
                onClick={onEndInterview}
                disabled={isEnding}
                variant="destructive"
                size="lg"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                {isEnding ? 'Ending...' : 'End Interview'}
              </Button>
            )}

            {/* Session timing */}
            {session?.startTime && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Started: {formatTime(session.startTime)}
                {session.endTime && (
                  <span>• Ended: {formatTime(session.endTime)}</span>
                )}
              </div>
            )}
          </div>

          {/* Right side - Audio controls */}
          <div className="flex items-center gap-3">
            {/* Speaker selection */}
            {isInProgress && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Current Speaker:</span>
                <Select
                  value={currentSpeaker}
                  onValueChange={onSpeakerChange}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interviewer">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Interviewer
                      </div>
                    </SelectItem>
                    <SelectItem value="candidate">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Candidate
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Microphone controls */}
            {isInProgress && isSpeechSupported && (
              <Button
                onClick={onToggleListening}
                variant={isListening ? 'default' : 'outline'}
                size="lg"
                className="flex items-center gap-2"
              >
                {isListening ? (
                  <>
                    <Mic className="h-4 w-4" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <MicOff className="h-4 w-4" />
                    Start Listening
                  </>
                )}
              </Button>
            )}

            {/* Speech recognition status */}
            {isInProgress && (
              <div className="flex items-center gap-2">
                {isSpeechSupported ? (
                  <Badge 
                    variant={isListening ? 'default' : 'secondary'}
                    className="flex items-center gap-1"
                  >
                    {isListening ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                    Audio: {isListening ? 'Active' : 'Inactive'}
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Audio: Not Supported
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        {isInProgress && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <Settings className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Instructions:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Select the current speaker before they talk</li>
                  {isSpeechSupported ? (
                    <li>Speech recognition will automatically capture conversation</li>
                  ) : (
                    <li>Manual conversation entry is required (speech not supported)</li>
                  )}
                  <li>AI will generate follow-up questions based on responses</li>
                  <li>Use the question suggestions to guide your interview</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Pre-interview instructions */}
        {canStart && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Play className="h-4 w-4 mt-0.5 text-blue-600" />
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p><strong>Ready to start?</strong></p>
                <p>Click &quot;Start Interview&quot; to begin real-time conversation analysis and question generation.</p>
                {!isSpeechSupported && (
                  <p className="text-yellow-600">Note: Speech recognition is not supported in your browser.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}