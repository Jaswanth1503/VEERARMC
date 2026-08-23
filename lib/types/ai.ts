export type Role = 'user' | 'model' | 'system' | 'function';

export interface ChatMessage {
  role: Role;
  content: string;
  name?: string;
}

export interface AIRequest {
  prompt: string;
  history?: ChatMessage[];
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface RAGSourceMetadata {
  documentId?: string;
  documentName: string;
  title?: string;
  section?: string;
  page?: number;
  sourceUrl?: string;
  relevanceScore: number;
}

export interface AIResponse {
  text: string;
  tokensUsed?: number;
  sources?: RAGSourceMetadata[];
  isError?: boolean;
  errorMessage?: string;
}

export interface Embedding {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface AITool {
  name: string;
  description: string;
  parameters: Record<string, any>; // JSON schema
  execute: (args: any) => Promise<any> | any;
}

export interface PromptTemplate {
  name: string;
  template: string;
  description: string;
  variables: string[];
}
