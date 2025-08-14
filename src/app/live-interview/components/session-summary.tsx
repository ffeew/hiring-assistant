"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Clock, 
  MessageSquare, 
  User, 
  TrendingUp,
  Download,
  Copy,
  CheckCircle,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { differenceInMinutes } from 'date-fns';

interface InterviewSession {
  id: string;
  title: string;
  startTime?: string;
  endTime?: string;
  applicant: {
    firstName: string;
    lastName: string;
    email: string;
  };
  jobPost: {
    title: string;
    department?: string;
  };
}

interface ConversationTurn {
  id: string;
  speaker: 'interviewer' | 'candidate';
  content: string;
  timestamp: string;
  confidence?: number;
}

interface ConversationAnalysis {
  candidateEngagement: 'high' | 'medium' | 'low';
  technicalDepth: 'excellent' | 'good' | 'superficial' | 'unclear';
  areasExplored: string[];
  gapsIdentified: string[];
  redFlags?: string[];
  strengths?: string[];
}

interface SessionSummaryProps {
  session: InterviewSession;
  conversationTurns: ConversationTurn[];
  conversationAnalysis?: ConversationAnalysis;
}

export function SessionSummary({
  session,
  conversationTurns,
  conversationAnalysis,
}: SessionSummaryProps) {
  const duration = session.startTime && session.endTime 
    ? differenceInMinutes(new Date(session.endTime), new Date(session.startTime))
    : 0;

  const candidateTurns = conversationTurns.filter(turn => turn.speaker === 'candidate');
  const interviewerTurns = conversationTurns.filter(turn => turn.speaker === 'interviewer');

  const averageConfidence = candidateTurns.length > 0
    ? candidateTurns.reduce((sum, turn) => sum + (turn.confidence || 0), 0) / candidateTurns.length
    : 0;

  const handleExportTranscript = () => {
    const transcript = conversationTurns
      .map(turn => `${turn.speaker.toUpperCase()}: ${turn.content}`)
      .join('\n\n');
    
    const content = `Interview Transcript
Session: ${session.title}
Candidate: ${session.applicant.firstName} ${session.applicant.lastName}
Position: ${session.jobPost.title}
Date: ${session.startTime ? new Date(session.startTime).toLocaleDateString() : 'N/A'}
Duration: ${duration} minutes

${transcript}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-transcript-${session.applicant.lastName}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyTranscript = async () => {
    const transcript = conversationTurns
      .map(turn => `${turn.speaker.toUpperCase()}: ${turn.content}`)
      .join('\n\n');
    
    try {
      await navigator.clipboard.writeText(transcript);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy transcript:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Interview Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Session Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{duration}</div>
            <div className="text-sm text-muted-foreground">Minutes</div>
          </div>
          
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{conversationTurns.length}</div>
            <div className="text-sm text-muted-foreground">Total Turns</div>
          </div>
          
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{Math.round(averageConfidence)}%</div>
            <div className="text-sm text-muted-foreground">Avg Confidence</div>
          </div>
        </div>

        {/* Participant Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5" />
              <span className="font-medium">Interviewer</span>
            </div>
            <div className="space-y-1 text-sm">
              <div>Questions asked: {interviewerTurns.length}</div>
              <div>Speaking time: {Math.round((interviewerTurns.length / conversationTurns.length) * 100)}%</div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5" />
              <span className="font-medium">Candidate</span>
            </div>
            <div className="space-y-1 text-sm">
              <div>Responses given: {candidateTurns.length}</div>
              <div>Speaking time: {Math.round((candidateTurns.length / conversationTurns.length) * 100)}%</div>
            </div>
          </div>
        </div>

        {/* Conversation Analysis */}
        {conversationAnalysis && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium mb-4">AI Analysis</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium">Candidate Engagement</span>
                  <Badge 
                    variant={conversationAnalysis.candidateEngagement === 'high' ? 'default' : 'outline'}
                    className="ml-2"
                  >
                    {conversationAnalysis.candidateEngagement}
                  </Badge>
                </div>
                
                <div>
                  <span className="text-sm font-medium">Technical Depth</span>
                  <Badge 
                    variant={conversationAnalysis.technicalDepth === 'excellent' ? 'default' : 'outline'}
                    className="ml-2"
                  >
                    {conversationAnalysis.technicalDepth}
                  </Badge>
                </div>
              </div>

              {conversationAnalysis.strengths && conversationAnalysis.strengths.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm font-medium flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Candidate Strengths
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {conversationAnalysis.strengths.map((strength, index) => (
                      <Badge key={index} variant="default" className="text-xs bg-green-500">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {conversationAnalysis.gapsIdentified.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm font-medium flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Areas Not Covered
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {conversationAnalysis.gapsIdentified.map((gap, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-yellow-500">
                        {gap}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {conversationAnalysis.redFlags && conversationAnalysis.redFlags.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm font-medium flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Red Flags
                  </span>
                  <div className="space-y-1">
                    {conversationAnalysis.redFlags.map((flag, index) => (
                      <div key={index} className="text-sm bg-red-50 dark:bg-red-950/20 p-2 rounded border-l-2 border-red-500">
                        {flag}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Actions */}
        <Separator />
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportTranscript}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Transcript
          </Button>
          
          <Button
            onClick={handleCopyTranscript}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Transcript
          </Button>
        </div>

        {/* Recent Conversation Preview */}
        <div>
          <h4 className="font-medium mb-3">Recent Conversation</h4>
          <ScrollArea className="h-40 border rounded-lg p-3">
            <div className="space-y-2">
              {conversationTurns.slice(-5).map((turn) => (
                <div key={turn.id} className="text-sm">
                  <span className="font-medium text-muted-foreground">
                    {turn.speaker === 'interviewer' ? 'Interviewer' : 'Candidate'}:
                  </span>
                  <span className="ml-2">{turn.content}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}