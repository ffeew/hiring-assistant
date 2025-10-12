"use client";

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Mic, 
  MicOff, 
  User, 
  UserCheck,
  Clock,
  Signal,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ConversationTurn {
  id: string;
  speaker: 'interviewer' | 'candidate';
  content: string;
  timestamp: string;
  confidence?: number;
  duration?: number;
}

interface LiveTranscriptProps {
  conversationTurns: ConversationTurn[];
  currentTranscript: string;
  interimTranscript: string;
  currentSpeaker: 'interviewer' | 'candidate';
  isListening: boolean;
  confidence: number;
}

export function LiveTranscript({
  conversationTurns,
  currentTranscript,
  interimTranscript,
  currentSpeaker,
  isListening,
  confidence,
}: LiveTranscriptProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationTurns, interimTranscript]);

  const getSpeakerIcon = (speaker: string) => {
    return speaker === 'interviewer' ? UserCheck : User;
  };

  const getSpeakerColor = (speaker: string) => {
    return speaker === 'interviewer' 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const formatConfidence = (confidence?: number) => {
    if (!confidence) return null;
    const color = confidence >= 80 ? 'text-green-600' : confidence >= 60 ? 'text-yellow-600' : 'text-red-600';
    return (
      <span className={`text-xs ${color} flex items-center gap-1`}>
        <Signal className="h-3 w-3" />
        {confidence}%
      </span>
    );
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Live Transcript
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isListening ? 'default' : 'secondary'} className="flex items-center gap-1">
              {isListening ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
              {isListening ? 'Listening' : 'Paused'}
            </Badge>
            {confidence > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Signal className="h-3 w-3" />
                {confidence}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {conversationTurns.length === 0 && !currentTranscript && !interimTranscript && (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No conversation yet</p>
                <p className="text-sm">Start the interview to begin transcription</p>
              </div>
            )}

            {conversationTurns.map((turn, index) => {
              const SpeakerIcon = getSpeakerIcon(turn.speaker);
              
              return (
                <div key={turn.id} className="group">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <SpeakerIcon className="h-4 w-4" />
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={getSpeakerColor(turn.speaker)}
                        >
                          {turn.speaker === 'interviewer' ? 'Interviewer' : 'Candidate'}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(turn.timestamp), { addSuffix: true })}
                        </span>
                        {formatConfidence(turn.confidence)}
                      </div>
                      
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm leading-relaxed break-words overflow-wrap-anywhere">{turn.content}</p>
                      </div>
                      
                      {turn.duration && (
                        <span className="text-xs text-muted-foreground">
                          Duration: {(turn.duration / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {index < conversationTurns.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              );
            })}

            {/* Current/Interim transcript */}
            {(currentTranscript || interimTranscript) && (() => {
              const CurrentSpeakerIcon = getSpeakerIcon(currentSpeaker);
              return (
                <>
                  {conversationTurns.length > 0 && <Separator className="my-4" />}
                  <div className="group">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <CurrentSpeakerIcon className="h-4 w-4" />
                        </div>
                      </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={getSpeakerColor(currentSpeaker)}
                        >
                          {currentSpeaker === 'interviewer' ? 'Interviewer' : 'Candidate'}
                        </Badge>
                        <Badge variant="secondary" className="animate-pulse">
                          {interimTranscript ? 'Speaking...' : 'Processing...'}
                        </Badge>
                      </div>
                      
                      <div className="bg-muted/30 rounded-lg p-3 border-2 border-dashed border-muted">
                        <p className="text-sm leading-relaxed break-words overflow-wrap-anywhere">
                          {currentTranscript}
                          {interimTranscript && (
                            <span className="text-muted-foreground italic">
                              {currentTranscript && ' '}
                              {interimTranscript}
                              <span className="animate-pulse">|</span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
              );
            })()}

            <div ref={endOfMessagesRef} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}