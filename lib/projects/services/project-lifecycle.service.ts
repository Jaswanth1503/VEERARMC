import { prisma } from "@/lib/prisma";
import { CreateProjectInput, UpdateProjectInput } from "../validations/project.schema";
import { ProjectDetailDTO, PhaseName } from "../types/project";
import { ProjectHealthService } from "./project-health.service";
import { ProjectActivityService } from "./project-activity.service";

const STANDARD_PHASES: { name: PhaseName; sequence: number }[] = [
  { name: "Initiation", sequence: 1 },
  { name: "Planning", sequence: 2 },
  { name: "Procurement", sequence: 3 },
  { name: "Production", sequence: 4 },
  { name: "Logistics", sequence: 5 },
  { name: "Execution", sequence: 6 },
  { name: "Completion", sequence: 7 }
];

export class ProjectLifecycleService {

  /**
   * Generates a sequential Project Code e.g. PRJ-2026-001
   */
  static async generateProjectCode(): Promise<string> {
    const year = new Date().getFullYear();
    try {
      const count = await prisma.project.count();
      const codeNumber = String(count + 1).padStart(3, "0");
      return `PRJ-${year}-${codeNumber}`;
    } catch (e) {
      return `PRJ-${year}-${Math.floor(100 + Math.random() * 900)}`;
    }
  }

  /**
   * Creates a new Project and automatically initializes its standard lifecycle phases,
   * milestones, budget categories, team assignment, and audit log.
   */
  static async createProject(input: CreateProjectInput, currentUserId: string, currentUserName = "Executive"): Promise<ProjectDetailDTO> {
    const projectCode = await this.generateProjectCode();
    const customerId = input.customerId || currentUserId;

    const startDate = input.startDate ? new Date(input.startDate) : new Date();
    const targetDate = input.targetDate ? new Date(input.targetDate) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days default

    // Create Project
    const project = await prisma.project.create({
      data: {
        projectCode,
        projectName: input.projectName,
        location: input.location || "Pune, Maharashtra",
        description: input.description || `Turnkey Ready-Mix concrete execution for ${input.projectName}.`,
        status: "ACTIVE",
        priority: input.priority,
        startDate,
        targetDate,
        estimatedValue: input.estimatedValue || 1850000,
        actualValue: 0,
        progressPercentage: 15,
        healthScore: 96.0,
        customerId,
        contractorId: input.contractorId || null,
        projectManagerId: input.projectManagerId || currentUserId
      }
    });

    const projectId = project.id;

    // Seed Standard 7 Phases
    try {
      await Promise.all(
        STANDARD_PHASES.map((p, idx) =>
          prisma.projectPhase.create({
            data: {
              projectId,
              phaseName: p.name,
              sequence: p.sequence,
              status: idx === 0 ? "IN_PROGRESS" : "PENDING",
              progress: idx === 0 ? 40 : 0
            }
          })
        )
      );

      // Seed Initial Milestones
      await prisma.projectMilestone.createMany({
        data: [
          {
            projectId,
            title: "Blueprint Analysis & Mix Design Approval (IS 10262)",
            description: "Finalize slump retention, water-binder ratio and chemical admixture approvals.",
            targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: "IN_PROGRESS",
            ownerName: "QA In-Charge",
            concreteVolumeM3: 0
          },
          {
            projectId,
            title: "Foundation Raft Casting (Phase 1)",
            description: "High-volume monolithic foundation casting with dedicated boom pump.",
            targetDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
            status: "PENDING",
            ownerName: "Batch Plant Lead",
            concreteVolumeM3: Math.round(input.initialConcreteVolumeM3 * 0.45)
          },
          {
            projectId,
            title: "Plinth & Columns Continuous Pour (Phase 2)",
            description: "Staggered transit mixer dispatch wave across early morning slots.",
            targetDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
            status: "PENDING",
            ownerName: "Logistics Controller",
            concreteVolumeM3: Math.round(input.initialConcreteVolumeM3 * 0.55)
          },
          {
            projectId,
            title: "28-Day Cube Compressive Strength Sign-off",
            description: "Final NABL accredited compressive test certificate generation.",
            targetDate: new Date(Date.now() + 58 * 24 * 60 * 60 * 1000),
            status: "PENDING",
            ownerName: "Chief Technical Officer",
            concreteVolumeM3: 0
          }
        ]
      });

      // Seed Initial Standard Budget Categories
      const estTotal = input.estimatedValue || 1850000;
      await prisma.projectBudget.createMany({
        data: [
          { projectId, category: "CONCRETE_SUPPLY", estimatedAmount: Math.round(estTotal * 0.72), actualAmount: 0, variance: 0 },
          { projectId, category: "PUMPING", estimatedAmount: Math.round(estTotal * 0.12), actualAmount: 0, variance: 0 },
          { projectId, category: "LOGISTICS", estimatedAmount: Math.round(estTotal * 0.08), actualAmount: 0, variance: 0 },
          { projectId, category: "TESTING", estimatedAmount: Math.round(estTotal * 0.03), actualAmount: 0, variance: 0 },
          { projectId, category: "CONTINGENCY", estimatedAmount: Math.round(estTotal * 0.05), actualAmount: 0, variance: 0 }
        ]
      });

      // Seed Initial Project Assignments
      await prisma.projectAssignment.createMany({
        data: [
          { projectId, userId: currentUserId, userName: currentUserName, role: "PROJECT_MANAGER" },
          { projectId, userName: "Plant Operations Hub", role: "OPERATIONS" },
          { projectId, userName: "Fleet Dispatch Lead", role: "LOGISTICS" },
          { projectId, userName: "IS 456 Quality Lead", role: "QA_ENGINEER" }
        ]
      });

      // Seed Initial Risk
      await prisma.projectRisk.create({
        data: {
          projectId,
          riskType: "LOGISTICS",
          title: "Peak Highway Transit Congestion during Morning Pour",
          description: "Transit from Plant to project site passes through heavy traffic corridors.",
          severity: "MEDIUM",
          probability: "MEDIUM",
          mitigationPlan: "Stagger transit mixer departure to 05:30 AM early morning wave."
        }
      });

      // Log Project Creation Activity & Timeline
      await ProjectActivityService.logActivity({
        projectId,
        activityType: "PROJECT_CREATED",
        description: `Project "${project.projectName}" (${projectCode}) was created by ${currentUserName}. Initialized with 7 phases, 4 milestones, and standard budget allocation.`,
        userId: currentUserId,
        userName: currentUserName,
        addToTimeline: true,
        timelineEvent: {
          eventType: "PROJECT_CREATED",
          title: `Project ${projectCode} Created`
        }
      });
    } catch (e: any) {
      console.warn("[ProjectLifecycleService Warning] Supplementary initialization warning:", e.message);
    }

    return this.getProjectById(projectId);
  }

