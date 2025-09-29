import { geminiAI } from './gemini';

// Enhanced AI Service for T-Wenza using Gemini API
export class AIService {
  private static instance: AIService;
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Chat responses using Gemini AI
  async getChatResponse(message: string, context?: any): Promise<string> {
    try {
      return await geminiAI.getChatResponse(message, context);
    } catch (error) {
      console.error('AI chat error:', error);
      return this.getFallbackChatResponse(message);
    }
  }

  // Generate flashcards from text content using Gemini
  async generateFlashcards(content: string): Promise<Array<{front: string, back: string}>> {
    try {
      return await geminiAI.generateFlashcards(content);
    } catch (error) {
      console.error('Flashcard generation error:', error);
      return this.getFallbackFlashcards();
    }
  }

  // Generate summary from content using Gemini
  async generateSummary(content: string): Promise<string> {
    try {
      return await geminiAI.generateSummary(content);
    } catch (error) {
      console.error('Summary generation error:', error);
      return this.getFallbackSummary();
    }
  }

  // Generate quiz questions using Gemini
  async generateQuiz(content: string): Promise<Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>> {
    try {
      return await geminiAI.generateQuiz(content);
    } catch (error) {
      console.error('Quiz generation error:', error);
      return this.getFallbackQuiz();
    }
  }

  // Get personalized recommendations using Gemini
  async getRecommendations(userProfile: any, progress: any): Promise<Array<{
    type: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>> {
    try {
      return await geminiAI.getPersonalizedRecommendations(userProfile, progress);
    } catch (error) {
      console.error('Recommendations error:', error);
      return this.getFallbackRecommendations();
    }
  }

  // Enhanced content analysis using Gemini
  async analyzeContent(content: string): Promise<{
    summary: string;
    keyTopics: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedReadTime: number;
  }> {
    try {
      const prompt = `
        Analyze the following educational content and provide:
        1. A brief summary
        2. Key topics covered (as an array)
        3. Difficulty level (beginner/intermediate/advanced)
        4. Estimated reading time in minutes
        
        Content: ${content}
        
        Format as JSON: {"summary": "...", "keyTopics": [...], "difficulty": "...", "estimatedReadTime": number}
      `;

      const response = await geminiAI.generateText(prompt);
      
      // Try to parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error('Failed to parse content analysis:', parseError);
        }
      }

      // Fallback analysis
      return {
        summary: "This content covers important educational concepts and provides valuable learning material.",
        keyTopics: ["Key Concepts", "Important Information", "Learning Objectives"],
        difficulty: 'intermediate' as const,
        estimatedReadTime: Math.max(1, Math.floor(content.length / 200))
      };
    } catch (error) {
      console.error('Content analysis error:', error);
      return {
        summary: "Content analysis unavailable at the moment.",
        keyTopics: ["General Topics"],
        difficulty: 'intermediate' as const,
        estimatedReadTime: 5
      };
    }
  }

  // Study plan generation using Gemini
  async generateStudyPlan(userProfile: any, goals: string[], timeframe: string): Promise<{
    plan: Array<{
      week: number;
      topics: string[];
      activities: string[];
      goals: string[];
    }>;
    tips: string[];
  }> {
    try {
      const prompt = `
        Create a personalized study plan based on:
        - User Profile: ${JSON.stringify(userProfile)}
        - Learning Goals: ${goals.join(', ')}
        - Timeframe: ${timeframe}
        
        Provide a week-by-week breakdown with topics, activities, and goals.
        Include study tips and best practices.
        
        Format as JSON with "plan" array and "tips" array.
      `;

      const response = await geminiAI.generateText(prompt);
      
      // Try to parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error('Failed to parse study plan:', parseError);
        }
      }

      // Fallback study plan
      return this.getFallbackStudyPlan();
    } catch (error) {
      console.error('Study plan generation error:', error);
      return this.getFallbackStudyPlan();
    }
  }

  // Fallback methods
  private getFallbackChatResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hi there! I'm Wenza, your AI learning companion. How can I help you today?";
    } else if (lowerMessage.includes('help')) {
      return "I'm here to assist with your learning journey! I can help with course recommendations, study planning, and answering questions.";
    } else {
      return "That's an interesting question! Let me help you with that. What specific topic would you like to explore?";
    }
  }

  private getFallbackFlashcards(): Array<{front: string, back: string}> {
    return [
      {
        front: "What is personalized learning?",
        back: "An educational approach that customizes learning experiences to individual student needs, preferences, and pace."
      },
      {
        front: "How does AI enhance education?",
        back: "AI provides personalized recommendations, adaptive content, intelligent tutoring, and data-driven insights to improve learning outcomes."
      }
    ];
  }

  private getFallbackSummary(): string {
    return "This content provides valuable educational information covering key concepts and practical applications. The material is designed to enhance understanding and support effective learning.";
  }

  private getFallbackQuiz(): Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }> {
    return [
      {
        question: "What is the main benefit of AI in education?",
        options: [
          "Replacing teachers",
          "Personalizing learning experiences",
          "Making education more expensive",
          "Eliminating homework"
        ],
        correctAnswer: 1,
        explanation: "AI's main benefit in education is personalizing learning experiences to meet individual student needs."
      }
    ];
  }

  private getFallbackRecommendations(): Array<{
    type: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    return [
      {
        type: 'course',
        title: 'Continue Current Learning Path',
        description: 'Focus on completing your current courses to maintain momentum.',
        priority: 'high'
      },
      {
        type: 'practice',
        title: 'Daily Study Routine',
        description: 'Establish a consistent daily learning habit for better retention.',
        priority: 'medium'
      }
    ];
  }

  private getFallbackStudyPlan(): {
    plan: Array<{
      week: number;
      topics: string[];
      activities: string[];
      goals: string[];
    }>;
    tips: string[];
  } {
    return {
      plan: [
        {
          week: 1,
          topics: ["Foundation Concepts", "Basic Principles"],
          activities: ["Read introductory materials", "Complete practice exercises"],
          goals: ["Understand core concepts", "Complete initial assessments"]
        },
        {
          week: 2,
          topics: ["Intermediate Concepts", "Practical Applications"],
          activities: ["Work on projects", "Join study groups"],
          goals: ["Apply knowledge practically", "Collaborate with peers"]
        }
      ],
      tips: [
        "Set aside dedicated study time each day",
        "Take regular breaks to maintain focus",
        "Practice active recall and spaced repetition",
        "Connect with fellow learners for support"
      ]
    };
  }
}

export const aiService = AIService.getInstance();