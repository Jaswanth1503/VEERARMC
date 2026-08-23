import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const concreteGradesData = [
  {
    gradeCode: "M10",
    name: "Grade M10 Standard PCC",
    description: "Non-structural plain cement concrete for leveling, under-footings, and pathways.",
    nominalMix: "1:3:6",
    compressiveStrength: 10,
    standardSlumpMin: 50,
    standardSlumpMax: 75,
    applications: ["Plain Cement Concrete", "Pathway Bedding", "Levelling Course", "Under-Footings"],
    basePricePerM3: 3800
  },
  {
    gradeCode: "M15",
    name: "Grade M15 Medium PCC",
    description: "Medium strength concrete for sub-base floors, driveways, and boundary wall footings.",
    nominalMix: "1:2:4",
    compressiveStrength: 15,
    standardSlumpMin: 75,
    standardSlumpMax: 100,
    applications: ["Driveways", "Sub-base Flooring", "Boundary Walls", "Pavement Foundations"],
    basePricePerM3: 4100
  },
  {
    gradeCode: "M20",
    name: "Grade M20 Standard RCC",
    description: "Standard reinforced concrete for single-story residential columns, beams, and slabs.",
    nominalMix: "1:1.5:3",
    compressiveStrength: 20,
    standardSlumpMin: 100,
    standardSlumpMax: 125,
    applications: ["Residential Columns", "Single-story Beams", "Suspended Slabs", "Staircases"],
    basePricePerM3: 4400
  },
  {
    gradeCode: "M25",
    name: "Grade M25 Premium Structural RCC",
    description: "Multi-story residential & commercial foundations, columns, beams, and heavy slabs.",
    nominalMix: "1:1:2 (Design Mix)",
    compressiveStrength: 25,
    standardSlumpMin: 100,
    standardSlumpMax: 150,
    applications: ["Multi-story RCC Foundations", "Columns & Beams", "Basement Walls", "Retaining Walls"],
    basePricePerM3: 4800
  },
  {
    gradeCode: "M30",
    name: "Grade M30 High Performance Concrete",
    description: "Heavy structural members, commercial buildings, water tanks, and pumpable mixes.",
    nominalMix: "Design Mix",
    compressiveStrength: 30,
    standardSlumpMin: 125,
    standardSlumpMax: 150,
    applications: ["Commercial Structures", "Water Tanks", "Bridge Piers", "Heavy Traffic Roads"],
    basePricePerM3: 5200
  },
  {
    gradeCode: "M35",
    name: "Grade M35 Heavy Industrial Concrete",
    description: "High-strength concrete for pre-stressed members, industrial flooring, and flyovers.",
    nominalMix: "Design Mix",
    compressiveStrength: 35,
    standardSlumpMin: 125,
    standardSlumpMax: 160,
    applications: ["Pre-stressed Girders", "Heavy Industrial Floors", "Flyovers", "High-load Pavements"],
    basePricePerM3: 5700
  },
  {
    gradeCode: "M40",
    name: "Grade M40 High Strength Structural",
    description: "High-rise building columns, pre-cast concrete structures, and infrastructure projects.",
    nominalMix: "High Strength Design Mix",
    compressiveStrength: 40,
    standardSlumpMin: 125,
    standardSlumpMax: 160,
    applications: ["High-rise Columns", "Pre-cast Members", "Bridge Superstructures", "Port Infrastructure"],
    basePricePerM3: 6300
  },
  {
    gradeCode: "M50",
    name: "Grade M50 Ultra High Performance (UHPC)",
    description: "Ultra-high performance concrete for marine structures, heavy bridges, and specialized engineering.",
    nominalMix: "UHPC Specialty Design Mix",
    compressiveStrength: 50,
    standardSlumpMin: 150,
    standardSlumpMax: 180,
    applications: ["Marine Structures", "Heavy Girders", "Specialized Industrial Infrastructure", "Nuclear Plants"],
    basePricePerM3: 7200
  }
];

async function seedQuoteProducts() {
  console.log("=== Seeding Veera RMC Quote Products, Pricing & Tax Rates ===");

  try {
    // 1. Seed Concrete Grades
    for (const g of concreteGradesData) {
      const grade = await prisma.concreteGrade.upsert({
        where: { gradeCode: g.gradeCode },
        update: {
          name: g.name,
          description: g.description,
          nominalMix: g.nominalMix,
          compressiveStrength: g.compressiveStrength,
          standardSlumpMin: g.standardSlumpMin,
          standardSlumpMax: g.standardSlumpMax,
          applications: g.applications,
          basePricePerM3: g.basePricePerM3,
          isAvailable: true
        },
        create: {
          gradeCode: g.gradeCode,
          name: g.name,
          description: g.description,
          nominalMix: g.nominalMix,
          compressiveStrength: g.compressiveStrength,
          standardSlumpMin: g.standardSlumpMin,
          standardSlumpMax: g.standardSlumpMax,
          applications: g.applications,
          basePricePerM3: g.basePricePerM3,
          isAvailable: true
        }
      });
      console.log(`✅ Concrete Grade ${g.gradeCode} synced (Base Price: ₹${g.basePricePerM3}/m³)`);
    }

    // 2. Seed Default Tax Rate (18% GST)
    const existingTax = await prisma.taxRate.findFirst({ where: { name: "GST" } });
    if (!existingTax) {
      await prisma.taxRate.create({
        data: {
          name: "GST",
          ratePercent: 18.0,
          isDefault: true
        }
      });
      console.log("✅ Default 18% GST Tax Rate created.");
    }

    // 3. Seed Transport Rates
    const existingTransport = await prisma.transportRate.findFirst({});
    if (!existingTransport) {
      await prisma.transportRate.createMany({
        data: [
          { minDistanceKm: 0, maxDistanceKm: 15, flatRate: 500, ratePerKmM3: 10, minCharge: 800 },
          { minDistanceKm: 15.1, maxDistanceKm: 30, flatRate: 800, ratePerKmM3: 15, minCharge: 1200 },
          { minDistanceKm: 30.1, maxDistanceKm: 60, flatRate: 1500, ratePerKmM3: 20, minCharge: 2000 }
        ]
      });
      console.log("✅ Transport Rates seeded.");
    }

    // 4. Seed Pump Rates
    const pumpTypes = [
      { pumpType: "LINE_PUMP", baseRate: 3500, ratePerM3: 150, minQuantity: 20 },
      { pumpType: "BOOM_PUMP_24M", baseRate: 6000, ratePerM3: 200, minQuantity: 30 },
      { pumpType: "BOOM_PUMP_42M", baseRate: 9500, ratePerM3: 250, minQuantity: 50 }
    ];

    for (const p of pumpTypes) {
      await prisma.pumpRate.upsert({
        where: { pumpType: p.pumpType },
        update: p,
        create: p
      });
    }
    console.log("✅ Pump Rates seeded.");

    console.log("🎉 All quote products & pricing data successfully seeded into PostgreSQL!");

  } catch (err) {
    console.error("❌ Failed to seed quote products:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seedQuoteProducts();
