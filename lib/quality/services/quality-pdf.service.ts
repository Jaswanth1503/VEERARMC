import { FullQualityPredictionReport } from "../types/quality";

export class QualityPDFService {
  /**
   * Generates a corporate, professional HTML PDF template for printable Quality & Strength Prediction reports.
   */
  static generateQualityReportHTML(report: FullQualityPredictionReport): string {
    const formattedDate = report.createdAt 
      ? new Date(report.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
      : new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

    const riskColor = report.riskLevel === "LOW" ? "#047857" : report.riskLevel === "MEDIUM" ? "#b45309" : "#b91c1c";
    const riskBg = report.riskLevel === "LOW" ? "#ecfdf5" : report.riskLevel === "MEDIUM" ? "#fffbeb" : "#fef2f2";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Veera RMC Quality Report ${report.inputs.concreteGrade} (${report.id || 'PRED'})</title>
  <style>
    @media print {
      body { margin: 0; padding: 15px; font-size: 11px; }
      .no-print { display: none !important; }
    }
    body {
      font-family: 'Segoe UI', Roboto, Arial, sans-serif;
      color: #111111;
      background: #ffffff;
      margin: 0;
      padding: 30px;
      line-height: 1.4;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #DA291C;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .logo {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -1px;
    }
    .logo .red { color: #DA291C; font-style: italic; }
    .logo .green { color: #008C45; }
    .company-details {
      text-align: right;
      font-size: 11px;
      color: #666666;
    }
    .report-title {
      background: #f8f9fa;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 15px 20px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .report-title h1 {
      margin: 0;
      font-size: 18px;
      color: #111111;
      font-weight: 800;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 12px;
      color: ${riskColor};
      background: ${riskBg};
      border: 1px solid ${riskColor}40;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .metric-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 12px;
      text-align: center;
    }
    .metric-label {
      font-size: 10px;
      font-weight: 800;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .metric-value {
      font-size: 22px;
      font-weight: 900;
      color: #111111;
    }
    .metric-sub {
      font-size: 10px;
      color: #6b7280;
      margin-top: 2px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      color: #111111;
      text-transform: uppercase;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 4px;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
      font-size: 11px;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background-color: #f3f4f6;
      font-weight: 700;
      color: #374151;
    }
    .box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 15px;
      font-size: 11px;
    }
    .disclaimer {
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #92400e;
      border-radius: 8px;
      padding: 10px;
      font-size: 10px;
      margin-top: 25px;
    }
    .print-btn {
      background: #DA291C;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>

  <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>

  <div class="header">
    <div class="logo">
      <span class="red">VEERA</span> <span class="green">CONCRETE</span>
    </div>
    <div class="company-details">
      <strong>VEERA READY MIX CONCRETE PVT LTD</strong><br>
      AI Quality & Concrete Technology Division<br>
      Date: ${formattedDate} | Report ID: ${report.id || 'PRED-LIVE'}
    </div>
  </div>

  <div class="report-title">
    <div>
      <h1>AI Concrete Quality & Compressive Strength Report</h1>
      <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">
        Grade Specification: <strong>${report.inputs.concreteGrade}</strong> (${report.inputs.targetStrengthMpa} MPa Target)
      </div>
    </div>
    <div class="badge">
      RISK LEVEL: ${report.riskLevel}
    </div>
  </div>

  <div class="metrics-grid">
    <div class="metric-card" style="background: #f3e8ff; border-color: #d8b4fe;">
      <div class="metric-label" style="color: #6b21a8;">Predicted Strength</div>
      <div class="metric-value" style="color: #581c87;">${report.predictedStrengthMpa} <span style="font-size: 12px;">MPa</span></div>
      <div class="metric-sub">at ${report.inputs.ageDays || 28} days curing age</div>
    </div>

    <div class="metric-card">
      <div class="metric-label">Target Requirement</div>
      <div class="metric-value">${report.inputs.targetStrengthMpa} <span style="font-size: 12px;">MPa</span></div>
      <div class="metric-sub">design specification</div>
    </div>

    <div class="metric-card" style="background: ${report.strengthMarginMpa >= 0 ? '#ecfdf5' : '#fef2f2'}; border-color: ${report.strengthMarginMpa >= 0 ? '#a7f3d0' : '#fecaca'};">
      <div class="metric-label">Strength Margin</div>
      <div class="metric-value" style="color: ${report.strengthMarginMpa >= 0 ? '#047857' : '#b91c1c'};">
        ${report.strengthMarginMpa >= 0 ? '+' : ''}${report.strengthMarginMpa} <span style="font-size: 12px;">MPa</span>
      </div>
      <div class="metric-sub">Predicted − Target buffer</div>
    </div>

    <div class="metric-card">
      <div class="metric-label">Model Confidence</div>
      <div class="metric-value">${report.confidenceScorePercent}%</div>
      <div class="metric-sub">matrix stability score</div>
    </div>
  </div>

  <div class="section-title">Mix Batch Proportions & Engineering Indicators (per m³)</div>
  <table>
    <thead>
      <tr>
        <th>Component</th>
        <th>Quantity (kg/m³)</th>
        <th>Engineering Parameter</th>
        <th>Calculated Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Cement Content</strong></td>
        <td>${report.inputs.cementKg} kg</td>
        <td><strong>Water-Binder Ratio (w/c)</strong></td>
        <td><strong>${report.calculatedFeatures.waterCementRatio.toFixed(3)}</strong></td>
      </tr>
      <tr>
        <td><strong>Water Content</strong></td>
        <td>${report.inputs.waterKg} kg</td>
        <td><strong>Total Binder Density</strong></td>
        <td>${report.calculatedFeatures.totalBinderKg} kg/m³</td>
      </tr>
      <tr>
        <td><strong>Fine Aggregate (Sand)</strong></td>
        <td>${report.inputs.fineAggregateKg} kg</td>
        <td><strong>Fine Aggregate Ratio</strong></td>
        <td>${report.calculatedFeatures.fineAggregatePercent}%</td>
      </tr>
      <tr>
        <td><strong>Coarse Aggregate (Gravel)</strong></td>
        <td>${report.inputs.coarseAggregateKg} kg</td>
        <td><strong>Coarse Aggregate Ratio</strong></td>
        <td>${report.calculatedFeatures.coarseAggregatePercent}%</td>
      </tr>
      <tr>
        <td><strong>Chemical Admixture</strong></td>
        <td>${report.inputs.admixtureKg || 0} kg</td>
        <td><strong>Admixture Dosage</strong></td>
        <td>${report.calculatedFeatures.admixturePercent}%</td>
      </tr>
      <tr>
        <td><strong>Supplementary (Fly Ash / Slag / Silica)</strong></td>
        <td>${(report.inputs.flyAshKg || 0) + (report.inputs.ggbsKg || 0) + (report.inputs.silicaFumeKg || 0)} kg</td>
        <td><strong>Curing Condition</strong></td>
        <td>${report.inputs.curingCondition || 'STANDARD_WATER_CURING'}</td>
      </tr>
    </tbody>
  </table>

  ${report.summary ? `
    <div class="section-title">Executive Summary</div>
    <div class="box">
      <strong>Executive Overview:</strong> ${report.summary}
    </div>
  ` : ''}

  ${report.explanation ? `
    <div class="section-title">AI Reasoning & Technical Breakdown</div>
    <div class="box">
      ${report.explanation}
    </div>
  ` : ''}

  ${report.recommendations && report.recommendations.length > 0 ? `
    <div class="section-title">Engineering Recommendations</div>
    <div class="box">
      <ul style="margin: 0; padding-left: 18px;">
        ${report.recommendations.map(r => `<li style="margin-bottom: 4px;">${r}</li>`).join('')}
      </ul>
    </div>
  ` : ''}

  <div class="disclaimer">
    <strong>Engineering & Quality Disclaimer:</strong> This report is an AI-assisted prediction generated for decision support. It does not replace mandatory laboratory concrete cube compressive strength testing, standard code specifications (IS 456 / ACI 318), or certified structural engineering approval.
  </div>

  <script>
    // Trigger print dialog automatically when loaded in popup window
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>
    `;
  }
}
