import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const items = await prisma.inventory.findMany({
      orderBy: { itemName: "asc" }
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("[GET /api/inventory] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch inventory" }, { status: 500 });
  }
}
