import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

/**
 * DTO for chat completion requests
 */
export class ChatCompletionDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  @IsIn(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'])
  model?: string;
}
