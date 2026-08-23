import { prisma } from "../prisma";
import { PricingService, QuotePricingInput } from "./pricing.service";
import { QuoteAIService, QuoteAIInput } from "./quote-ai.service";
import { InputUnit } from "./deterministic-calculation.service";

export interface CreateQuoteInput {
  userId?: string;
  customerId?: string;
  projectId?: string;

  // Step 1: Project Details
  projectName: string;
  projectType: string;
  constructionCategory?: string;
  customerName: string;
  companyName?: string;
  phone: string;
  email: string;
  siteAddress: string;
  city: string;
  state: string;
  pincode: string;
  projectDescription?: string;

  // Step 2: Construction Details
  floors?: number;
  builtUpArea?: number;
  constructionStage?: string;
  estimatedDuration?: string;
  pouringFrequency?: string;
  estimatedPourDate?: Date | string;
  projectScale?: string;
  constructionType?: string;
  lengthMeters?: number;
  widthMeters?: number;
  heightMeters?: number;

  // Step 3 & 4: Requirements & Delivery
  concreteGradeCode: string;
  requiredQuantity: number;
  inputUnit?: InputUnit;
  wastagePercent?: number;
  slumpRequirement?: string;
  specialRequirements?: string;
  preferredDeliveryWindow?: string;
  pumpRequired?: boolean;
  pumpType?: string;
  siteAccessNotes?: string;

  // Optional discount / promo
  discountCode?: string;
  distanceKm?: number;
}

export class QuoteService {
  /**
   * Generates a unique, server-side sequence quote number (e.g. VRMC-2026-000001).
   */
  static async generateQuoteNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `VRMC-${year}-`;

    const latestQuote = await prisma.quote.findFirst({
      where: { quoteNumber: { startsWith: prefix } },
      orderBy: { createdAt: "desc" },
      select: { quoteNumber: true }
    });

    if (!latestQuote) {
      return `${prefix}000001`;
    }

