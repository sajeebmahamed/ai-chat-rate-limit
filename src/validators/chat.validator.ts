import Joi from 'joi';
import { ChatRequestDto } from '../types/chat.type';

export const chatRequestSchema = Joi.object<ChatRequestDto>({
  message: Joi.string().required().min(1).max(1000).messages({
    'string.empty': 'Message is required',
    'string.min': 'Message must be at least 1 character long',
    'string.max': 'Message must not exceed 1000 characters',
  }),
});
