export interface ChatRequestDto {
  message: string;
}

export interface ChatResponse {
  message: string;
  timestamp: string;
  requestId: string;
}
