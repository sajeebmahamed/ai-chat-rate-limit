import { ChatRequestDto, ChatResponse } from '../types/chat.type';

export interface IChatService {
  processMessage(chatRequest: ChatRequestDto): Promise<ChatResponse>;
}
