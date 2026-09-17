/**
 * Phase 7A: Enterprise Project Management & Execution Platform Types
 */

export type ProjectStatus = "PLANNING" | "ACTIVE" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CLOSED";
export type ProjectPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type PhaseName = 
  | "Initiation" 
  | "Planning" 
  | "Procurement" 
  | "Production" 
  | "Logistics" 
  | "Execution" 
  | "Completion";

export type PhaseStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";

export type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BLOCKED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type ProjectRole = 
  | "PROJECT_MANAGER" 
  | "SALES" 
  | "OPERATIONS" 
  | "PLANT" 
  | "LOGISTICS" 
  | "QA_ENGINEER" 
  | "CONTRACTOR";

export type BudgetCategory = 
  | "CONCRETE_SUPPLY" 
  | "PUMPING" 
  | "LOGISTICS" 
  | "TESTING" 
  | "CONTINGENCY";

export type RiskType = 
  | "OPERATIONAL" 
  | "FINANCIAL" 
  | "SCHEDULE" 
  | "LOGISTICS" 
  | "PRODUCTION" 
  | "CUSTOMER";

export type RiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RiskProbability = "LOW" | "MEDIUM" | "HIGH";
export type RiskStatus = "IDENTIFIED" | "MITIGATING" | "RESOLVED" | "CLOSED";

export type DocumentType = 
  | "BLUEPRINT" 
  | "CONTRACT" 
  | "INVOICE" 
  | "SITE_DOCUMENT" 
  | "QC_REPORT" 
  | "APPROVAL";

export type ActivityType = 
  | "PROJECT_CREATED"
  | "MILESTONE_UPDATED" 
  | "TASK_CREATED" 
  | "TASK_COMPLETED" 
  | "RISK_FLAGGED" 
  | "BUDGET_UPDATED" 
  | "COMMENT_ADDED" 
  | "DOCUMENT_UPLOADED" 
  | "STATUS_CHANGED";

export interface ProjectPhaseDTO {
  id: string;
  projectId: string;
  phaseName: string;
  sequence: number;
  status: PhaseStatus;
  startDate?: string | null;
  endDate?: string | null;
  progress: number;
}

export interface ProjectMilestoneDTO {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  targetDate: string;
  completionDate?: string | null;
  status: MilestoneStatus;
  ownerName?: string | null;
  dependencyMilestoneId?: string | null;
  concreteVolumeM3?: number | null;
  orderId?: string | null;
}

export interface ProjectTaskDTO {
  id: string;
  projectId: string;
  milestoneId?: string | null;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  dependencyTaskId?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
}

export interface ProjectAssignmentDTO {
  id: string;
  projectId: string;
  userId?: string | null;
  userName: string;
  userEmail?: string | null;
  role: ProjectRole;
  assignedAt: string;
}

export interface ProjectBudgetDTO {
  id: string;
  projectId: string;
  category: BudgetCategory;
  estimatedAmount: number;
  actualAmount: number;
  variance: number;
}

export interface ProjectRiskDTO {
  id: string;
  projectId: string;
  riskType: RiskType;
  title: string;
  description?: string | null;
  severity: RiskSeverity;
  probability: RiskProbability;
  mitigationPlan?: string | null;
  status: RiskStatus;
}

export interface ProjectDocumentDTO {
  id: string;
  projectId: string;
  documentType: DocumentType;
  title: string;
  fileUrl: string;
  fileSize?: string | null;
  uploadedById?: string | null;
  uploadedByName?: string | null;
  createdAt: string;
}

export interface ProjectActivityDTO {
  id: string;
  projectId: string;
  activityType: ActivityType;
  description: string;
  userId?: string | null;
  userName?: string | null;
  metadataJson?: any;
  createdAt: string;
}

export interface ProjectTimelineEventDTO {
  id: string;
  projectId: string;
  eventType: string;
  title: string;
  description?: string | null;
  eventDate: string;
  status: string;
}

export interface ProjectHealthMetrics {
  healthScore: number; // 0 - 100
  status: "OPTIMAL" | "ATTENTION" | "CRITICAL";
  progressScore: number;
  budgetScore: number;
  timelineScore: number;
  riskScore: number;
  deliveryScore: number;
  recommendations: string[];
}

export interface ProjectDetailDTO {
  id: string;
  projectCode: string;
  projectName: string;
  location?: string | null;
  description?: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate?: string | null;
  targetDate?: string | null;
  completedDate?: string | null;
  estimatedValue: number;
  actualValue: number;
  progressPercentage: number;
  healthScore: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
  contractorId?: string | null;
  contractorName?: string | null;
  projectManagerId?: string | null;
  projectManagerName?: string | null;

  phases: ProjectPhaseDTO[];
  milestones: ProjectMilestoneDTO[];
  tasks: ProjectTaskDTO[];
  assignments: ProjectAssignmentDTO[];
  budgets: ProjectBudgetDTO[];
  risks: ProjectRiskDTO[];
  documents: ProjectDocumentDTO[];
  activities: ProjectActivityDTO[];
  timelines: ProjectTimelineEventDTO[];

  // Linked Entities
  ordersCount: number;
  quotesCount: number;
  blueprintsCount: number;
  totalVolumeM3: number;

  health: ProjectHealthMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectAnalyticsSummary {
  completionRatePercent: number;
  totalContractValueINR: number;
  totalActualCostINR: number;
  profitabilityMarginPercent: number;
  budgetVarianceINR: number;
  activeTasksCount: number;
  completedTasksCount: number;
  delayedMilestonesCount: number;
  criticalRisksCount: number;
  onTimeDeliveryRatePercent: number;
}
