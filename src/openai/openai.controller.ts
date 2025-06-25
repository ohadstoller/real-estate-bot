import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatCompletionDto } from './dto/chat-completion.dto';
import { MessageResponse, ThreadResponse } from './types/openai.types';

/**
 * Controller for handling OpenAI API interactions
 * Provides endpoints for chat completions and assistant conversations
 */
@Controller('openai')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  /**
   * Sends a message to an OpenAI assistant thread
   */
  @Post('send-message')
  async sendMessage(@Body() dto: SendMessageDto): Promise<MessageResponse> {
    try {
      const response = await this.openaiService.sendMessageToAssistant(
        dto.threadId,
        dto.message,
      );
      return { response };
    } catch (error) {
      this.handleServiceError(error, 'Failed to send message');
    }
  }

  /**
   * Creates a new conversation thread
   */
  @Post('create-thread')
  async createThread(): Promise<ThreadResponse> {
    try {
      const threadId = await this.openaiService.createThread();
      return { threadId };
    } catch (error) {
      this.handleServiceError(error, 'Failed to create thread');
    }
  }

  /**
   * Handles simple chat completion requests
   */
  @Post('chat')
  async chatCompletion(
    @Body() dto: ChatCompletionDto,
  ): Promise<MessageResponse> {
    try {
      const response = await this.openaiService.chatCompletion(
        dto.message,
        dto.model,
      );
      return { response };
    } catch (error) {
      this.handleServiceError(error, 'Failed to get chat completion');
    }
  }

  private handleServiceError(error: any, defaultMessage: string): never {
    const message = error.message || defaultMessage;
    throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
