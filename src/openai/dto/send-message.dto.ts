import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO for sending messages to OpenAI assistant thread
 */
export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  threadId: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
