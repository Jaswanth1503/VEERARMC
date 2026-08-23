import { NextRequest, NextResponse } from "next/server";
import { BlueprintService } from "@/lib/services/blueprint.service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const analysis = await BlueprintService.getAnalysisById(id);

    const formattedDate = new Date(analysis.createdAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Veera RMC Blueprint Analysis Report — ${analysis.title}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; font-size: 12px; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #111111;
      background: #ffffff;
      margin: 0;
      padding: 30px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #FF5A00;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .logo {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -1px;
    }
    .logo .red { color: #DA291C; }
    .logo .green { color: #008C45; }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #FF5A00;
      color: white;
      font-size: 11px;
      font-weight: bold;
      border-radius: 4px;
      margin-top: 4px;
    }
    .grid {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }
    .card {
      flex: 1;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 12px;
      font-size: 12px;
    }
    .card-title {
      font-weight: 700;
      font-size: 13px;
      color: #111111;
      border-bottom: 1px solid #dee2e6;
      padding-bottom: 4px;
      margin-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 12px;
    }
    th {
      background: #212529;
      color: white;
      text-align: left;
      padding: 8px 10px;
      font-weight: 600;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #dee2e6;
    }
    .finding-card {
      border: 1px solid #dee2e6;
      border-left: 4px solid #FF5A00;
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 10px;
      font-size: 12px;
      background: #fff;
    }
    .disclaimer {
      background: #fff8f5;
      border: 1px solid #ffcca3;
      border-left: 4px solid #DA291C;
      padding: 12px;
      border-radius: 6px;
      font-size: 11px;
      color: #721c24;
      margin-top: 30px;
    }
    .footer {
      border-top: 1px solid #dee2e6;
      padding-top: 15px;
      margin-top: 30px;
      font-size: 11px;
      color: #6c757d;
      text-align: center;
    }
    .btn-print {
      background: #FF5A00;
      color: white;
      border: none;
      padding: 8px 16px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right;">
    <button onclick="window.print()" class="btn-print">🖨️ Print / Save Analysis PDF</button>
  </div>

  <div class="header">
    <div>
      <div class="logo"><span class="red">VEERA</span> <span class="green">CONCRETE</span></div>
      <div style="font-size: 12px; color: #6c757d;">AI Construction Blueprint Analysis Report</div>
      <div class="badge">${analysis.documentType}</div>
    </div>
    <div style="text-align: right; font-size: 12px; color: #495057;">
      Analysis ID: <strong>#${analysis.id.slice(0, 8)}</strong><br>
      Report Date: <strong>${formattedDate}</strong><br>
      Confidence: <strong>${analysis.overallConfidence}</strong>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Document & Project Overview</div>
      Title: <strong>${analysis.title}</strong><br>
      Building Type: ${analysis.buildingType || 'Residential / Commercial'}<br>
      Estimated Area: ${analysis.estimatedAreaSqFt?.toLocaleString("en-IN") || '1500'} sq ft<br>
      Floors Detected: ${analysis.floorsDetected || 1}
    </div>
    <div class="card">
      <div class="card-title">Calculated RMC Quantities</div>
      Total Estimated Volume: <strong style="font-size: 16px; color: #FF5A00;">${analysis.totalConcreteM3} m³</strong><br>
      Recommended Grade: <strong>${analysis.recommendedGrade || 'M25'}</strong><br>
      Structural Elements: ${analysis.measurements?.length || 0}
    </div>
  </div>

  <div style="margin-bottom: 20px;">
    <h3>AI Executive Summary</h3>
    <p style="background: #f8f9fa; p: 12px; border-radius: 6px; font-size: 12px; border: 1px solid #dee2e6;">
      ${analysis.summary}
    </p>
  </div>

  <h3>Extracted Structural Elements & Concrete Quantities</h3>
  <table>
    <thead>
      <tr>
        <th>Element Category</th>
        <th>Description / Label</th>
        <th>Dimensions</th>
        <th>Qty</th>
        <th>Specified Grade</th>
        <th>Calculated Vol (m³)</th>
      </tr>
    </thead>
    <tbody>
      ${analysis.measurements?.map((m: any) => `
        <tr>
          <td><strong>${m.elementCategory}</strong></td>
          <td>${m.label}</td>
          <td>${m.lengthMeters ? `${m.lengthMeters}m x ${m.widthMeters}m x ${m.heightMeters}m` : `${m.areaSqFt} sq ft`}</td>
          <td>${m.quantityCount}</td>
          <td><strong>${m.specifiedGrade || 'M25'}</strong></td>
          <td><strong>${m.calculatedVolM3} m³</strong></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  ${analysis.findings?.length > 0 ? `
  <h3>AI Analysis Findings & Identified Notes</h3>
  ${analysis.findings?.map((f: any) => `
    <div class="finding-card">
      <strong>[${f.category}] ${f.title}</strong> (Severity: ${f.severity} • Page ${f.sourcePage})<br>
      <span style="color: #495057;">${f.description}</span>
    </div>
  `).join('')}` : ''}

  <div class="disclaimer">
    <strong>HUMAN REVIEW & SAFETY DISCLAIMER:</strong><br>
    This report is generated using AI-assisted document analysis and is provided for Ready Mix Concrete estimation and planning purposes only. It is not a certified structural engineering advice, construction approval, or substitute for review by a qualified structural engineer.
  </div>

  <div class="footer">
    Veera RMC 2.0 Enterprise Platform | AI Blueprint Engine | www.veerarmc.com
  </div>
</body>
</html>
    `;

    return new Response(htmlContent, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  } catch (error: any) {
    console.error("[GET /api/blueprints/[id]/report] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to render blueprint report" }, { status: 500 });
  }
}
