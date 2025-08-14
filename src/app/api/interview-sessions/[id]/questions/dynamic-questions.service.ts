import { groq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import {
  safeParseJSON,
  requirementsSchema,
  responsibilitiesSchema
} from '@/lib/json-utils';

// Dynamic question generation schema
const dynamicQuestionsSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    category: z.enum(['technical', 'experience', 'soft_skills', 'verification', 'follow_up', 'clarification']),
    reasoning: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    timing: z.enum(['immediate', 'later', 'if_time_permits']),
    context: z.string(), // What part of conversation triggered this question
    expectedResponse: z.string(),
  })),
  conversationAnalysis: z.object({
    candidateEngagement: z.enum(['high', 'medium', 'low']),
    technicalDepth: z.enum(['excellent', 'good', 'superficial', 'unclear']),
    areasExplored: z.array(z.string()),
    gapsIdentified: z.array(z.string()),
    redFlags: z.array(z.string()).optional(),
    strengths: z.array(z.string()).optional(),
  })
});

interface SessionData {
  id: string;
  title: string;
  status: string;
  interviewType: string;
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  jobPost: {
    id: string;
    title: string;
    department: string | null;
    description: string;
    requirements: string | null;
    responsibilities: string | null;
  };
  resumeFile?: {
    id: string;
    fileName: string;
    resumeContent: string | null;
  } | null;
}

interface ConversationTurn {
  id: string;
  speaker: string;
  content: string;
  timestamp: Date;
  turnOrder: number;
  generatedQuestions: Array<Array<{ question: string; category: string; reasoning: string; expectedResponse: string; exampleResponse: string; }>>;
  questionSuggestions: Array<Array<{ question: string; category: string; reasoning: string; expectedResponse: string; exampleResponse: string; }>>;
  analysis: Record<string, string | number | boolean | null> | null;
  confidence: number | null;
}

interface GenerateDynamicQuestionsParams {
  sessionData: SessionData;
  conversationTurns: ConversationTurn[];
  questionCount: number;
  focusAreas?: string[];
  lastFewTurns: number;
}

// ============================================================================
// DYNAMIC QUESTIONS SERVICE
// ============================================================================

export class DynamicQuestionsService {
  /**
   * Generate dynamic questions based on conversation context
   */
  static async generateDynamicQuestions(params: GenerateDynamicQuestionsParams) {
    const { sessionData, conversationTurns, questionCount, focusAreas, lastFewTurns } = params;

    // Get recent conversation context
    const recentTurns = conversationTurns.slice(-lastFewTurns);
    const conversationContext = recentTurns
      .map(turn => `${turn.speaker}: ${turn.content}`)
      .join('\n');

    // Parse job requirements
    const requirements = safeParseJSON(sessionData.jobPost.requirements, requirementsSchema, []);
    const responsibilities = safeParseJSON(sessionData.jobPost.responsibilities, responsibilitiesSchema, []);

    // Build conversation summary
    const conversationSummary = this.buildConversationSummary(conversationTurns);

    const prompt = `You are an expert interviewer assistant analyzing a live interview conversation. Generate ${questionCount} dynamic follow-up questions based on the conversation flow and candidate responses.

INTERVIEW CONTEXT:
Position: ${sessionData.jobPost.title}
Department: ${sessionData.jobPost.department || 'Not specified'}
Candidate: ${sessionData.applicant.firstName} ${sessionData.applicant.lastName}
Interview Type: ${sessionData.interviewType}

JOB REQUIREMENTS:
${requirements.join(', ')}

JOB RESPONSIBILITIES:
${responsibilities.join(', ')}

RESUME CONTENT:
${sessionData.resumeFile?.resumeContent || 'No resume content available'}

CONVERSATION SUMMARY:
Total turns: ${conversationTurns.length}
Recent conversation (last ${lastFewTurns} turns):
${conversationContext}

FULL CONVERSATION ANALYSIS:
${conversationSummary}

FOCUS AREAS: ${focusAreas?.join(', ') || 'All areas (technical, experience, soft_skills, verification)'}

INSTRUCTIONS:
Analyze the conversation and generate questions that:

1. **Follow-up on vague or incomplete answers** - If candidate was unclear, ask for specifics
2. **Dig deeper into interesting points** - Explore areas where candidate showed expertise
3. **Verify claims and experience** - Ask for concrete examples of mentioned skills/experience
4. **Identify gaps** - Address job requirements not yet covered in conversation
5. **Probe for red flags** - Follow up on concerning responses or inconsistencies
6. **Assess problem-solving** - Generate scenario-based questions relevant to role
7. **Cultural fit** - Questions about work style, team collaboration, conflict resolution

For each question, provide:
- The specific question to ask
- Category (technical, experience, soft_skills, verification, follow_up, clarification)
- Reasoning for why this question is important NOW
- Priority level (high = must ask, medium = should ask, low = nice to have)
- Timing (immediate = ask next, later = ask in 5-10 minutes, if_time_permits = only if extra time)
- Context (what part of conversation triggered this)
- Expected response indicators

Also provide conversation analysis including:
- Candidate engagement level
- Technical depth demonstrated
- Areas already explored
- Gaps identified that need coverage
- Potential red flags or concerns
- Candidate strengths observed

IMPORTANT:
- Make questions conversational and natural, not interrogative
- Build on what was just said in recent turns
- Prioritize questions that address the most critical gaps
- Avoid repeating topics already thoroughly covered
- Consider interview timing and candidate energy level
- Generate questions that feel organic to the conversation flow`;

    try {
      const result = await generateObject({
        model: groq("openai/gpt-oss-120b"),
        prompt,
        schema: dynamicQuestionsSchema,
      });

      // Sort questions by priority and timing
      const sortedQuestions = result.object.questions.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const timingOrder = { immediate: 0, later: 1, if_time_permits: 2 };

        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return timingOrder[a.timing] - timingOrder[b.timing];
      });

