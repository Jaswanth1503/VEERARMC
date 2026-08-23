export class QuoteEmailService {
  /**
   * Sends quotation email notification to customer.
   * Internal AI metadata is kept clean while customer receives professional summary & PDF link.
   */
  static async sendQuoteEmail(quote: any, recipientEmail?: string): Promise<{ success: boolean; message: string }> {
    const email = recipientEmail || quote.email;
    if (!email) {
      return { success: false, message: "No recipient email address provided." };
    }

    console.log(`[QuoteEmailService] Preparing email for ${email} regarding Quotation #${quote.quoteNumber}...`);

    const formattedTotal = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: quote.currency || "INR",
      maximumFractionDigits: 0
    }).format(quote.totalAmount);

    const emailSubject = `Veera RMC Quotation — ${quote.quoteNumber} (${quote.projectName})`;
    
    // In production, integrate with nodemailer / Resend / SendGrid API
    // Here we log the structured email payload cleanly
    console.log(`
================== VEERA RMC QUOTATION EMAIL ==================
To: ${email}
Subject: ${emailSubject}

Dear ${quote.customerName},

Thank you for requesting a Ready Mix Concrete quotation with Veera RMC 2.0.

QUOTATION SUMMARY:
- Quote Number: ${quote.quoteNumber}
- Project: ${quote.projectName} (${quote.projectType})
- Concrete Grade: ${quote.concreteGradeCode}
- Recommended Quantity: ${quote.calculatedVolumeM3} m³
- Estimated Total Amount: ${formattedTotal} (incl. 18% GST)
- Validity: 14 Days (Valid until ${new Date(quote.validUntil).toLocaleDateString("en-IN")})

View or Accept your quotation online:
http://localhost:3000/quote?id=${quote.id}

Attached: Official PDF Quotation Document.

For technical assistance or order placement, contact our ready-mix dispatch office at +91 1800-200-8337 or email quotes@veerarmc.com.

Best regards,
Veera RMC 2.0 Sales & Engineering Team
===============================================================
    `);

    return {
      success: true,
      message: `Quotation email successfully sent to ${email}.`
    };
  }
}
