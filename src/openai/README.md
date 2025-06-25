# OpenAI Integration

This module provides OpenAI integration for the real estate assistant application.

## Setup

1. Install dependencies:
```bash
yarn add openai
```

2. Configure environment variables in your `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ASSISTANT_ID=your_assistant_id_here

# Application Configuration
NODE_ENV=development
PORT=3000
```

## Usage

### Available Endpoints

#### POST /openai/chat
Simple chat completion endpoint.

**Request Body:**
```json
{
  "message": "Hello, how can you help me with real estate?",
  "model": "gpt-3.5-turbo" // optional, defaults to gpt-3.5-turbo
}
```

**Response:**
```json
{
  "response": "I can help you with various real estate tasks..."
}
```

#### POST /openai/create-thread
Creates a new conversation thread for assistant interactions.

**Response:**
```json
{
  "threadId": "thread_abc123"
}
```

#### POST /openai/send-message
Sends a message to an existing assistant thread.

**Request Body:**
```json
{
  "threadId": "thread_abc123",
  "message": "What's the current market trend?"
}
```

**Response:**
```json
{
  "response": "Based on current data, the market shows..."
}
```

## Service Methods

### OpenaiService

- `chatCompletion(message: string, model?: string): Promise<string>` - Simple chat completion
- `createThread(): Promise<string>` - Creates a new conversation thread
- `sendMessageToAssistant(threadId: string, message: string): Promise<string>` - Sends message to assistant

## Error Handling

All methods include comprehensive error handling with:
- Input validation
- Proper error logging
- Descriptive error messages
- HTTP status codes for API endpoints

## Security

- API keys are stored securely in environment variables
- No sensitive data is logged
- Proper error handling prevents information leakage 