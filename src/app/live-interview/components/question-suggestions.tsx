"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Lightbulb, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Eye,
  Clock,
  Target,
  MessageCircle,
  Brain,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface DynamicQuestion {
  question: string;
  category: 'technical' | 'experience' | 'soft_skills' | 'verification' | 'follow_up' | 'clarification';
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  timing: 'immediate' | 'later' | 'if_time_permits';
  context: string;
  expectedResponse: string;
}

interface ConversationAnalysis {
  candidateEngagement: 'high' | 'medium' | 'low';
  technicalDepth: 'excellent' | 'good' | 'superficial' | 'unclear';
  areasExplored: string[];
  gapsIdentified: string[];
  redFlags?: string[];
  strengths?: string[];
}

interface QuestionSuggestionsProps {
  questions: DynamicQuestion[];
  conversationAnalysis?: ConversationAnalysis;
  isGenerating: boolean;
  onGenerateQuestions: () => void;
  error: Error | null;
}

const categoryConfig = {
  technical: { icon: Brain, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  experience: { icon: TrendingUp, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  soft_skills: { icon: MessageCircle, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  verification: { icon: CheckCircle, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  follow_up: { icon: Eye, color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  clarification: { icon: AlertCircle, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
};

const priorityConfig = {
  high: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: AlertTriangle },
  medium: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
  low: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: Target },
};

const timingConfig = {
  immediate: { label: 'Ask Now', color: 'bg-red-500' },
  later: { label: 'Ask Later', color: 'bg-yellow-500' },
  if_time_permits: { label: 'If Time Permits', color: 'bg-gray-500' },
};

export function QuestionSuggestions({
  questions,
  conversationAnalysis,
  isGenerating,
  onGenerateQuestions,
  error,
}: QuestionSuggestionsProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [showAnalysis, setShowAnalysis] = useState(false);

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  // Group questions by priority and timing
  const groupedQuestions = questions.reduce((acc, question, index) => {
    const key = `${question.priority}-${question.timing}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push({ ...question, index });
    return acc;
  }, {} as Record<string, Array<DynamicQuestion & { index: number }>>);

  // Sort groups by priority and timing
  const sortedGroups = Object.entries(groupedQuestions).sort(([a], [b]) => {
    const [aPriority, aTiming] = a.split('-');
    const [bPriority, bTiming] = b.split('-');
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const timingOrder = { immediate: 0, later: 1, if_time_permits: 2 };
    
    if (priorityOrder[aPriority as keyof typeof priorityOrder] !== priorityOrder[bPriority as keyof typeof priorityOrder]) {
      return priorityOrder[aPriority as keyof typeof priorityOrder] - priorityOrder[bPriority as keyof typeof priorityOrder];
    }
    return timingOrder[aTiming as keyof typeof timingOrder] - timingOrder[bTiming as keyof typeof timingOrder];
  });

  return (
    <div className="space-y-4">
      {/* Question Suggestions Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Question Suggestions
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateQuestions}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to generate questions: {error.message}
              </AlertDescription>
            </Alert>
          )}

          {questions.length === 0 && !isGenerating && (
            <div className="text-center text-muted-foreground py-6">
              <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No questions generated yet</p>
              <p className="text-sm">Start the conversation to get AI-powered suggestions</p>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Analyzing conversation and generating questions...</p>
            </div>
          )}

          {questions.length > 0 && (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {sortedGroups.map(([groupKey, groupQuestions]) => {
                  const [priority, timing] = groupKey.split('-');
                  
                  return (
                    <div key={groupKey} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <div className={`w-2 h-2 rounded-full ${timingConfig[timing as keyof typeof timingConfig].color}`} />
                        {timingConfig[timing as keyof typeof timingConfig].label}
                        <Badge 
                          variant="outline" 
                          className={priorityConfig[priority as keyof typeof priorityConfig].color}
                        >
                          {priority} priority
                        </Badge>
                      </div>

                      {groupQuestions.map((question) => {
                        const categoryConfig_ = categoryConfig[question.category];
                        const isExpanded = expandedQuestions.has(question.index);

                        return (
                          <Collapsible key={question.index}>
                            <CollapsibleTrigger
                              className="w-full"
                              onClick={() => toggleQuestion(question.index)}
                            >
                              <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left">
                                <div className="flex-shrink-0 mt-0.5">
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </div>
                                
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant="outline" 
                                      className={categoryConfig_.color}
                                    >
                                      <categoryConfig_.icon className="h-3 w-3 mr-1" />
                                      {question.category.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  
                                  <p className="font-medium text-sm">{question.question}</p>
                                  
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {question.reasoning}
                                  </p>
                                </div>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="px-3 pb-3">
                              <div className="bg-muted/30 rounded-lg p-3 space-y-3 text-sm">
                                <div>
                                  <span className="font-medium">Context:</span>
                                  <p className="text-muted-foreground mt-1">{question.context}</p>
                                </div>
                                
                                <Separator />
                                
                                <div>
                                  <span className="font-medium">Expected Response:</span>
                                  <p className="text-muted-foreground mt-1">{question.expectedResponse}</p>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Conversation Analysis Card */}
      {conversationAnalysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Conversation Analysis
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnalysis(!showAnalysis)}
              >
                {showAnalysis ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>

          {showAnalysis && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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

              {conversationAnalysis.areasExplored.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Areas Explored</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {conversationAnalysis.areasExplored.map((area, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {conversationAnalysis.gapsIdentified.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Gaps to Address</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {conversationAnalysis.gapsIdentified.map((gap, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-yellow-500">
                        {gap}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {conversationAnalysis.redFlags && conversationAnalysis.redFlags.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <span className="font-medium">Red Flags Identified:</span>
                    <ul className="list-disc list-inside mt-1">
                      {conversationAnalysis.redFlags.map((flag, index) => (
                        <li key={index} className="text-sm">{flag}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {conversationAnalysis.strengths && conversationAnalysis.strengths.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Candidate Strengths</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {conversationAnalysis.strengths.map((strength, index) => (
                      <Badge key={index} variant="default" className="text-xs bg-green-500">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}