  /**
   * Retrieves full project details with all related sub-entities, health metrics, and calculations.
   */
  static async getProjectById(projectId: string): Promise<ProjectDetailDTO> {
    const project = await prisma.project.findUniqueOrThrow({
      where: { id: projectId },
      include: {
        customer: { select: { id: true, fullName: true, email: true } },
        contractor: { select: { id: true, fullName: true } },
        phases: { orderBy: { sequence: "asc" } },
        milestones: { orderBy: { targetDate: "asc" } },
        tasks: { orderBy: { createdAt: "desc" } },
        assignments: { orderBy: { assignedAt: "asc" } },
        budgets: true,
        risks: { orderBy: { createdAt: "desc" } },
        documents: { orderBy: { createdAt: "desc" } },
        activities: { orderBy: { createdAt: "desc" }, take: 20 },
        timelines: { orderBy: { eventDate: "asc" } },
        orders: { select: { id: true, status: true, totalQuantity: true, totalAmount: true } },
        quotes: { select: { id: true } },
        blueprintAnalyses: { select: { id: true } }
      }
    });

    const delayedMilestonesCount = project.milestones.filter(m => m.status === "DELAYED").length;
    const criticalRisksCount = project.risks.filter(r => r.severity === "CRITICAL" && r.status !== "RESOLVED").length;
    const highRisksCount = project.risks.filter(r => r.severity === "HIGH" && r.status !== "RESOLVED").length;
    const deliveredOrdersCount = project.orders.filter(o => o.status === "COMPLETED" || o.status === "DELIVERED").length;

    const health = ProjectHealthService.calculateHealth({
      progressPercentage: project.progressPercentage,
      estimatedValue: project.estimatedValue,
      actualValue: project.actualValue,
      delayedMilestonesCount,
      criticalRisksCount,
      highRisksCount,
      ordersCount: project.orders.length,
      deliveredOrdersCount,
      targetDate: project.targetDate
    });

    const totalVolumeM3 = project.orders.reduce((acc, curr) => acc + (curr.totalQuantity || 0), 0);

    return {
      id: project.id,
      projectCode: project.projectCode || `PRJ-${project.id.slice(0, 8).toUpperCase()}`,
      projectName: project.projectName,
      location: project.location,
      description: project.description,
      status: (project.status as any) || "ACTIVE",
      priority: (project.priority as any) || "MEDIUM",
      startDate: project.startDate?.toISOString() || null,
      targetDate: project.targetDate?.toISOString() || null,
      completedDate: project.completedDate?.toISOString() || null,
      estimatedValue: project.estimatedValue,
      actualValue: project.actualValue,
      progressPercentage: project.progressPercentage,
      healthScore: health.healthScore,
      customerId: project.customerId,
      customerName: project.customer.fullName,
      customerEmail: project.customer.email,
      contractorId: project.contractorId,
      contractorName: project.contractor?.fullName || null,
      projectManagerId: project.projectManagerId,

      phases: project.phases.map(p => ({
        id: p.id,
        projectId: p.projectId,
        phaseName: p.phaseName,
        sequence: p.sequence,
        status: p.status as any,
        startDate: p.startDate?.toISOString() || null,
        endDate: p.endDate?.toISOString() || null,
        progress: p.progress
      })),

      milestones: project.milestones.map(m => ({
        id: m.id,
        projectId: m.projectId,
        title: m.title,
        description: m.description,
        targetDate: m.targetDate.toISOString(),
        completionDate: m.completionDate?.toISOString() || null,
        status: m.status as any,
        ownerName: m.ownerName,
        dependencyMilestoneId: m.dependencyMilestoneId,
        concreteVolumeM3: m.concreteVolumeM3,
        orderId: m.orderId
      })),

      tasks: project.tasks.map(t => ({
        id: t.id,
        projectId: t.projectId,
        milestoneId: t.milestoneId,
        title: t.title,
        description: t.description,
        priority: t.priority as any,
        status: t.status as any,
        dueDate: t.dueDate?.toISOString() || null,
        assignedToId: t.assignedToId,
        assignedToName: t.assignedToName,
        dependencyTaskId: t.dependencyTaskId,
        estimatedHours: t.estimatedHours,
        actualHours: t.actualHours
      })),

      assignments: project.assignments.map(a => ({
        id: a.id,
        projectId: a.projectId,
        userId: a.userId,
        userName: a.userName,
        userEmail: a.userEmail,
        role: a.role as any,
        assignedAt: a.assignedAt.toISOString()
      })),

      budgets: project.budgets.map(b => ({
        id: b.id,
        projectId: b.projectId,
        category: b.category as any,
        estimatedAmount: b.estimatedAmount,
        actualAmount: b.actualAmount,
        variance: b.variance
      })),

      risks: project.risks.map(r => ({
        id: r.id,
        projectId: r.projectId,
        riskType: r.riskType as any,
        title: r.title,
        description: r.description,
        severity: r.severity as any,
        probability: r.probability as any,
        mitigationPlan: r.mitigationPlan,
        status: r.status as any
      })),

      documents: project.documents.map(d => ({
        id: d.id,
        projectId: d.projectId,
        documentType: d.documentType as any,
        title: d.title,
        fileUrl: d.fileUrl,
        fileSize: d.fileSize,
        uploadedById: d.uploadedById,
        uploadedByName: d.uploadedByName,
        createdAt: d.createdAt.toISOString()
      })),

      activities: project.activities.map(a => ({
        id: a.id,
        projectId: a.projectId,
        activityType: a.activityType as any,
        description: a.description,
        userId: a.userId,
        userName: a.userName,
        metadataJson: a.metadataJson,
        createdAt: a.createdAt.toISOString()
      })),

      timelines: project.timelines.map(tl => ({
        id: tl.id,
        projectId: tl.projectId,
        eventType: tl.eventType,
        title: tl.title,
        description: tl.description,
        eventDate: tl.eventDate.toISOString(),
        status: tl.status
      })),

      ordersCount: project.orders.length,
      quotesCount: project.quotes.length,
      blueprintsCount: project.blueprintAnalyses.length,
      totalVolumeM3,
      health,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString()
    };
  }

