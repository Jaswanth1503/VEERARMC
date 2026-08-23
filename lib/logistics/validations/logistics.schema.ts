import { z } from "zod";

export const CreateTripSchema = z.object({
  orderId: z.string().uuid("Valid Order ID is required"),
  vehicleId: z.string().uuid("Valid Vehicle ID is required"),
  driverId: z.string().uuid("Valid Driver ID is required"),
  productionPlanId: z.string().uuid().optional(),
  productionBatchId: z.string().uuid().optional(),
  concreteGrade: z.string().optional().default("M25"),
  quantityM3: z.number().min(0.5).default(6.0),
  originPlant: z.string().default("Central Batching Plant (Hadapsar)"),
  destinationAddress: z.string().min(3, "Destination address is required"),
  destinationCity: z.string().default("Pune"),
  destinationPincode: z.string().optional(),
  distanceKm: z.number().min(0.5).default(14.5),
  estimatedArrival: z.string().or(z.date()).optional(),
});

export const UpdateTripStatusSchema = z.object({
  status: z.enum([
    "ASSIGNED",
    "DISPATCHED",
    "IN_TRANSIT",
    "ARRIVED_AT_SITE",
    "UNLOADING",
    "DELIVERED",
    "CONFIRMED",
    "CANCELLED"
  ]),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  locationName: z.string().optional(),
  customerFeedback: z.string().optional(),
  customerRating: z.number().min(1).max(5).optional(),
});

export const VehicleSchema = z.object({
  vehicleNumber: z.string().min(4, "Vehicle plate number required (e.g. MH-12-RN-8821)"),
  vehicleType: z.enum(["TRANSIT_MIXER", "BOOM_PUMP", "LINE_PUMP", "CEMENT_BULKER"]).default("TRANSIT_MIXER"),
  capacity: z.number().min(1).default(6.0),
  status: z.enum(["AVAILABLE", "ASSIGNED", "IN_TRANSIT", "LOADING", "UNLOADING", "MAINTENANCE", "OUT_OF_SERVICE"]).default("AVAILABLE"),
  currentLocation: z.string().optional().default("Central Plant (Hadapsar)"),
  fuelLevelPercent: z.number().min(0).max(100).default(85.0),
  odometerKm: z.number().min(0).default(45200.0),
});

export const DriverSchema = z.object({
  employeeId: z.string().min(2, "Employee ID required"),
  name: z.string().min(2, "Driver full name required"),
  phone: z.string().min(10, "Valid phone number required"),
  licenseNumber: z.string().min(5, "Driving license number required"),
  status: z.enum(["AVAILABLE", "ON_TRIP", "OFF_DUTY", "ON_LEAVE"]).default("AVAILABLE"),
  assignedVehicleId: z.string().uuid().optional(),
  experienceYears: z.number().min(0).default(5),
});

export const LogIssueSchema = z.object({
  tripId: z.string().uuid("Valid Trip ID is required"),
  issueType: z.enum([
    "TRAFFIC_DELAY",
    "VEHICLE_BREAKDOWN",
    "WEATHER_ISSUE",
    "CUSTOMER_DELAY",
    "SITE_ACCESS_PROBLEM",
    "SLUMP_LOSS"
  ]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  description: z.string().min(3, "Issue description is required"),
  delayMinutes: z.number().min(0).default(15),
});
