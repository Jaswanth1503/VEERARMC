// lib/ai/tools.ts
import { AITool } from "../types/ai";

export const ConcreteCalculatorTool: AITool = {
  name: "concrete_volume_calculator",
  description: "Calculates the required cubic meters of concrete for a rectangular slab.",
  parameters: {
    type: "object",
    properties: {
      length: { type: "number", description: "Length in meters" },
      width: { type: "number", description: "Width in meters" },
      depth: { type: "number", description: "Depth/Thickness in meters" }
    },
    required: ["length", "width", "depth"]
  },
  execute: async ({ length, width, depth }) => {
    const volume = length * width * depth;
    // Add 5% waste factor standard in industry
    const recommended = volume * 1.05;
    return { exactVolume: volume, recommendedWithWaste: recommended, unit: "cubic meters" };
  }
};

// lib/ai/memory.ts
import { ChatMessage } from "../types/ai";

/**
 * Manages short-term conversation history.
 * In a full production system, this would read/write to Prisma/Redis.
 */
export class MemoryManager {
  static formatHistoryForGemini(history: ChatMessage[]) {
    // Ensure history follows Gemini's strict user->model->user alternation
    return history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
  }
}

// lib/ai/validators.ts
import { AIRequest } from "../types/ai";

export class AIValidator {
  static sanitizePrompt(prompt: string): string {
    // Strip excessive null bytes or basic prompt injection attempts
    return prompt.replace(/\0/g, '').trim();
  }
}

// lib/ai/cache.ts
/**
 * Simple in-memory cache to prevent duplicate identical requests hitting the API.
 * Easy to replace with Redis.
 */
export class AICache {
  private static cache = new Map<string, { response: any, timestamp: number }>();
  private static TTL = 1000 * 60 * 5; // 5 minutes

  static get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    return item.response;
  }

  static set(key: string, response: any) {
    this.cache.set(key, { response, timestamp: Date.now() });
  }
}
