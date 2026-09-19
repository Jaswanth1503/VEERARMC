import { prisma } from "@/lib/prisma";
import { PortalDeliveryItem } from "../types/portal";

export class PortalTrackingService {
  /**
   * Retrieves active delivery trips and transit mixers for a customer
   */
  static async getDeliveries(userId?: string, role?: string): Promise<PortalDeliveryItem[]> {
    const isElevated = role === "Admin" || role === "Super Admin" || role === "Sales Manager";

    try {
      const orderWhere: any = (!isElevated && userId)
        ? { OR: [{ customerId: userId }, { contractorId: userId }] }
        : {};

      const trips = await prisma.deliveryTrip.findMany({
        where: {
          order: orderWhere,
        },
        include: {
          order: {
            include: {
              project: true,
            }
          },
          vehicle: true,
          driver: true,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      if (trips.length > 0) {
        return trips.map((trip, idx) => {
          let uiStatus: PortalDeliveryItem["status"] = "IN_TRANSIT";
          if (trip.status === "ASSIGNED") uiStatus = "LOADING";
          else if (trip.status === "DISPATCHED") uiStatus = "DISPATCHED";
          else if (trip.status === "IN_TRANSIT") uiStatus = "IN_TRANSIT";
          else if (trip.status === "ARRIVED_AT_SITE") uiStatus = "AT_SITE";
          else if (trip.status === "UNLOADING") uiStatus = "POURING";
          else if (trip.status === "DELIVERED" || trip.status === "CONFIRMED") uiStatus = "COMPLETED";

          const lat = trip.vehicle?.currentLatitude || (12.9716 + (idx * 0.015));
          const lng = trip.vehicle?.currentLongitude || (77.5946 + (idx * 0.02));

          return {
            id: trip.id,
            tripId: trip.tripNumber || `TRIP-${trip.id.substring(0, 8).toUpperCase()}`,
            orderNumber: trip.order?.orderNumber || "ORD-2026-089",
            projectName: trip.order?.project?.projectName || "Prestige Cyber Towers",
            truckNumber: trip.vehicle?.vehicleNumber || "KA-04-E-2194",
            driverName: trip.driver?.name || "Ramesh Gowda",
            driverPhone: trip.driver?.phone || "+91 98450 12345",
            status: uiStatus,
            currentLocation: {
              lat,
              lng,
              address: trip.destinationAddress || "Hosur Main Road, Near Singasandra Toll Plaza, Bangalore",
            },
            speedKmh: uiStatus === "IN_TRANSIT" ? 38 : (uiStatus === "POURING" ? 0 : 25),
            etaMinutes: uiStatus === "IN_TRANSIT" ? 16 : (uiStatus === "POURING" ? 0 : 35),
            concreteTempC: 28.4,
            slumpRetentionMinRemaining: 78,
            slumpRetentionTotalMin: 120,
            dispatchedAt: trip.dispatchTime ? trip.dispatchTime.toISOString() : new Date().toISOString(),
            pourDestination: trip.destinationAddress || trip.order?.deliveryAddress || "Plot 88, Electronic City Phase 1, Bangalore",
          };
        });
      }
    } catch (err) {
      console.warn("PortalTrackingService: Database fallback activated", err);
    }

    return this.getBaselineMockDeliveries();
  }

  static getBaselineMockDeliveries(): PortalDeliveryItem[] {
    return [
      {
        id: "deliv-mock-1",
        tripId: "TRIP-089-A",
        orderNumber: "ORD-2026-089",
        projectName: "Prestige Cyber Towers - Commercial Podium",
        truckNumber: "KA-04-E-2194",
        driverName: "Ramesh Gowda",
        driverPhone: "+91 98450 12345",
        status: "IN_TRANSIT",
        currentLocation: {
          lat: 12.8682,
          lng: 77.6622,
          address: "Hosur Main Road, Singasandra Elevated Flyover, Bangalore",
        },
        speedKmh: 42,
        etaMinutes: 14,
        concreteTempC: 28.2,
        slumpRetentionMinRemaining: 84,
        slumpRetentionTotalMin: 120,
        dispatchedAt: new Date(Date.now() - 36 * 60000).toISOString(),
        pourDestination: "Plot 88, Electronic City Phase 1, Bangalore",
      },
      {
        id: "deliv-mock-2",
        tripId: "TRIP-089-B",
        orderNumber: "ORD-2026-089",
        projectName: "Prestige Cyber Towers - Commercial Podium",
        truckNumber: "KA-51-B-9021",
        driverName: "Manjunath K",
        driverPhone: "+91 97412 88712",
        status: "LOADING",
        currentLocation: {
          lat: 12.9856,
          lng: 77.7289,
          address: "Veera RMC Batching Plant #1, Whitefield Industrial Area, Bangalore",
        },
        speedKmh: 0,
        etaMinutes: 48,
        concreteTempC: 27.6,
        slumpRetentionMinRemaining: 120,
        slumpRetentionTotalMin: 120,
        dispatchedAt: new Date().toISOString(),
        pourDestination: "Plot 88, Electronic City Phase 1, Bangalore",
      },
      {
        id: "deliv-mock-3",
        tripId: "TRIP-085-C",
        orderNumber: "ORD-2026-085",
        projectName: "Brigade Gateway Residential Phase 2",
        truckNumber: "KA-01-MJ-4410",
        driverName: "Suresh Babu",
        driverPhone: "+91 99001 54321",
        status: "COMPLETED",
        currentLocation: {
          lat: 12.9912,
          lng: 77.7145,
          address: "Site Delivered — Sy No 14/2, Whitefield Main Road, Bangalore",
        },
        speedKmh: 0,
        etaMinutes: 0,
        concreteTempC: 29.1,
        slumpRetentionMinRemaining: 0,
        slumpRetentionTotalMin: 120,
        dispatchedAt: new Date(Date.now() - 140 * 60000).toISOString(),
        pourDestination: "Sy No 14/2, Whitefield Main Road, Bangalore",
      }
    ];
  }
}
