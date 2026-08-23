import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ProductionService } from "@/lib/production/services/production.service";
import { CreateBatchSchema } from "@/lib/production/validations/production.schema";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const planId = searchParams.get("planId");

    const where: any = {};
    if (planId) where.productionPlanId = planId;

    const batches = await prisma.productionBatch.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { productionPlan: { select: { planNumber: true, concreteGrade: true } } }
    });

    return NextResponse.json({ batches });
  } catch (error: any) {
    console.error("[GET /api/production/batches] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch batches" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();

    if (body.batchId && body.status) {
      // Update status of existing batch
      const updated = await ProductionService.updateBatchStatus(
        body.batchId,
        body.status,
        body.truckNumber,
        session?.fullName || body.operatorName
      );
      return NextResponse.json({ batch: updated, message: "Batch status updated." });
    }

    const validated = CreateBatchSchema.parse(body);

    const newBatch = await prisma.productionBatch.create({
      data: {
        productionPlanId: validated.productionPlanId,
        batchNumber: `B-${Date.now().toString().slice(-4)}`,
        concreteGrade: body.concreteGrade || "M25",
        quantity: validated.quantity,
        mixingTimeSeconds: validated.mixingTimeSeconds,
        waterCementRatio: validated.waterCementRatio,
        slumpMm: validated.slumpMm,
        temperatureCelsius: validated.temperatureCelsius,
        status: "MIXING",
        truckNumber: validated.truckNumber || "Transit Mixer",
        operatorName: session?.fullName || validated.operatorName
      }
    });

    return NextResponse.json({ batch: newBatch, message: "New batch started." }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/production/batches] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to execute batch" }, { status: 400 });
  }
}
