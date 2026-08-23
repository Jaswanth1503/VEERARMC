import { AIService } from "../services/ai.service";
import { SystemPrompts } from "../ai/prompts";
import { ChatMessage } from "../types/ai";

export class ConcreteExpertAgent {
  static async ask(question: string, history: ChatMessage[] = []) {
    return await AIService.chat({
      prompt: question,
      history,
      systemInstruction: SystemPrompts.CONCRETE_EXPERT,
      temperature: 0.3 // Lower temperature for more factual, precise answers
    });
  }
}

export class CostEstimatorAgent {
  static async estimate(requirements: string) {
    return await AIService.chat({
      prompt: requirements,
      systemInstruction: SystemPrompts.COST_ESTIMATOR,
      temperature: 0.1,
      jsonMode: true // Force JSON output for structural parsing
    });
  }
}

export class RecommendationAgent {
  static async recommendProduct(projectDetails: string) {
    return await AIService.askKnowledgeBase({
      prompt: `Based on these project details: ${projectDetails}. What is the recommended concrete mix?`,
      systemInstruction: "You are a product recommendation engine.",
      topK: 3,
      namespace: "catalog"
    });
  }
}
