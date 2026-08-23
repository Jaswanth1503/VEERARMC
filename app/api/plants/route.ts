import { NextRequest, NextResponse } from "next/server";
import { PlantCapacityService } from "@/lib/production/services/plant-capacity.service";
import { ProductionService } from "@/lib/production/services/production.service";
import { PlantSchema } from "@/lib/production/validations/production.schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date") || undefined;

    const plants = await PlantCapacityService.getPlantsWithCapacity(date);

    return NextResponse.json({ plants });
  } catch (error: any) {
    console.error("[GET /api/plants] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch plants" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = PlantSchema.parse(body);

    const plant = await ProductionService.createPlant(validated);

    return NextResponse.json({ plant, message: "Batching plant registered successfully." }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/plants] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create plant" }, { status: 400 });
  }
}
