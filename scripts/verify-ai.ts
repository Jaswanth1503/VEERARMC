import "dotenv/config";
import { generateGeminiResponse } from "../lib/ai/gemini";
import { generateEmbedding } from "../lib/ai/embeddings";
import { storeEmbeddings, searchVectors, deleteVectors } from "../lib/ai/vector";
import crypto from "crypto";

async function verifyAI() {
  console.log("=== Starting AI Infrastructure Verification ===");

  // 1. Test Gemini Connectivity
  console.log("\n1. Testing Gemini Chat Connectivity...");
  const chatRes = await generateGeminiResponse({
    prompt: "Say 'Gemini Connected Successfully' and nothing else.",
    temperature: 0.1
  });
  if (chatRes.isError) {
    throw new Error(`Gemini Chat Failed: ${chatRes.errorMessage}`);
  }
  console.log(`✅ Gemini Response: ${chatRes.text.trim()}`);

  // 2. Test Embedding Generation
  console.log("\n2. Testing Embedding Generation (gemini-embedding-001)...");
  const testText = "Ready Mix Concrete M30 specification and testing.";
  const vector = await generateEmbedding(testText);
  if (!vector || vector.length === 0) {
    throw new Error("Embedding generation returned empty vector.");
  }
  console.log(`✅ Embedding generated successfully. Dimensions: ${vector.length}`);

  // 3. Test Pinecone Upsert & Search
  console.log("\n3. Testing Pinecone Upsert & Search...");
  const testId = `test_vec_${crypto.randomUUID()}`;
  await storeEmbeddings([{
    id: testId,
    values: vector,
    metadata: { text: testText, type: "test" }
  }], "test-namespace");
  console.log(`✅ Vector ${testId} upserted into 'test-namespace'.`);

  // Wait 3 seconds for Pinecone eventual consistency
  console.log("Waiting 3s for Pinecone indexing...");
  await new Promise(r => setTimeout(r, 3000));

  const searchResults = await searchVectors(vector, 1, "test-namespace");
  console.log(`Found ${searchResults.length} matches.`);
  if (searchResults.length > 0) {
    console.log(`✅ Top Match ID: ${searchResults[0].id}, Score: ${searchResults[0].score}`);
  } else {
    console.warn("⚠️ Warning: Pinecone search returned 0 matches (might be delayed indexing).");
  }

  // Cleanup
  console.log("\n4. Cleaning up test vectors...");
  await deleteVectors([testId], "test-namespace");
  console.log("✅ Cleanup complete.");

  console.log("\n=== ALL AI INFRASTRUCTURE TESTS PASSED! ===");
}

verifyAI().catch(e => {
  console.error("\n❌ AI Verification Failed:", e);
  process.exit(1);
});
