export interface ParsedPageData {
  pageNumber: number;
  extractedText: string;
}

export interface ParsedDocumentResult {
  pageCount: number;
  documentType: string;
  extractedText: string;
  pages: ParsedPageData[];
}

export class BlueprintParserService {
  /**
   * Classifies document type based on detected structural keywords.
   */
  static classifyDocumentType(text: string): string {
    const lower = text.toLowerCase();

    if (lower.includes("column schedule") || lower.includes("column detail") || (lower.includes("c1") && lower.includes("rebar"))) {
      return "Column Schedule";
    }
    if (lower.includes("beam schedule") || lower.includes("beam layout") || lower.includes("b1") || lower.includes("b2")) {
      return "Beam Schedule";
    }
    if (lower.includes("foundation plan") || lower.includes("footing layout") || lower.includes("isolated footing") || lower.includes("raft foundation")) {
      return "Foundation Plan";
    }
    if (lower.includes("slab detail") || lower.includes("slab reinforcement") || lower.includes("two way slab") || lower.includes("one way slab")) {
      return "Slab Drawing";
    }
    if (lower.includes("structural notes") || lower.includes("general structural notes") || lower.includes("is 456") || lower.includes("concrete grade")) {
      return "Structural Specification";
    }
    if (lower.includes("floor plan") || lower.includes("ground floor") || lower.includes("first floor") || lower.includes("typical floor")) {
      return "Floor Plan";
    }
    if (lower.includes("architectural plan") || lower.includes("elevation") || lower.includes("section")) {
      return "Architectural Drawing";
    }

    return "Structural Drawing";
  }

  /**
   * Parses PDF file buffer to extract text, pages, and classify document type.
   * Loads pdf-parse dynamically on demand inside the function execution.
   */
  static async parsePDF(buffer: Buffer): Promise<ParsedDocumentResult> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      const text = data.text || "";
      const pageCount = data.numpages || 1;
      const documentType = this.classifyDocumentType(text);

      const pageSplit = text.split(/\n\s*Page \d+\s*\n|\f/gi);
      const pages: ParsedPageData[] = [];

      for (let i = 0; i < pageCount; i++) {
        pages.push({
          pageNumber: i + 1,
          extractedText: (pageSplit[i] || text).slice(0, 3000)
        });
      }

      return {
        pageCount,
        documentType,
        extractedText: text,
        pages
      };
    } catch (err) {
      console.warn("[BlueprintParserService Warning] PDF text parsing failed, using fallback empty parse:", err);
      return {
        pageCount: 1,
        documentType: "Structural Drawing",
        extractedText: "",
        pages: [{ pageNumber: 1, extractedText: "" }]
      };
    }
  }

  /**
   * Helper for image blueprint documents.
   */
  static parseImage(originalName: string): ParsedDocumentResult {
    const lower = originalName.toLowerCase();
    let docType = "Architectural Drawing";
    if (lower.includes("struct") || lower.includes("column") || lower.includes("beam") || lower.includes("slab")) {
      docType = "Structural Drawing";
    }

    return {
      pageCount: 1,
      documentType: docType,
      extractedText: `Uploaded Image File: ${originalName}`,
      pages: [{ pageNumber: 1, extractedText: `Uploaded Image File: ${originalName}` }]
    };
  }
}
