import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { QuoteService } from "@/lib/services/quote.service";
import { PricingService } from "@/lib/services/pricing.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Public endpoint for available concrete grades
    if (action === "grades") {
      const grades = await PricingService.getAvailableConcreteGrades();
      return NextResponse.json({ grades });
    }

    const session = await getSession();
    const userId = session?.userId;
    const email = searchParams.get("email") || undefined;

    const quotes = await QuoteService.getUserQuotes(userId, email);
    return NextResponse.json({ quotes });
  } catch (error: any) {
    console.error("[GET /api/quotes] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve quotations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();

    // Basic Input Validation
    if (!body.projectName || !body.customerName || !body.phone || !body.email || !body.siteAddress || !body.pincode) {
      return NextResponse.json({ error: "Missing required contact or project information." }, { status: 400 });
    }
    if (!body.concreteGradeCode || !body.requiredQuantity || body.requiredQuantity <= 0) {
      return NextResponse.json({ error: "Please select a valid concrete grade and quantity > 0." }, { status: 400 });
    }

    // Attach user ID if logged in
    const inputData = {
      ...body,
      userId: session?.userId || body.userId || null,
      customerId: session?.userId || body.customerId || null
    };

    const quote = await QuoteService.createQuote(inputData);

    return NextResponse.json({ quote }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/quotes] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate quotation" }, { status: 500 });
  }
}
