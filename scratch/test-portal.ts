import { PortalDashboardService } from "../lib/portal/services/portal-dashboard.service";
import { PortalTrackingService } from "../lib/portal/services/portal-tracking.service";
import { PortalDocumentsService } from "../lib/portal/services/portal-documents.service";
import { PortalInvoicesService } from "../lib/portal/services/portal-invoices.service";
import { PortalSupportService } from "../lib/portal/services/portal-support.service";
import { PortalAiAssistantService } from "../lib/portal/services/portal-ai-assistant.service";

async function runTests() {
  console.log("=================================================");
  console.log("PHASE 7B: CUSTOMER PORTAL INTEGRATION TEST SUITE");
  console.log("=================================================");

  let passCount = 0;
  let testCount = 0;

  function assert(condition: boolean, testName: string) {
    testCount++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${testName}`);
    }
  }

  // Test 1: Dashboard Metrics
  try {
    const dashboard = await PortalDashboardService.getDashboardMetrics();
    assert(!!dashboard.metrics, "PortalDashboardService: metrics object exists");
    assert(dashboard.metrics.activeProjectsCount >= 0, "PortalDashboardService: activeProjectsCount is valid number");
    assert(dashboard.activeProjects.length > 0, "PortalDashboardService: returns activeProjects array");
    assert(dashboard.activeOrders.length > 0, "PortalDashboardService: returns activeOrders array");
    assert(dashboard.metrics.aiAlerts.length > 0, "PortalDashboardService: generated AI alerts");
  } catch (e: any) {
    console.error("Test 1 error:", e);
    assert(false, "PortalDashboardService execution");
  }

  // Test 2: Live Tracking & Telemetry
  try {
    const deliveries = await PortalTrackingService.getDeliveries();
    assert(deliveries.length > 0, "PortalTrackingService: returns live deliveries");
    const active = deliveries[0];
    assert(!!active.truckNumber, "PortalTrackingService: delivery has truckNumber");
    assert(!!active.driverPhone, "PortalTrackingService: delivery has driverPhone");
    assert(active.concreteTempC > 0, "PortalTrackingService: concrete temperature telemetry valid");
    assert(active.slumpRetentionMinRemaining >= 0, "PortalTrackingService: slump retention window valid");
  } catch (e: any) {
    console.error("Test 2 error:", e);
    assert(false, "PortalTrackingService execution");
  }

  // Test 3: Document Vault
  try {
    const docs = await PortalDocumentsService.getDocuments(undefined, { type: "ALL" });
    assert(docs.length > 0, "PortalDocumentsService: returns documents");
    const nablDoc = docs.find(d => d.type === "NABL_CERTIFICATE");
    assert(!!nablDoc, "PortalDocumentsService: NABL test certificate exists");
    assert(nablDoc?.isVerified === true, "PortalDocumentsService: document is verified");
  } catch (e: any) {
    console.error("Test 3 error:", e);
    assert(false, "PortalDocumentsService execution");
  }

  // Test 4: Invoices & Financial Ledger
  try {
    const ledger = await PortalInvoicesService.getInvoices();
    assert(ledger.invoices.length > 0, "PortalInvoicesService: returns invoices list");
    assert(ledger.summary.totalInvoiced > 0, "PortalInvoicesService: totalInvoiced calculated");
    assert(ledger.summary.totalOutstanding >= 0, "PortalInvoicesService: totalOutstanding calculated");
  } catch (e: any) {
    console.error("Test 4 error:", e);
    assert(false, "PortalInvoicesService execution");
  }

  // Test 5: Support Tickets & Creation
  try {
    const tickets = await PortalSupportService.getTickets();
    assert(tickets.length > 0, "PortalSupportService: returns support tickets");

    const newTicket = await PortalSupportService.createTicket("00000000-0000-0000-0000-000000000001", {
      subject: "Test Pour Notification Route Delay",
      description: "Testing automated ticket creation from unit test suite.",
      category: "DELIVERY_DELAY",
      priority: "HIGH"
    });
    assert(!!newTicket.ticketNumber, "PortalSupportService: new ticket generated with ticketNumber");
    assert(newTicket.priority === "HIGH", "PortalSupportService: ticket priority set correctly");
  } catch (e: any) {
    console.error("Test 5 error:", e);
    assert(false, "PortalSupportService execution");
  }

  // Test 6: Customer Feedback Recording
  try {
    const fb = await PortalSupportService.recordFeedback("00000000-0000-0000-0000-000000000001", {
      rating: 5,
      category: "QUALITY",
      comments: "Excellent pumpability and early strength."
    });
    assert(fb.success === true, "PortalSupportService: customer feedback successfully recorded");
  } catch (e: any) {
    console.error("Test 6 error:", e);
    assert(false, "PortalSupportService: feedback recording");
  }

  // Test 7: AI Assistant Contextual Query
  try {
    const aiResp = await PortalAiAssistantService.queryAssistant(
      "00000000-0000-0000-0000-000000000001",
      "Customer",
      "Where is my transit mixer right now?"
    );
    assert(!!aiResp.answer && aiResp.answer.length > 10, "PortalAiAssistantService: returned answer");
    assert(Array.isArray(aiResp.suggestedActions) && aiResp.suggestedActions.length > 0, "PortalAiAssistantService: returned suggestedActions");
  } catch (e: any) {
    console.error("Test 7 error:", e);
    assert(false, "PortalAiAssistantService execution");
  }

  console.log("=================================================");
  console.log(`TEST RESULTS: ${passCount} / ${testCount} Passed`);
  console.log("=================================================");

  if (passCount === testCount) {
    console.log("ALL PHASE 7B UNIT TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } else {
    console.error("SOME PHASE 7B TESTS FAILED.");
    process.exit(1);
  }
}

runTests();
