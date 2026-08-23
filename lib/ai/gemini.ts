import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { AIRequest, AIResponse } from "../types/ai";

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
  "gemini-pro",
  "gemini-1.5-pro-latest",
  "gemini-2.0-flash-exp"
];

export async function generateGeminiResponse(request: AIRequest): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    return { text: "", isError: true, errorMessage: "GEMINI_API_KEY is not configured." };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastErrorMsg = "";

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const modelOptions: any = {
        model: modelName,
        safetySettings,
      };

      if (request.systemInstruction) {
        modelOptions.systemInstruction = request.systemInstruction;
      }

      const model = genAI.getGenerativeModel(modelOptions);

      const generationConfig: any = {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 2048,
      };

      if (request.jsonMode) {
        generationConfig.responseMimeType = "application/json";
      }

      const chatHistory = request.history?.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })) || [];

      const chat = model.startChat({
        history: chatHistory,
        generationConfig,
      });

      const result = await chat.sendMessage(request.prompt);
      const response = result.response;
      
      return {
        text: response.text(),
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
        isError: false
      };

    } catch (error: any) {
      console.warn(`[Gemini Model ${modelName} failed]:`, error.message);
      lastErrorMsg = error.message;
    }
  }

  return {
    text: "",
    isError: true,
    errorMessage: lastErrorMsg || "All Gemini candidate models failed to generate a response."
  };
}

/**
 * Streams response chunks from Gemini asynchronously with resilient model failover.
 */
export async function* streamGeminiResponse(request: AIRequest): AsyncGenerator<string, void, unknown> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let resultStream = null;
  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const modelOptions: any = {
        model: modelName,
        safetySettings,
      };

      if (request.systemInstruction) {
        modelOptions.systemInstruction = request.systemInstruction;
      }

      const model = genAI.getGenerativeModel(modelOptions);

      const generationConfig: any = {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 2048,
      };

      const chatHistory = request.history?.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })) || [];

      const chat = model.startChat({
        history: chatHistory,
        generationConfig,
      });

      resultStream = await chat.sendMessageStream(request.prompt);
      console.log(`[Gemini Stream] Connected successfully using model '${modelName}'`);
      break; // Successfully connected stream!
    } catch (err: any) {
      console.warn(`[Gemini Stream ${modelName} candidate failed]:`, err.message);
      lastError = err;
    }
  }

  if (!resultStream) {
    throw lastError || new Error("All Gemini streaming model candidates failed.");
  }

  for await (const chunk of resultStream.stream) {
    const chunkText = chunk.text();
    if (chunkText) {
      yield chunkText;
    }
  }
}