    const currentSeq = parseInt(latestQuote.quoteNumber.split("-")[2] || "0", 10);
    const nextSeq = (currentSeq + 1).toString().padStart(6, "0");
    return `${prefix}${nextSeq}`;
  }

  /**
   * Creates a complete, auditable Quotation combining deterministic pricing and AI analysis.
   */
  static async createQuote(input: CreateQuoteInput) {
    const quoteNumber = await this.generateQuoteNumber();

    // 1. Calculate deterministic pricing & volume
    const pricingResult = await PricingService.calculateQuotePrice({
      gradeCode: input.concreteGradeCode,
      quantity: input.requiredQuantity,
      unit: input.inputUnit || "M3",
      wastagePercent: input.wastagePercent ?? 5.0,
      distanceKm: input.distanceKm || 15,
      pumpRequired: input.pumpRequired || false,
      pumpType: input.pumpType,
      discountCode: input.discountCode
    });

    const { volume, financials, gradeDetails } = pricingResult;

    // 2. Perform AI qualitative analysis
    const aiAnalysis = await QuoteAIService.analyzeQuote({
      projectName: input.projectName,
      projectType: input.projectType,
      constructionStage: input.constructionStage,
      floors: input.floors,
      selectedGrade: input.concreteGradeCode,
      calculatedVolumeM3: volume.recommendedVolumeM3,
      siteAddress: input.siteAddress,
      city: input.city,
      pincode: input.pincode,
      pumpRequired: input.pumpRequired || false,
      pumpType: input.pumpType
    });

    // 3. Set validity date (14 days from generation)
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 14);

    // 4. Save Quote to PostgreSQL
    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        userId: input.userId || null,
        customerId: input.customerId || null,
        projectId: input.projectId || null,
        version: 1,
        status: "GENERATED",

        // Project details
        projectName: input.projectName,
        projectType: input.projectType,
        constructionCategory: input.constructionCategory || null,
        customerName: input.customerName,
        companyName: input.companyName || null,
        phone: input.phone,
        email: input.email,
        siteAddress: input.siteAddress,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        projectDescription: input.projectDescription || null,

        // Construction details
        floors: input.floors || 1,
        builtUpArea: input.builtUpArea || null,
        constructionStage: input.constructionStage || null,
        estimatedDuration: input.estimatedDuration || null,
        pouringFrequency: input.pouringFrequency || null,
        estimatedPourDate: input.estimatedPourDate ? new Date(input.estimatedPourDate) : null,
        projectScale: input.projectScale || null,
        constructionType: input.constructionType || null,
        lengthMeters: input.lengthMeters || null,
        widthMeters: input.widthMeters || null,
        heightMeters: input.heightMeters || null,

        // Concrete requirements & delivery
        concreteGradeCode: gradeDetails.gradeCode,
        requiredQuantity: volume.recommendedVolumeM3,
        inputUnit: input.inputUnit || "M3",
        inputQuantity: input.requiredQuantity,
        wastagePercent: volume.wastagePercent,
        calculatedVolumeM3: volume.recommendedVolumeM3,
        slumpRequirement: input.slumpRequirement || "100-150 mm",
        specialRequirements: input.specialRequirements || null,
        preferredDeliveryWindow: input.preferredDeliveryWindow || null,
        pumpRequired: input.pumpRequired || false,
        pumpType: input.pumpType || null,
        siteAccessNotes: input.siteAccessNotes || null,

        // Financials
        subtotal: financials.concreteSubtotal,
        transportCost: financials.transportCost,
        pumpCost: financials.pumpCost,
        discountAmount: financials.discountAmount,
        taxableAmount: financials.taxableAmount,
        taxAmount: financials.taxAmount,
        totalAmount: financials.totalAmount,
        currency: financials.currency,

        // AI Analysis
        aiSummary: aiAnalysis.summary,
        aiRecommendedGrade: aiAnalysis.recommendedGrade,
        aiQuantityExplanation: aiAnalysis.quantityExplanation,
        aiDeliveryRecommendation: aiAnalysis.deliveryRecommendation,
        aiRiskNotes: aiAnalysis.riskNotes,
        aiCustomerNotes: aiAnalysis.customerNotes,

        validUntil,

        // Create Item line
        items: {
          create: [
            {
              gradeCode: gradeDetails.gradeCode,
              quantityM3: volume.recommendedVolumeM3,
              unit: "M3",
              unitPrice: financials.unitPrice,
              subtotal: financials.concreteSubtotal,
              description: gradeDetails.name
            }
          ]
        },

        // Create initial status history
        history: {
          create: [
            {
              toStatus: "GENERATED",
              notes: "Initial quote generated automatically with AI analysis.",
              changedBy: input.customerName
            }
          ]
        }
      },
      include: {
        items: true,
        history: true,
        versions: true
      }
    });

    // Save Version 1 Snapshot
    await this.createQuoteVersion(quote.id, 1, quote, input.customerName, "Initial Quote Generation");

    return quote;
  }

  /**
   * Create snapshot version history for a quote.
   */
  static async createQuoteVersion(
    quoteId: string, 
    versionNumber: number, 
    snapshotData: any, 
    changedBy?: string, 
    changeReason?: string
  ) {
    return await prisma.quoteVersion.create({
      data: {
        quoteId,
        versionNumber,
        snapshotData: JSON.parse(JSON.stringify(snapshotData)),
        changedBy: changedBy || "System",
        changeReason: changeReason || "Quote updated"
      }
    });
  }

  /**
   * Retrieves single quote by ID.
   */
  static async getQuoteById(id: string) {
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        items: true,
        history: { orderBy: { createdAt: "desc" } },
        versions: { orderBy: { versionNumber: "desc" } }
      }
    });

    if (!quote) throw new Error("Quotation not found.");

    // Check expiry status on fetch
    if (quote.status !== "EXPIRED" && quote.status !== "ACCEPTED" && quote.status !== "CONVERTED_TO_ORDER" && new Date() > new Date(quote.validUntil)) {
      await prisma.quote.update({
        where: { id },
        data: { status: "EXPIRED" }
      });
      quote.status = "EXPIRED";
    }

    return quote;
  }

  /**
   * List quotes filtered by user / customer ID.
   */
  static async getUserQuotes(userId?: string, email?: string) {
    const where: any = {};
    if (userId) {
      where.OR = [{ userId }, { customerId: userId }];
    } else if (email) {
      where.email = email;
    }

    return await prisma.quote.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        _count: { select: { versions: true } }
      }
    });
  }

  /**
   * Customer accepts a quotation.
   */
  static async acceptQuote(quoteId: string, acceptedBy: string) {
    const quote = await this.getQuoteById(quoteId);

    if (quote.status === "EXPIRED") {
      throw new Error("Cannot accept an expired quotation.");
    }
    if (quote.status === "ACCEPTED" || quote.status === "CONVERTED_TO_ORDER") {
      return quote;
    }

    const updated = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
        acceptedBy,
        history: {
          create: [
            {
              fromStatus: quote.status,
              toStatus: "ACCEPTED",
              changedBy: acceptedBy,
              notes: "Customer officially accepted the quotation."
            }
          ]
        }
      },
      include: { items: true, history: true }
    });

    return updated;
  }

  /**
   * Converts an accepted Quote directly into an official Order.
   */
  static async convertQuoteToOrder(quoteId: string, userId: string) {
    const quote = await this.getQuoteById(quoteId);

    if (quote.orderId) {
      const existingOrder = await prisma.order.findUnique({ where: { id: quote.orderId } });
      if (existingOrder) return existingOrder;
    }

    // Generate order number
    const year = new Date().getFullYear();
    const orderCount = await prisma.order.count();
    const orderNumber = `ORD-${year}-${(orderCount + 1).toString().padStart(6, "0")}`;

    // Create Order linked to Quote
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: quote.customerId || userId,
        projectId: quote.projectId || null,
        status: "CONFIRMED",
        concreteGrade: quote.concreteGradeCode,
        quantity: quote.calculatedVolumeM3,
        deliveryDate: quote.estimatedPourDate || quote.validUntil,
        deliveryAddress: quote.siteAddress,
        quoteId: quote.id
      }
    });

    // Update Quote status to CONVERTED_TO_ORDER
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: "CONVERTED_TO_ORDER",
        orderId: order.id,
        history: {
          create: [
            {
              fromStatus: quote.status,
              toStatus: "CONVERTED_TO_ORDER",
              changedBy: userId,
              notes: `Converted to official Order #${order.orderNumber}`
            }
          ]
        }
      }
    });

    return order;
  }

  /**
   * Create new revised version of a quote.
   */
  static async reviseQuote(quoteId: string, updates: Partial<CreateQuoteInput>, changedBy: string) {
    const existing = await this.getQuoteById(quoteId);
    const newVersionNum = existing.version + 1;

    // Recalculate if grade or volume changed
    const newGrade = updates.concreteGradeCode || existing.concreteGradeCode;
    const newQty = updates.requiredQuantity || existing.inputQuantity;
    const newUnit = updates.inputUnit || (existing.inputUnit as InputUnit);

    const pricingResult = await PricingService.calculateQuotePrice({
      gradeCode: newGrade,
      quantity: newQty,
      unit: newUnit,
      wastagePercent: updates.wastagePercent ?? existing.wastagePercent,
      distanceKm: updates.distanceKm || 15,
      pumpRequired: updates.pumpRequired ?? existing.pumpRequired,
      pumpType: updates.pumpType || existing.pumpType || undefined
    });

    const { volume, financials } = pricingResult;

    const updatedQuote = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        version: newVersionNum,
        status: "GENERATED",
        concreteGradeCode: newGrade,
        inputQuantity: newQty,
        inputUnit: newUnit,
        calculatedVolumeM3: volume.recommendedVolumeM3,
        requiredQuantity: volume.recommendedVolumeM3,
        subtotal: financials.concreteSubtotal,
        transportCost: financials.transportCost,
        pumpCost: financials.pumpCost,
        taxableAmount: financials.taxableAmount,
        taxAmount: financials.taxAmount,
        totalAmount: financials.totalAmount,
        history: {
          create: [
            {
              fromStatus: existing.status,
              toStatus: "GENERATED",
              changedBy,
              notes: `Quote revised to Version ${newVersionNum}`
            }
          ]
        }
      },
      include: { items: true, history: true, versions: true }
    });

    await this.createQuoteVersion(quoteId, newVersionNum, updatedQuote, changedBy, "Quote revision requested");

    return updatedQuote;
  }
}
