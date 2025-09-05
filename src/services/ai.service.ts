import { injectable } from 'inversify';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { ChatRequestDto, ChatResponse } from '../types/chat.type';
import { IAIService } from '../interfaces/ai-service.interface';
import logger from '../utils/logger';

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
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(2, 15);

    logger.info(
      `AI request initiated (messageLength: ${chatRequest.message.length}, model: gpt-4o-mini)`,
      {
        requestId,
      }
    );

    try {
      const { text, usage } = await generateText({
        model: this.openaiClient('gpt-4o-mini'),
        system:
          'You are a friendly AI assistant! Provide helpful, accurate, and concise responses.',
        prompt: chatRequest.message,
        temperature: 0.7,
      });

      const responseTime = Date.now() - startTime;

      logger.info(
        `AI request completed successfully (responseTime: ${responseTime}ms, totalTokens: ${usage?.totalTokens || 0}, responseLength: ${text.length})`,
        {
          requestId,
          responseTime,
        }
      );

      return {
        message: text,
        timestamp: new Date().toISOString(),
        requestId,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      logger.error(
        `AI request failed (responseTime: ${responseTime}ms, messageLength: ${chatRequest.message.length})`,
        {
          requestId,
          responseTime,
          error: error instanceof Error ? error : new Error(String(error)),
        }
      );

      throw new Error(
        `Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(2, 15);

    logger.info(
      `Direct AI generation initiated (promptLength: ${prompt.length}, hasSystemPrompt: ${!!systemPrompt}, model: gpt-4o-mini)`,
      {
        requestId,
      }
    );

    try {
      const { text, usage } = await generateText({
        model: this.openaiClient('gpt-4o-mini'),
        system: systemPrompt || 'You are a helpful AI assistant.',
        prompt,
        temperature: 0.7,
      });

      const responseTime = Date.now() - startTime;

      logger.info(
        `Direct AI generation completed (responseTime: ${responseTime}ms, totalTokens: ${usage?.totalTokens || 0}, responseLength: ${text.length})`,
        {
          requestId,
          responseTime,
        }
      );

      return text;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      logger.error(
        `Direct AI generation failed (responseTime: ${responseTime}ms, promptLength: ${prompt.length})`,
        {
          requestId,
          responseTime,
          error: error instanceof Error ? error : new Error(String(error)),
        }
      );

      throw new Error(
        `Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
