

export interface ChunkingOptions {
  maxSize: number;
  overlap: number;
}

export class DocumentParser {
  /**
   * Extracts text from a generic Buffer. 
   * Currently supports PDF. Easy to extend for DOCX/TXT.
   */
  static async extractText(fileBuffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType === "application/pdf") {
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(fileBuffer);
      return data.text;
    }
    
    if (mimeType === "text/plain" || mimeType === "text/markdown") {
      return fileBuffer.toString("utf-8");
    }

    throw new Error(`Unsupported mime type: ${mimeType}`);
  }

  /**
   * Splits text into smaller overlapping chunks for Vector DB insertion.
   * Uses a naive character-based recursive chunking approach.
   */
  static chunkText(text: string, options: ChunkingOptions = { maxSize: 1000, overlap: 200 }): string[] {
    const chunks: string[] = [];
    let currentIndex = 0;

    while (currentIndex < text.length) {
      let endIndex = currentIndex + options.maxSize;
      
      // Try to find a natural break (newline or period) to avoid cutting words
      if (endIndex < text.length) {
        const nextPeriod = text.indexOf('.', endIndex - 100);
        const nextNewline = text.indexOf('\n', endIndex - 100);
        
        if (nextPeriod !== -1 && nextPeriod < endIndex + 100) {
          endIndex = nextPeriod + 1;
        } else if (nextNewline !== -1 && nextNewline < endIndex + 100) {
          endIndex = nextNewline + 1;
        }
      }

      chunks.push(text.substring(currentIndex, endIndex).trim());
      
      currentIndex = endIndex - options.overlap;
      
      // Prevent infinite loop if overlap is too large
      if (currentIndex <= 0 || endIndex >= text.length) {
        break;
      }
    }

    return chunks.filter(c => c.length > 0);
  }
}
