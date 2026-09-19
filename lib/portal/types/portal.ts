export interface CustomerDashboardMetrics {
  activeProjectsCount: number;
  activeOrdersCount: number;
  transitMixersCount: number;
  totalDeliveredVolume: number; // m³
  totalOrderedVolume: number;   // m³
  outstandingBalance: number;   // ₹
  pendingInvoicesCount: number;
  openTicketsCount: number;
  nextPourSchedule: {
    date: string;
    time: string;
    site: string;
    grade: string;
    volume: number;
  } | null;
  aiAlerts: Array<{
    id: string;
    type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
    title: string;
    message: string;
    timestamp: string;
    actionUrl?: string;
  }>;
}

export interface PortalProjectItem {
  id: string;
  code: string;
  name: string;
  siteAddress: string;
  status: string;
  progress: number;
  healthScore: number;
  targetCompletionDate: string;
  totalOrders: number;
  totalVolumeOrdered: number;
  totalVolumeDelivered: number;
  gradesUsed: string[];
}

export interface PortalOrderItem {
  id: string;
  orderNumber: string;
  projectName: string;
  projectCode: string;
  concreteGrade: string;
  slumpMm: number;
  quantityOrdered: number;
  quantityDelivered: number;
  status: 'PLACED' | 'BATCHING' | 'DISPATCHED' | 'IN_TRANSIT' | 'POURING' | 'COMPLETED' | 'CANCELLED';
  pourDateTime: string;
  deliveryAddress: string;
  plantName: string;
  activeMixerTruckNumber?: string;
  activeDriverName?: string;
  activeDriverPhone?: string;
  etaMinutes?: number;
}

export interface PortalDeliveryItem {
  id: string;
  tripId: string;
  orderNumber: string;
  projectName: string;
  truckNumber: string;
  driverName: string;
  driverPhone: string;
  status: 'LOADING' | 'DISPATCHED' | 'IN_TRANSIT' | 'AT_SITE' | 'POURING' | 'COMPLETED';
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  speedKmh: number;
  etaMinutes: number;
  concreteTempC: number;
  slumpRetentionMinRemaining: number;
  slumpRetentionTotalMin: number;
  dispatchedAt: string;
  pourDestination: string;
}

export interface PortalDocumentItem {
  id: string;
  title: string;
  type: 'CAD_BLUEPRINT' | 'DELIVERY_SLIP' | 'NABL_CERTIFICATE' | 'GST_INVOICE' | 'QUALITY_REPORT';
  category: string;
  fileUrl: string;
  fileSize: string;
  uploadedAt: string;
  orderNumber?: string;
  projectCode?: string;
  isVerified: boolean;
  hash?: string;
}

export interface PortalInvoiceItem {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  projectName: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxGst: number;
  freightCharge: number;
  pumpingCharge: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'PAID' | 'PARTIAL' | 'DUE' | 'OVERDUE';
  downloadUrl: string;
}

export interface PortalSupportTicketItem {
  id: string;
  ticketNumber: string;
  subject: string;
  category: 'DELIVERY_DELAY' | 'QUALITY_ISSUE' | 'BILLING_DISPUTE' | 'TECHNICAL_SUPPORT' | 'GENERAL_ENQUIRY';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  description: string;
  createdAt: string;
  updatedAt: string;
  slaHoursRemaining?: number;
}

export interface CustomerFeedbackPayload {
  orderId?: string;
  rating: number; // 1 to 5
  category: string;
  comments?: string;
}
