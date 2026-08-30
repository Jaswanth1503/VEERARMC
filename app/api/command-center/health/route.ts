import { NextRequest, NextResponse } from "next/server";
import { BusinessHealthService } from "@/lib/command-center/services/business-health.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const health = await BusinessHealthService.calculateUnifiedHealth();
    return NextResponse.json({
      success: true,
      health
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to load health telemetry" }, { status: 500 });
  }
}
