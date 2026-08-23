import { z } from "zod";

export const ConcreteMixInputSchema = z.object({
  concreteGrade: z.string().min(1, "Concrete grade is required"),
  cementKg: z.number({ message: "Cement quantity must be a number" })
    .min(100, "Cement content must be at least 100 kg/m³")
    .max(800, "Cement content exceeds maximum realistic limit of 800 kg/m³"),
  waterKg: z.number({ message: "Water quantity must be a number" })
    .min(50, "Water content must be at least 50 kg/m³")
    .max(300, "Water content exceeds maximum realistic limit of 300 kg/m³"),
  fineAggregateKg: z.number({ message: "Fine aggregate must be a number" })
    .min(300, "Fine aggregate must be at least 300 kg/m³")
    .max(1200, "Fine aggregate exceeds 1200 kg/m³"),
  coarseAggregateKg: z.number({ message: "Coarse aggregate must be a number" })
    .min(500, "Coarse aggregate must be at least 500 kg/m³")
    .max(1600, "Coarse aggregate exceeds 1600 kg/m³"),
  admixtureKg: z.number().min(0, "Admixture quantity cannot be negative").default(0),
  flyAshKg: z.number().min(0, "Fly Ash quantity cannot be negative").optional().default(0),
  ggbsKg: z.number().min(0, "GGBS quantity cannot be negative").optional().default(0),
  silicaFumeKg: z.number().min(0, "Silica Fume quantity cannot be negative").optional().default(0),
  targetStrengthMpa: z.number({ message: "Target strength must be a number" })
    .min(5, "Target strength must be at least 5 MPa")
    .max(120, "Target strength cannot exceed 120 MPa"),
  ageDays: z.number().min(1, "Concrete age must be at least 1 day").max(365, "Age cannot exceed 365 days").optional().default(28),
  slumpMm: z.number().min(0, "Slump cannot be negative").max(300, "Slump cannot exceed 300 mm").optional(),
  ambientTempCelsius: z.number().min(-10, "Ambient temperature is too low").max(60, "Ambient temperature is too high").optional(),
  curingCondition: z.string().optional().default("STANDARD_WATER_CURING"),
  previousTestStrength: z.number().min(0, "Previous test strength cannot be negative").optional(),
  projectId: z.string().uuid("Invalid project ID format").optional().or(z.literal(""))
}).superRefine((data, ctx) => {
  const totalBinder = data.cementKg + (data.flyAshKg || 0) + (data.ggbsKg || 0) + (data.silicaFumeKg || 0);
  const wcRatio = data.waterKg / totalBinder;

  if (wcRatio < 0.20 || wcRatio > 0.75) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Calculated water-cement ratio (${wcRatio.toFixed(2)}) is outside physically realistic concrete limits (0.20 - 0.75).`,
      path: ["waterKg"]
    });
  }
});

export type ConcreteMixInputZodType = z.infer<typeof ConcreteMixInputSchema>;
