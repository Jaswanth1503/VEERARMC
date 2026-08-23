import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface StoredFileResult {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  storagePath: string;
}

export class BlueprintStorageService {
  private static UPLOAD_DIR = path.join(process.cwd(), "uploads", "blueprints");

  /**
   * Allowed file MIME types and extensions.
   */
  private static ALLOWED_TYPES: Record<string, string[]> = {
    "application/pdf": [".pdf"],
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/webp": [".webp"]
  };

  /**
   * Maximum single file size: 50MB
   */
  private static MAX_FILE_SIZE = 50 * 1024 * 1024;

  /**
   * Ensures the uploads/blueprints/ directory exists on server disk.
   */
  static async ensureUploadDir(): Promise<string> {
    try {
      await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
    } catch (e) {
      // Directory already exists or created
    }
    return this.UPLOAD_DIR;
  }

  /**
   * Validates file format, size, and extension.
   */
  static validateFile(file: { name: string; type: string; size: number }) {
    if (!file || !file.name) {
      throw new Error("Invalid or missing file upload.");
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File "${file.name}" exceeds the maximum allowed upload size of 50MB.`);
    }

    const ext = path.extname(file.name).toLowerCase();
    const isMimeAllowed = Object.keys(this.ALLOWED_TYPES).includes(file.type);
    const isExtAllowed = Object.values(this.ALLOWED_TYPES).some(exts => exts.includes(ext));

    if (!isMimeAllowed && !isExtAllowed) {
      throw new Error(`Unsupported format "${ext}". Allowed types: PDF, PNG, JPG, JPEG, WEBP.`);
    }
  }

  /**
   * Securely saves file buffer to disk under uploads/blueprints/
   */
  static async storeFile(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<StoredFileResult> {
    const uploadDir = await this.ensureUploadDir();
    const ext = path.extname(originalName).toLowerCase() || ".pdf";
    const storageKey = `bp_${Date.now()}_${crypto.randomBytes(8).toString("hex")}${ext}`;
    const storagePath = path.join(uploadDir, storageKey);

    await fs.writeFile(storagePath, fileBuffer);

    return {
      fileName: storageKey,
      originalName,
      mimeType,
      size: fileBuffer.length,
      storageKey,
      storagePath
    };
  }

  /**
   * Reads stored blueprint file from disk securely.
   */
  static async readFile(storageKey: string): Promise<Buffer> {
    const uploadDir = await this.ensureUploadDir();
    const filePath = path.join(uploadDir, path.basename(storageKey));
    return await fs.readFile(filePath);
  }
}
