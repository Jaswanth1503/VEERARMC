import { AIRequest, AIResponse } from "../types/ai";
import { generateGeminiResponse } from "../ai/gemini";
import { generateRAGResponse, streamRAGResponse, RAGRequest } from "../ai/rag";

/**
 * Centralized AI Service for the entire enterprise platform.
 * All AI requests must route through this service to ensure consistent:
 * - Validation
 * - Logging
 * - Rate Limiting (Stubbed for future Redis implementation)
 * - Error Handling
 */
export class AIService {
  
  /**
   * Standard chat completion request
   */
  static async chat(request: AIRequest): Promise<AIResponse> {
    this.validateRequest(request);
    this.logRequest(request, "chat");

    const startTime = Date.now();
    const response = await generateGeminiResponse(request);
    const latency = Date.now() - startTime;

    this.logResponse(response, latency);
    return response;
  }

  /**
   * RAG-augmented chat completion request
   */
  static async askKnowledgeBase(request: RAGRequest): Promise<AIResponse> {
    this.validateRequest(request);
    this.logRequest(request, "rag");

    const startTime = Date.now();
    const response = await generateRAGResponse(request);
    const latency = Date.now() - startTime;

    this.logResponse(response, latency);
    return response;
  }

  /**
   * RAG-augmented real-time streaming request
   */
  static async streamKnowledgeBase(request: RAGRequest) {
    this.validateRequest(request);
    this.logRequest(request, "stream-rag");
    return await streamRAGResponse(request);
  }


  private static validateRequest(request: AIRequest) {
    if (!request.prompt || request.prompt.trim() === "") {
      throw new Error("Prompt cannot be empty.");
    }
    if (request.prompt.length > 30000) {
      throw new Error("Prompt exceeds maximum length.");
    }
  }

  private static logRequest(request: AIRequest, type: string) {
    // In production, log to structured logging service (Datadog/Winston)
    // NEVER log API keys or highly sensitive PII
    console.log(`[AI Service] Executing ${type} request. Prompt length: ${request.prompt.length} chars.`);
  }

  private static logResponse(response: AIResponse, latencyMs: number) {
    if (response.isError) {
      console.error(`[AI Service] Request failed in ${latencyMs}ms. Error: ${response.errorMessage}`);
    } else {
      console.log(`[AI Service] Request succeeded in ${latencyMs}ms. Tokens used: ${response.tokensUsed}`);
    }
  }
}
