import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  OPENAI_CONSTANTS,
  PROCESSING_STATUSES,
  COMPLETED_STATUS,
} from './constants/openai.constants';

/**
 * Service for handling OpenAI API interactions
 * Provides methods for chat completions and assistant conversations
 */
@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private readonly openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.getRequiredConfig('OPENAI_API_KEY');
    this.openai = new OpenAI({ apiKey });
    this.logger.log('OpenAI service initialized successfully');
  }

  /**
   * Sends a message to an OpenAI assistant thread and returns the response
   */
  async sendMessageToAssistant(
    threadId: string,
    message: string,
  ): Promise<string> {
    this.validateInputs({ threadId, message });
    this.logMessage('Sending message to thread', threadId, message);

    await this.addMessageToThread(threadId, message);
    const runId = await this.createAssistantRun(threadId);
    await this.waitForRunCompletion(threadId, runId);

    return this.getAssistantResponse(threadId, runId);
  }

  /**
   * Creates a new thread for conversation
   */
  async createThread(): Promise<string> {
    try {
      const thread = await this.openai.beta.threads.create();
      this.logger.log(`Created new thread: ${thread.id}`);
      return thread.id;
    } catch (error) {
      this.handleError('Failed to create thread', error);
    }
  }

  /**
   * Simple chat completion method for basic OpenAI interactions
   */
  async chatCompletion(
    message: string,
    model: string = OPENAI_CONSTANTS.DEFAULT_MODEL,
  ): Promise<string> {
    this.validateMessage(message);
    this.logMessage('Sending chat completion', '', message);

    try {
      const completion = await this.openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: message }],
        max_tokens: OPENAI_CONSTANTS.MAX_TOKENS,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response received from OpenAI');
      }

      return response;
    } catch (error) {
      this.handleError('Failed to get chat completion', error);
    }
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`${key} is not configured in environment variables`);
    }
    return value;
  }

  private validateInputs(inputs: { threadId: string; message: string }): void {
    if (!inputs.threadId || !inputs.message) {
      throw new Error('ThreadId and message are required');
    }
  }

  private validateMessage(message: string): void {
    if (!message) {
      throw new Error('Message is required');
    }
  }

  private logMessage(action: string, threadId: string, message: string): void {
    const truncatedMessage = message.substring(
      0,
      OPENAI_CONSTANTS.LOG_MESSAGE_MAX_LENGTH,
    );
    const threadInfo = threadId ? ` ${threadId}:` : '';
    this.logger.log(`${action}${threadInfo} ${truncatedMessage}...`);
  }

  private async addMessageToThread(
    threadId: string,
    message: string,
  ): Promise<void> {
    try {
      await this.openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: message,
      });
    } catch (error) {
      this.handleError('Failed to add message to thread', error);
    }
  }

  private async createAssistantRun(threadId: string): Promise<string> {
    try {
      const assistantId = this.getRequiredConfig('OPENAI_ASSISTANT_ID');
      const run = await this.openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });
      return run.id;
    } catch (error) {
      this.handleError('Failed to create assistant run', error);
    }
  }

  private async waitForRunCompletion(
    threadId: string,
    runId: string,
  ): Promise<void> {
    let attempts = 0;
    let runStatus = await this.retrieveRunStatus(threadId, runId);

    while (PROCESSING_STATUSES.includes(runStatus.status as any)) {
      if (attempts >= OPENAI_CONSTANTS.MAX_POLLING_ATTEMPTS) {
        throw new Error('Assistant run timeout - exceeded maximum wait time');
      }

      await this.sleep(OPENAI_CONSTANTS.POLLING_INTERVAL_MS);
      runStatus = await this.retrieveRunStatus(threadId, runId);
      attempts++;
    }

    if (runStatus.status !== COMPLETED_STATUS) {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }
  }

  private async retrieveRunStatus(threadId: string, runId: string) {
    try {
      return await this.openai.beta.threads.runs.retrieve(threadId, runId);
    } catch (error) {
      this.handleError('Failed to retrieve run status', error);
    }
  }

  private async getAssistantResponse(
    threadId: string,
    runId: string,
  ): Promise<string> {
    try {
      const messages = await this.openai.beta.threads.messages.list(threadId);
      const assistantMessage = messages.data.find(
        (msg) => msg.role === 'assistant' && msg.run_id === runId,
      );

      if (assistantMessage && assistantMessage.content[0]?.type === 'text') {
        return assistantMessage.content[0].text.value;
      }

      throw new Error('No assistant response found');
    } catch (error) {
      this.handleError('Failed to get assistant response', error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private handleError(message: string, error: any): never {
    this.logger.error(`${message}: ${error.message}`, error.stack);
    throw new Error(`${message}: ${error.message}`);
  }
}
