// Gemini AI Service for T-Wenza
export class GeminiAIService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('Gemini API key not found. AI features will use fallback responses.');
    }
  }

  private async makeRequest(endpoint: string, data: any) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/${endpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    return response.json();
  }

  async generateText(prompt: string, context?: string): Promise<string> {
    try {
      const fullPrompt = context 
        ? `Context: ${context}\n\nUser Question: ${prompt}\n\nPlease provide a helpful, educational response as Wenza, the AI learning companion for T-Wenza platform.`
        : `As Wenza, the AI learning companion for T-Wenza educational platform, please respond to: ${prompt}`;

      const data = {
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const response = await this.makeRequest('gemini-2.0-flash:generateContent', data);
      
      if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
        return response.candidates[0].content.parts[0].text;
      }
      
      throw new Error('Invalid response format from Gemini API');
    } catch (error) {
      console.error('Gemini API error:', error);
      // Fallback to default responses
      return this.getFallbackResponse(prompt);
    }
  }

  async generateFlashcards(content: string): Promise<Array<{front: string, back: string}>> {
    try {
      const prompt = `
        Based on the following educational content, generate 5-8 high-quality flashcards for studying. 
        Each flashcard should have a clear question on the front and a comprehensive answer on the back.
        Focus on key concepts, definitions, and important facts.
        
        Content: ${content}
        
        Please format your response as a JSON array with objects containing "front" and "back" properties.
        Example: [{"front": "What is...?", "back": "The answer is..."}]
      `;

      const response = await this.generateText(prompt);
      
      // Try to parse JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const flashcards = JSON.parse(jsonMatch[0]);
          if (Array.isArray(flashcards) && flashcards.length > 0) {
            return flashcards;
          }
        } catch (parseError) {
          console.error('Failed to parse flashcards JSON:', parseError);
        }
      }

      // Fallback: create flashcards from the text response
      return this.parseFlashcardsFromText(response);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      return this.getFallbackFlashcards();
    }
  }

  async generateSummary(content: string): Promise<string> {
    try {
      const prompt = `
        Please create a comprehensive yet concise summary of the following educational content.
        The summary should:
        - Highlight the main concepts and key points
        - Be well-structured and easy to understand
        - Include important details while remaining accessible
        - Be suitable for study and review purposes
        
        Content: ${content}
      `;

      return await this.generateText(prompt);
    } catch (error) {
      console.error('Error generating summary:', error);
      return this.getFallbackSummary();
    }
  }

  async generateQuiz(content: string): Promise<Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>> {
    try {
      const prompt = `
        Based on the following educational content, create 5 multiple-choice quiz questions.
        Each question should have 4 options with only one correct answer.
        Include brief explanations for the correct answers.
        
        Content: ${content}
        
        Format as JSON array: [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "..."}]
      `;

      const response = await this.generateText(prompt);
      
      // Try to parse JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const quiz = JSON.parse(jsonMatch[0]);
          if (Array.isArray(quiz) && quiz.length > 0) {
            return quiz;
          }
        } catch (parseError) {
          console.error('Failed to parse quiz JSON:', parseError);
        }
      }

      // Fallback: create quiz from the text response
      return this.parseQuizFromText(response);
    } catch (error) {
      console.error('Error generating quiz:', error);
      return this.getFallbackQuiz();
    }
  }

  async getPersonalizedRecommendations(userProfile: any, progress: any): Promise<Array<{
    type: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>> {
    try {
      const prompt = `
        Based on the following user profile and learning progress, provide 3-5 personalized learning recommendations.
        
        User Profile: ${JSON.stringify(userProfile)}
        Learning Progress: ${JSON.stringify(progress)}
        
        Consider their interests, skills, university, major, and current progress to suggest relevant learning paths, courses, or activities.
        Format as JSON array with type, title, description, and priority (high/medium/low).
      `;

      const response = await this.generateText(prompt);
      
      // Try to parse JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const recommendations = JSON.parse(jsonMatch[0]);
          if (Array.isArray(recommendations) && recommendations.length > 0) {
            return recommendations;
          }
        } catch (parseError) {
          console.error('Failed to parse recommendations JSON:', parseError);
        }
      }

      // Fallback recommendations
      return this.getFallbackRecommendations();
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getFallbackRecommendations();
    }
  }

  async getChatResponse(message: string, userContext?: any): Promise<string> {
    try {
      const contextInfo = userContext ? `User context: ${JSON.stringify(userContext)}` : '';
      const prompt = `
        You are Wenza, the friendly AI learning companion for T-Wenza educational platform.
        You help students with their learning journey, provide study tips, answer questions, and offer motivation.
        
        ${contextInfo}
        
        User message: ${message}
        
        Respond in a helpful, encouraging, and educational manner. Keep responses conversational but informative.
      `;

      return await this.generateText(prompt);
    } catch (error) {
      console.error('Error getting chat response:', error);
      return this.getFallbackChatResponse(message);
    }
  }

  // Fallback methods for when API is unavailable
  private getFallbackResponse(prompt: string): string {
    const responses = [
      "I'm here to help with your learning journey! While I'm processing your request, feel free to explore the different learning formats available on T-Wenza.",
      "That's a great question! I'm working on providing you with the best possible answer. In the meantime, check out our personalized learning paths.",
      "I understand what you're asking about. Let me help you with that while you continue exploring your courses and materials."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private parseFlashcardsFromText(text: string): Array<{front: string, back: string}> {
    // Simple parsing logic for flashcards from text
    const lines = text.split('\n').filter(line => line.trim());
    const flashcards = [];
    
    for (let i = 0; i < lines.length - 1; i += 2) {
      if (lines[i] && lines[i + 1]) {
        flashcards.push({
          front: lines[i].replace(/^\d+\.?\s*/, '').trim(),
          back: lines[i + 1].trim()
        });
      }
    }
    
    return flashcards.length > 0 ? flashcards : this.getFallbackFlashcards();
  }

  private parseQuizFromText(text: string): Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }> {
    // Simple parsing logic for quiz from text
    return this.getFallbackQuiz();
  }

  private getFallbackFlashcards(): Array<{front: string, back: string}> {
    return [
      {
        front: "What is the main benefit of personalized learning?",
        back: "Personalized learning adapts to individual learning styles, pace, and preferences, leading to better understanding and retention."
      },
      {
        front: "How does AI enhance the learning experience?",
        back: "AI can provide personalized recommendations, adaptive content, intelligent tutoring, and real-time feedback to optimize learning outcomes."
      },
      {
        front: "What makes T-Wenza unique as a learning platform?",
        back: "T-Wenza combines AI-powered personalization, multiple learning formats, community features, and career opportunities in one integrated platform."
      }
    ];
  }

  private getFallbackSummary(): string {
    return "This content covers essential educational concepts and principles that are fundamental to understanding the subject matter. The material provides comprehensive coverage of key topics, practical applications, and real-world examples that demonstrate the importance of these concepts in academic and professional contexts.";
  }

  private getFallbackQuiz(): Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }> {
    return [
      {
        question: "What is the primary goal of personalized learning?",
        options: [
          "To make learning faster",
          "To adapt to individual learning needs and styles",
          "To reduce study time",
          "To eliminate the need for teachers"
        ],
        correctAnswer: 1,
        explanation: "Personalized learning aims to adapt educational content and methods to individual learning needs, styles, and pace."
      },
      {
        question: "How does AI contribute to modern education?",
        options: [
          "By replacing human teachers",
          "By providing personalized recommendations and adaptive content",
          "By making education more expensive",
          "By eliminating the need for studying"
        ],
        correctAnswer: 1,
        explanation: "AI enhances education by providing personalized recommendations, adaptive content, and intelligent support systems."
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
        title: 'Complete Your Current Course',
        description: 'Focus on finishing your current learning path to build momentum and achieve your goals.',
        priority: 'high'
      },
      {
        type: 'practice',
        title: 'Daily Learning Habit',
        description: 'Establish a consistent daily learning routine to improve retention and progress.',
        priority: 'medium'
      },
      {
        type: 'network',
        title: 'Connect with Peers',
        description: 'Build your professional network by connecting with fellow students in your field.',
        priority: 'low'
      }
    ];
  }

  private getFallbackChatResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm Wenza, your AI learning companion. I'm here to help you with your studies, answer questions, and support your learning journey. How can I assist you today?";
    } else if (lowerMessage.includes('help')) {
      return "I'm here to help! I can assist you with course recommendations, study strategies, creating flashcards, generating summaries, and answering questions about your learning materials. What would you like to work on?";
    } else if (lowerMessage.includes('study') || lowerMessage.includes('learn')) {
      return "Great! Learning is a journey, and I'm here to make it more effective and enjoyable. I can help you create personalized study plans, generate practice materials, and provide insights to improve your understanding. What subject are you focusing on?";
    } else {
      return "That's an interesting question! While I process your request, feel free to explore the various learning formats available on T-Wenza. I'm here to support your educational journey in any way I can.";
    }
  }
}

export const geminiAI = new GeminiAIService();