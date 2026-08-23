import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const plantsData = [
  {
    code: "PLANT-01",
    name: "Veera RMC Central Plant 01 (Industrial Zone)",
    address: "Plot 45, MIDC Industrial Area, Chakan",
    city: "Pune",
    pincode: "410501",
    latitude: 18.7606,
    longitude: 73.8617,
    dailyCapacityM3: 1800,
    status: "ACTIVE",
    contactPhone: "+91 1800-200-8337"
  },
  {
    code: "PLANT-02",
    name: "Veera RMC North Plant 02 (Expressway Hub)",
    address: "Survey No 112, Pune-Mumbai Expressway Bypass, Tathawade",
    city: "Pune",
    pincode: "411033",
    latitude: 18.6186,
    longitude: 73.7508,
    dailyCapacityM3: 1500,
    status: "ACTIVE",
    contactPhone: "+91 1800-200-8338"
  },
  {
    code: "PLANT-03",
    name: "Veera RMC South Plant 03 (Hadapsar Logistics Yard)",
    address: "Plot 88, Solapur Highway Industry Zone, Hadapsar",
    city: "Pune",
    pincode: "411028",
    latitude: 18.5089,
    longitude: 73.9259,
    dailyCapacityM3: 1200,
    status: "ACTIVE",
    contactPhone: "+91 1800-200-8339"
  }
];

async function seedPlants() {
  console.log("=== Seeding Veera RMC Batching Plants ===");
  try {
    for (const p of plantsData) {
      await prisma.batchingPlant.upsert({
        where: { code: p.code },
        update: p,
        create: p
      });
      console.log(`✅ Batching Plant ${p.code}Synced: ${p.name}`);
    }
    console.log("🎉 Batching Plants successfully seeded into PostgreSQL!");
  } catch (err) {
    console.error("❌ Failed to seed batching plants:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seedPlants();
