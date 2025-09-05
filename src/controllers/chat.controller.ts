import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { chatRequestSchema } from '../validators/chat.validator';
import { ChatRequestDto } from '../types/chat.type';
import { IAIService } from '../interfaces/ai-service.interface';
import { IChatController } from '../interfaces/chat-controller.interface';
import { TYPES } from '../constants/types';

@injectable()
export class ChatController implements IChatController {
  constructor(@inject(TYPES.AIService) private aiService: IAIService) {}

  public sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = chatRequestSchema.validate(req.body);

      if (validationResult.error) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.details.map(detail => detail.message),
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
            version: '1.0.0',
          },
        });
        return;
      }

      const chatRequestDto: ChatRequestDto = validationResult.value;
      const result = await this.aiService.processMessage(chatRequestDto);

      res.status(200).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
          version: '1.0.0',
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      res.status(500).json({
        success: false,
        error: errorMessage,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
          version: '1.0.0',
        },
      });
    }
  };
}
