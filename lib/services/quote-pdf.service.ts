export class QuotePDFService {
  /**
   * Generates a corporate, professional HTML PDF template for printable quotation documents.
   */
  static generateQuotationHTML(quote: any): string {
    const formattedDate = new Date(quote.createdAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const formattedValidUntil = new Date(quote.validUntil).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: quote.currency || "INR",
        maximumFractionDigits: 0
      }).format(amount);
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Veera RMC Quotation ${quote.quoteNumber}</title>
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
      border-b: 3px solid #DA291C;
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
    .company-details {
      text-align: right;
      font-size: 12px;
      color: #495057;
    }
    .quote-badge {
      display: inline-block;
      padding: 4px 12px;
      background: #FF5A00;
      color: white;
      font-weight: bold;
      border-radius: 4px;
      font-size: 12px;
      margin-top: 5px;
    }
    .grid {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }
    .card {
      flex: 1;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 15px;
      font-size: 12px;
    }
    .card-title {
      font-weight: 700;
      font-size: 13px;
      color: #111111;
      border-b: 1px solid #dee2e6;
      padding-bottom: 6px;
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
      padding: 10px;
      font-weight: 600;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #dee2e6;
    }
    .totals-table {
      width: 320px;
      margin-left: auto;
      font-size: 13px;
    }
    .totals-table td {
      padding: 6px 10px;
    }
    .totals-table .grand-total {
      font-weight: 800;
      font-size: 16px;
      background: #f8f9fa;
      color: #DA291C;
      border-top: 2px solid #DA291C;
    }
    .ai-panel {
      background: #fff8f5;
      border: 1px solid #ffcca3;
      border-left: 4px solid #FF5A00;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
      font-size: 12px;
    }
    .ai-title {
      font-weight: 700;
      color: #FF5A00;
      margin-bottom: 6px;
    }
    .footer {
      border-t: 1px solid #dee2e6;
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
      padding: 10px 20px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right;">
    <button onclick="window.print()" class="btn-print">🖨️ Print / Save as PDF</button>
  </div>

  <div class="header">
    <div>
      <div class="logo"><span class="red">VEERA</span> <span class="green">CONCRETE</span></div>
      <div style="font-size: 12px; color: #6c757d; margin-top: 3px;">AI-Powered Smart Ready Mix Concrete Platform</div>
      <div class="quote-badge">QUOTATION #${quote.quoteNumber}</div>
    </div>
    <div class="company-details">
      <strong>Veera RMC Infrastructure Pvt. Ltd.</strong><br>
      GSTIN: 27AABCV1234F1ZM<br>
      Plant 01: Plot 45, Industrial Zone, MH<br>
      Email: quotes@veerarmc.com | Phone: +91 1800-200-8337
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Customer & Contact Information</div>
      <strong>${quote.customerName}</strong><br>
      ${quote.companyName ? `Company: ${quote.companyName}<br>` : ''}
      Phone: ${quote.phone}<br>
      Email: ${quote.email}
    </div>
    <div class="card">
      <div class="card-title">Project & Site Details</div>
      <strong>${quote.projectName}</strong> (${quote.projectType})<br>
      Site Address: ${quote.siteAddress}, ${quote.city}, ${quote.state} - ${quote.pincode}<br>
      Construction Stage: ${quote.constructionStage || 'Initial Structural Pour'}<br>
      Estimated Pour Date: ${quote.estimatedPourDate ? new Date(quote.estimatedPourDate).toLocaleDateString("en-IN") : 'Immediate Dispatch'}
    </div>
    <div class="card">
      <div class="card-title">Quotation Summary</div>
      Quote Date: <strong>${formattedDate}</strong><br>
      Valid Until: <strong style="color: #DA291C;">${formattedValidUntil}</strong><br>
      Status: <strong>${quote.status}</strong><br>
      Version: <strong>v${quote.version}</strong>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item Description</th>
        <th>Grade</th>
        <th>Quantity (m³)</th>
        <th>Unit Rate</th>
        <th style="text-align: right;">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>Ready Mix Concrete — ${quote.concreteGradeCode}</strong><br>
          <span style="font-size: 11px; color: #6c757d;">Input requested: ${quote.inputQuantity} ${quote.inputUnit} (+ ${quote.wastagePercent}% wastage allowance)</span>
        </td>
        <td><strong>${quote.concreteGradeCode}</strong></td>
        <td>${quote.calculatedVolumeM3} m³</td>
        <td>${formatCurrency(quote.items?.[0]?.unitPrice || Math.round(quote.subtotal / quote.calculatedVolumeM3))}</td>
        <td style="text-align: right;">${formatCurrency(quote.subtotal)}</td>
      </tr>
    </tbody>
  </table>

  <table class="totals-table">
    <tr>
      <td>Concrete Subtotal:</td>
      <td style="text-align: right;">${formatCurrency(quote.subtotal)}</td>
    </tr>
    ${quote.transportCost > 0 ? `
    <tr>
      <td>Transit Mixer Transport:</td>
      <td style="text-align: right;">${formatCurrency(quote.transportCost)}</td>
    </tr>` : ''}
    ${quote.pumpCost > 0 ? `
    <tr>
      <td>Concrete Pump Charge (${quote.pumpType || 'Line Pump'}):</td>
      <td style="text-align: right;">${formatCurrency(quote.pumpCost)}</td>
    </tr>` : ''}
    ${quote.discountAmount > 0 ? `
    <tr style="color: #008C45;">
      <td>Promotional Discount:</td>
      <td style="text-align: right;">-${formatCurrency(quote.discountAmount)}</td>
    </tr>` : ''}
    <tr>
      <td>Taxable Amount:</td>
      <td style="text-align: right;"><strong>${formatCurrency(quote.taxableAmount)}</strong></td>
    </tr>
    <tr>
      <td>GST (18%):</td>
      <td style="text-align: right;">${formatCurrency(quote.taxAmount)}</td>
    </tr>
    <tr class="grand-total">
      <td>Estimated Total:</td>
      <td style="text-align: right;">${formatCurrency(quote.totalAmount)}</td>
    </tr>
  </table>

  ${quote.aiSummary ? `
  <div class="ai-panel">
    <div class="ai-title">🤖 Veera AI Technical Assessment & Recommendation</div>
    <div>${quote.aiSummary}</div>
    ${quote.aiQuantityExplanation ? `<div style="margin-top: 6px;"><strong>Quantity Note:</strong> ${quote.aiQuantityExplanation}</div>` : ''}
    ${quote.aiDeliveryRecommendation ? `<div style="margin-top: 6px;"><strong>Delivery & Access:</strong> ${quote.aiDeliveryRecommendation}</div>` : ''}
  </div>` : ''}

  <div style="background: #f8f9fa; border-radius: 6px; padding: 12px; font-size: 11px; color: #495057;">
    <strong>Standard Terms & Conditions:</strong>
    <ol style="margin: 4px 0 0 15px; padding: 0;">
      <li>Quotation is valid for 14 days from quote generation date (${formattedValidUntil}).</li>
      <li>Prices are inclusive of standard 90-minute unloading window. Detention charges apply beyond 90 minutes.</li>
      <li>Final structural concrete grade selection must be verified and approved by a qualified structural engineer.</li>
      <li>Payment terms: 50% advance upon order confirmation, balance prior to transit mixer dispatch.</li>
    </ol>
  </div>

  <div class="footer">
    Veera RMC 2.0 Enterprise Platform | Automated Quotation Engine | www.veerarmc.com
  </div>
</body>
</html>
`;
  }
}
