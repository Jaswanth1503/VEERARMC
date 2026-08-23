import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { BlueprintService } from "@/lib/services/blueprint.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const formData = await request.formData();

    const title = formData.get("title") as string || undefined;
    const projectId = formData.get("projectId") as string || undefined;
    const fileEntries = formData.getAll("files");

    if (!fileEntries || fileEntries.length === 0) {
      return NextResponse.json({ error: "No document files provided." }, { status: 400 });
    }

    const filesToUpload = [];
    for (const entry of fileEntries) {
      if (entry instanceof File) {
        const arrayBuffer = await entry.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        filesToUpload.push({
          buffer,
          originalName: entry.name,
          mimeType: entry.type || "application/pdf"
        });
      }
    }

    const analysis = await BlueprintService.uploadAndAnalyzeBlueprint({
      userId: session?.userId || undefined,
      projectId,
      title,
      files: filesToUpload
    });

    return NextResponse.json({ analysis }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/blueprints/upload] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process blueprint upload" }, { status: 500 });
  }
}