  /**
   * Updates project details and recalculates health score
   */
  static async updateProject(projectId: string, input: UpdateProjectInput, userId?: string, userName = "User"): Promise<ProjectDetailDTO> {
    const data: any = {};
    if (input.projectName) data.projectName = input.projectName;
    if (input.location !== undefined) data.location = input.location;
    if (input.description !== undefined) data.description = input.description;
    if (input.status) data.status = input.status;
    if (input.priority) data.priority = input.priority;
    if (input.startDate) data.startDate = new Date(input.startDate);
    if (input.targetDate) data.targetDate = new Date(input.targetDate);
    if (input.completedDate) data.completedDate = new Date(input.completedDate);
    if (input.estimatedValue !== undefined) data.estimatedValue = input.estimatedValue;
    if (input.actualValue !== undefined) data.actualValue = input.actualValue;
    if (input.progressPercentage !== undefined) data.progressPercentage = input.progressPercentage;
    if (input.projectManagerId !== undefined) data.projectManagerId = input.projectManagerId;

    await prisma.project.update({
      where: { id: projectId },
      data
    });

    await ProjectActivityService.logActivity({
      projectId,
      activityType: "STATUS_CHANGED",
      description: `Project parameters updated by ${userName}. Status: ${input.status || "ACTIVE"}, Progress: ${input.progressPercentage ?? "Current"}%`,
      userId,
      userName
    });

    return this.getProjectById(projectId);
  }
}
