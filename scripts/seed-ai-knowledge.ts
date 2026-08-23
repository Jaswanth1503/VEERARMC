import "dotenv/config";
import { generateEmbedding } from "../lib/ai/embeddings";
import { storeEmbeddings } from "../lib/ai/vector";
import crypto from "crypto";

interface KnowledgeChunk {
  documentId: string;
  documentName: string;
  title: string;
  section: string;
  page: number;
  category: string;
  text: string;
}

const knowledgeChunks: KnowledgeChunk[] = [
  {
    documentId: "doc-veera-overview-01",
    documentName: "Veera RMC Company Overview & Catalogue",
    title: "About Veera RMC",
    section: "1.1 Corporate Profile",
    page: 1,
    category: "Company Overview",
    text: `Veera RMC 2.0 is India's leading AI-powered Ready Mix Concrete (RMC) manufacturer and supplier. 
Veera RMC operates automated batching plants equipped with real-time moisture sensors, automated aggregate batchers, and GPS-tracked transit mixers. 
Key Services Provided:
1. Customized Ready Mix Concrete formulation for residential, commercial, and infrastructure projects.
2. Concrete Pumping Solutions (Line pumps and Boom pumps up to 42 meters).
3. On-site Quality Control Testing (Slump tests, Cube compressive strength testing at 7 and 28 days).
4. Direct B2B and Contractor concrete delivery scheduling with live ETA tracking.`
  },
  {
    documentId: "doc-veera-specs-01",
    documentName: "Veera RMC Technical Product Catalogue 2026",
    title: "Standard Concrete Grades Specifications (M10 to M50)",
    section: "2.1 Grade Matrix & Applications",
    page: 2,
    category: "Product Specs",
    text: `Veera RMC Concrete Grade Matrix & Specifications (IS 456 & ACI Standard Compliant):

1. Grade M10 (10 MPa Compressive Strength at 28 days):
   - Mix Ratio: 1:3:6 (Approximate nominal mix)
   - Typical Applications: Non-structural leveling, PCC (Plain Cement Concrete) bedding, pathways, under-footings.
   - Recommended Slump: 50-75 mm.

2. Grade M15 (15 MPa Compressive Strength at 28 days):
   - Mix Ratio: 1:2:4
   - Typical Applications: Sub-base for floors, driveways, boundary wall footings.
   - Recommended Slump: 75-100 mm.

3. Grade M20 (20 MPa Compressive Strength at 28 days):
   - Mix Ratio: 1:1.5:3
   - Typical Applications: Standard reinforced concrete (RCC) for single-story residential columns, beams, and slabs.
   - Recommended Slump: 100-125 mm.

4. Grade M25 (25 MPa Compressive Strength at 28 days):
   - Mix Ratio: 1:1:2 (Design Mix Preferred)
   - Typical Applications: Standard RCC multi-story residential foundations, RCC columns, beams, suspended slabs, retaining walls.
   - Recommended Slump: 100-150 mm.

5. Grade M30 (30 MPa Compressive Strength at 28 days):
   - Type: High-performance Design Mix
   - Typical Applications: Heavy RCC structural members, commercial buildings, water tanks, bridge piers, high-load driveways.
   - Recommended Slump: 125-150 mm (Pumpable).

6. Grade M35 & M40 (35-40 MPa Compressive Strength at 28 days):
   - Type: High Strength Structural Design Mix
   - Typical Applications: High-rise building columns, pre-stressed concrete members, heavy industrial floors, flyovers.

7. Grade M50 (50 MPa Compressive Strength at 28 days):
   - Type: Ultra-High Performance Concrete (UHPC)
   - Typical Applications: Marine structures, heavy bridge girders, specialized industrial infrastructure.`
  },
  {
    documentId: "doc-veera-faqs-01",
    documentName: "Veera RMC Technical FAQ & Delivery Guide",
    title: "Concrete Delivery, Curing & Quality Guidelines",
    section: "3.1 Ordering & Site Preparation",
    page: 3,
    category: "Technical FAQs",
    text: `Frequently Asked Questions & Field Execution Guidelines:

Q1: How do I order concrete from Veera RMC?
A: Log into the Veera Customer or Contractor portal at http://localhost:3000/dashboard, select your required Concrete Grade (e.g. M25, M30), specify quantity in cubic meters (m³), select delivery date/time slot, and submit the purchase order.

Q2: What site preparations are needed before transit mixer arrival?
A: Ensure clear 3.5m wide access road for 6-wheel or 10-wheel transit mixers. Formwork (shuttering) must be rigid, clean, oiled, and leak-proof. Rebar reinforcement must be inspected.

Q3: What is the initial setting time of Veera Ready Mix Concrete?
A: Initial setting time is approximately 90-120 minutes depending on ambient temperature and retarder admixtures used. Concrete must be placed and compacted before initial set.

Q4: What are the curing requirements for Veera RMC?
A: Curing must begin immediately after final set (typically within 4-6 hours). Wet ponding or continuous water spraying must be maintained for at least 7 to 14 days for standard OPC/PPC concrete.`
  }
];

async function seedKnowledgeBase() {
  console.log("=== Seeding Veera RMC Knowledge Base into Pinecone ===");

  try {
    const embeddingsToStore = [];

    for (const chunk of knowledgeChunks) {
      console.log(`Generating embedding for: "${chunk.title}" (${chunk.section})...`);
      const vector = await generateEmbedding(`${chunk.title}\n${chunk.section}\n${chunk.text}`);
      
      embeddingsToStore.push({
        id: `vec_${crypto.randomUUID()}`,
        values: vector,
        metadata: {
          documentId: chunk.documentId,
          documentName: chunk.documentName,
          title: chunk.title,
          section: chunk.section,
          page: chunk.page,
          category: chunk.category,
          text: chunk.text
        }
      });
    }

    console.log(`Upserting ${embeddingsToStore.length} knowledge vectors into Pinecone 'default' namespace...`);
    await storeEmbeddings(embeddingsToStore, "default");
    console.log("✅ Knowledge base seeding completed successfully!");

  } catch (error) {
    console.error("❌ Knowledge base seeding failed:", error);
  }
}

seedKnowledgeBase();
