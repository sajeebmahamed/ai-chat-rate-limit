import { injectable } from 'inversify';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { ChatRequestDto, ChatResponse } from '../types/chat.type';
import { IAIService } from '../interfaces/ai-service.interface';

@injectable()
export class AIService implements IAIService {
  private openaiClient: ReturnType<typeof createOpenAI>;

  constructor() {
    const apiKey = process.env['OPENAI_API_KEY'];
    if (!apiKey) {
      throw new Error(
        'OpenAI API key is required but not provided. Please set OPENAI_API_KEY environment variable.'
      );
    }

    this.openaiClient = createOpenAI({
      apiKey,
    });
  }

  public async processMessage(chatRequest: ChatRequestDto): Promise<ChatResponse> {
    try {
      const { text } = await generateText({
        model: this.openaiClient('gpt-4o-mini'),
        system:
          'You are a friendly AI assistant! Provide helpful, accurate, and concise responses.',
        prompt: chatRequest.message,
        temperature: 0.7,
      });

      return {
        message: text,
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substring(2, 15),
      };
    } catch (error) {
      throw new Error(
        `Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: this.openaiClient('gpt-4o-mini'),
        system: systemPrompt || 'You are a helpful AI assistant.',
        prompt,
        temperature: 0.7,
      });

      return text;
    } catch (error) {
      throw new Error(
        `Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
