import { prisma } from "../prisma";
import { BlueprintStorageService } from "./blueprint-storage.service";
import { BlueprintParserService } from "./blueprint-parser.service";
import { BlueprintCalculationService } from "./blueprint-calculation.service";
import { BlueprintAIService } from "./blueprint-ai.service";

export interface UploadBlueprintInput {
  userId?: string;
  projectId?: string;
  title?: string;
  files: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
  }[];
}

export class BlueprintService {
  /**
   * Complete Blueprint Upload & Processing Pipeline.
   */
  static async uploadAndAnalyzeBlueprint(input: UploadBlueprintInput) {
    if (!input.files || input.files.length === 0) {
      throw new Error("No files uploaded.");
    }

    const firstFile = input.files[0];
    const analysisTitle = input.title || firstFile.originalName.replace(/\.[^/.]+$/, "");

    // 1. Store files securely
    const storedFiles = [];
    for (const f of input.files) {
      BlueprintStorageService.validateFile({ name: f.originalName, type: f.mimeType, size: f.buffer.length });
      const stored = await BlueprintStorageService.storeFile(f.buffer, f.originalName, f.mimeType);
      storedFiles.push({ ...stored, buffer: f.buffer });
    }

    // 2. Parse PDF / Image text content
    let combinedText = "";
    let totalPageCount = 0;
    let detectedDocType = "Structural Drawing";

    for (const sf of storedFiles) {
      if (sf.mimeType === "application/pdf") {
        const parsed = await BlueprintParserService.parsePDF(sf.buffer);
        combinedText += `\n--- FILE: ${sf.originalName} ---\n` + parsed.extractedText;
        totalPageCount += parsed.pageCount;
        detectedDocType = parsed.documentType;
      } else {
        const parsedImg = BlueprintParserService.parseImage(sf.originalName);
        combinedText += `\n--- FILE: ${sf.originalName} ---\n` + parsedImg.extractedText;
        totalPageCount += 1;
        detectedDocType = parsedImg.documentType;
      }
    }

    // 3. AI Document Qualitative Reasoning & Dimension Extraction
    const aiResult = await BlueprintAIService.analyzeBlueprintDocument(
      analysisTitle,
      combinedText,
      totalPageCount
    );

    // 4. Deterministic Volume Calculations (Arithmetically calculated by code logic)
    const calculatedMeasurements = aiResult.measurements.map(m =>
      BlueprintCalculationService.calculateElementVolume(m as any)
    );

    const volumeTotals = BlueprintCalculationService.calculateTotalConcreteVolume(calculatedMeasurements);

    // 5. Persist to PostgreSQL Database
    const analysis = await prisma.blueprintAnalysis.create({
      data: {
        userId: input.userId || null,
        projectId: input.projectId || null,
        title: analysisTitle,
        documentType: aiResult.documentType || detectedDocType,
        status: "COMPLETED",
        version: 1,

        summary: aiResult.summary,
        buildingType: aiResult.buildingType,
        estimatedAreaSqFt: aiResult.estimatedAreaSqFt,
        floorsDetected: aiResult.floorsDetected,
        overallConfidence: aiResult.overallConfidence,

        totalConcreteM3: volumeTotals.totalConcreteM3,
        recommendedGrade: aiResult.recommendedGrade || "M25",

        // Save File Records
        files: {
          create: storedFiles.map(sf => ({
            fileName: sf.fileName,
            originalName: sf.originalName,
            mimeType: sf.mimeType,
            size: sf.size,
            storageKey: sf.storageKey,
            storagePath: sf.storagePath,
            pageCount: totalPageCount
          }))
        },

        // Save Structural Measurement Lines
        measurements: {
          create: calculatedMeasurements.map(cm => ({
            elementCategory: cm.elementCategory,
            label: cm.label,
            lengthMeters: cm.lengthMeters,
            widthMeters: cm.widthMeters,
            heightMeters: cm.heightMeters,
            areaSqFt: cm.areaSqFt,
            quantityCount: cm.quantityCount,
            calculatedVolM3: cm.calculatedVolM3,
            specifiedGrade: cm.specifiedGrade,
            confidence: cm.confidence,
            sourcePage: cm.sourcePage
          }))
        },

        // Save Findings
        findings: {
          create: aiResult.findings.map(f => ({
            category: f.category,
            severity: f.severity,
            title: f.title,
            description: f.description,
            sourcePage: f.sourcePage,
            confidence: f.confidence
          }))
        },

        // Save Recommendations
        recommendations: {
          create: aiResult.recommendations.map(r => ({
            category: "CONCRETE_PLANNING",
            recommendation: r,
            confidence: "HIGH"
          }))
        }
      },
      include: {
        files: true,
        measurements: true,
        findings: true,
        recommendations: true
      }
    });

    // Create Initial Version Snapshot
    await prisma.blueprintAnalysisVersion.create({
      data: {
        analysisId: analysis.id,
        versionNumber: 1,
        snapshotData: JSON.parse(JSON.stringify(analysis)),
        changedBy: "System",
        changeReason: "Initial Blueprint Processing"
      }
    });

    return analysis;
  }

  /**
   * Retrieves single Blueprint Analysis by ID.
   */
  static async getAnalysisById(id: string) {
    const analysis = await prisma.blueprintAnalysis.findUnique({
      where: { id },
      include: {
        files: true,
        measurements: true,
        findings: true,
        recommendations: true,
        versions: { orderBy: { versionNumber: "desc" } }
      }
    });

    if (!analysis) throw new Error("Blueprint Analysis record not found.");
    return analysis;
  }

  /**
   * Retrieves all blueprint analyses for an authenticated user.
   */
  static async getUserAnalyses(userId?: string) {
    const where: any = {};
    if (userId) where.userId = userId;

    return await prisma.blueprintAnalysis.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        files: true,
        _count: { select: { measurements: true, findings: true } }
      }
    });
  }

  /**
   * Integrates Blueprint Findings into a prefilled Quote Generator session data payload.
   */
  static async exportToQuoteData(analysisId: string) {
    const analysis = await this.getAnalysisById(analysisId);

    return {
      projectName: `${analysis.title} (Blueprint Import)`,
      projectType: analysis.buildingType?.includes("Commercial") ? "Commercial" : "Residential",
      floors: analysis.floorsDetected || 1,
      builtUpArea: analysis.estimatedAreaSqFt || 1500,
      concreteGradeCode: analysis.recommendedGrade || "M25",
      requiredQuantity: analysis.totalConcreteM3 || 30,
      inputUnit: "M3",
      wastagePercent: 5.0,
      projectDescription: `Generated automatically from Blueprint Analysis #${analysis.id}. Total structural elements: ${analysis.measurements.length}.`,
      blueprintAnalysisId: analysis.id
    };
  }
}