      return {
        questions: sortedQuestions,
        conversationAnalysis: result.object.conversationAnalysis,
        metadata: {
          generatedAt: new Date().toISOString(),
          conversationLength: conversationTurns.length,
          recentContext: recentTurns.length,
          requestedCount: questionCount,
          actualCount: sortedQuestions.length,
        }
      };
    } catch (error) {
      console.error('Error generating dynamic questions:', error);
      throw new Error('Failed to generate dynamic questions. Please try again.');
    }
  }

  /**
   * Build a summary of the conversation for AI analysis
   */
  private static buildConversationSummary(conversationTurns: ConversationTurn[]): string {
    if (conversationTurns.length === 0) {
      return 'No conversation has taken place yet.';
    }

    const totalTurns = conversationTurns.length;
    const candidateTurns = conversationTurns.filter(turn => turn.speaker === 'candidate');
    const interviewerTurns = conversationTurns.filter(turn => turn.speaker === 'interviewer');

    const summary = [
      `Total conversation turns: ${totalTurns}`,
      `Interviewer turns: ${interviewerTurns.length}`,
      `Candidate turns: ${candidateTurns.length}`,
      '',
      'Key conversation topics covered:',
    ];

    // Extract key topics from conversation (simplified approach)
    const allContent = conversationTurns.map(turn => turn.content).join(' ');
    const topics = this.extractTopics(allContent);
    summary.push(...topics.map(topic => `- ${topic}`));

    // Add recent conversation flow
    if (conversationTurns.length > 0) {
      summary.push('', 'Recent conversation flow:');
      const recentTurns = conversationTurns.slice(-6); // Last 6 turns
      recentTurns.forEach((turn) => {
        const truncatedContent = turn.content.length > 100
          ? turn.content.substring(0, 100) + '...'
          : turn.content;
        summary.push(`${turn.speaker}: ${truncatedContent}`);
      });
    }

    return summary.join('\n');
  }

  /**
   * Simple topic extraction from conversation content
   */
  private static extractTopics(content: string): string[] {
    const keywords = [
      'experience', 'project', 'team', 'technology', 'programming', 'development',
      'design', 'problem', 'solution', 'challenge', 'achievement', 'leadership',
      'collaboration', 'communication', 'skill', 'learning', 'growth', 'career',
      'education', 'certification', 'framework', 'database', 'api', 'testing',
      'deployment', 'architecture', 'performance', 'security', 'agile', 'scrum'
    ];

    const foundTopics = new Set<string>();
    const lowerContent = content.toLowerCase();

    keywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        foundTopics.add(keyword);
      }
    });

    return Array.from(foundTopics).slice(0, 8); // Return up to 8 topics
  }
}