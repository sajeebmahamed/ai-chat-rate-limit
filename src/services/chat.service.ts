import { injectable } from 'inversify';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { ChatRequestDto, ChatResponse } from '../types/chat.type';
import { IChatService } from '../interfaces/chat-service.interface';

@injectable()
export class ChatService implements IChatService {
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
        system: 'You are a friendly assistant!',
        prompt: chatRequest.message,
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
}
