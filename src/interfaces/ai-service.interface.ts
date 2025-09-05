import { ChatRequestDto, ChatResponse } from '../types/chat.type';

export interface IAIService {
  processMessage(chatRequest: ChatRequestDto): Promise<ChatResponse>;
  generateResponse(prompt: string, systemPrompt?: string): Promise<string>;
}
