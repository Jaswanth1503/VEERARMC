import { prisma } from "../prisma";
import { generateGeminiResponse } from "../ai/gemini";
import { RAGSourceMetadata } from "../types/ai";

export class ConversationService {
  /**
   * Retrieves all conversations for a specific user, ordered by latest activity.
   */
  static async getUserConversations(userId: string) {
    return await prisma.conversation.findMany({
      where: {
        userId,
        isArchived: false
      },
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { messages: true }
        }
      }
    });
  }

  /**
   * Retrieves a single conversation with messages and source citations, verifying user ownership.
   */
  static async getConversationWithMessages(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sources: true
          }
        }
      }
    });

    if (!conversation) {
      throw new Error("Conversation not found or unauthorized.");
    }

    return conversation;
  }

  /**
   * Creates a new conversation for a user.
   */
  static async createConversation(userId: string, initialTitle?: string) {
    return await prisma.conversation.create({
      data: {
        userId,
        title: initialTitle || "New Chat"
      }
    });
  }

  /**
   * Saves a user message or assistant message to database.
   */
  static async saveMessage(
    conversationId: string, 
    role: 'user' | 'assistant' | 'system', 
    content: string,
    sources?: RAGSourceMetadata[]
  ) {
    const message = await prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        sources: sources && sources.length > 0 ? {
          create: sources.map(s => ({
            documentId: s.documentId,
            documentName: s.documentName,
            title: s.title,
            section: s.section,
            page: s.page,
            sourceUrl: s.sourceUrl,
            relevanceScore: s.relevanceScore
          }))
        } : undefined
      },
      include: {
        sources: true
      }
    });

    // Touch conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return message;
  }

  /**
   * Updates conversation title.
   */
  static async updateTitle(conversationId: string, userId: string, title: string) {
    // Verify ownership
    const conv = await prisma.conversation.findFirst({
      where: { id: conversationId, userId }
    });
    if (!conv) throw new Error("Unauthorized or not found.");

    return await prisma.conversation.update({
      where: { id: conversationId },
      data: { title: title.trim() }
    });
  }

  /**
   * Deletes a conversation.
   */
  static async deleteConversation(conversationId: string, userId: string) {
    const conv = await prisma.conversation.findFirst({
      where: { id: conversationId, userId }
    });
    if (!conv) throw new Error("Unauthorized or not found.");

    return await prisma.conversation.delete({
      where: { id: conversationId }
    });
  }

  /**
   * Submits user feedback (thumbs up / thumbs down) for a message.
   */
  static async submitFeedback(messageId: string, userId: string, rating: 'POSITIVE' | 'NEGATIVE', feedbackText?: string) {
    // Upsert or create feedback
    const existing = await prisma.messageFeedback.findFirst({
      where: { messageId, userId }
    });

    if (existing) {
      return await prisma.messageFeedback.update({
        where: { id: existing.id },
        data: { rating, feedbackText }
      });
    }

    return await prisma.messageFeedback.create({
      data: {
        messageId,
        userId,
        rating,
        feedbackText
      }
    });
  }

  /**
   * Generates a short, catchy title (3-5 words) for a conversation based on the first prompt.
   */
  static async generateAutoTitle(conversationId: string, firstPrompt: string) {
    try {
      const response = await generateGeminiResponse({
        prompt: `Generate a concise 3-5 word title for a conversation that starts with this message: "${firstPrompt}". Respond with ONLY the title string, no quotes or punctuation.`,
        temperature: 0.3,
        maxTokens: 20
      });

      if (!response.isError && response.text) {
        const cleanTitle = response.text.trim().replace(/^["']|["']$/g, '');
        if (cleanTitle) {
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { title: cleanTitle }
          });
        }
      }
    } catch (e) {
      console.warn("[AutoTitle Warning] Could not generate auto title:", e);
    }
  }
}
