import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function DashboardOverviewPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const userRole = (session.role || "customer").toLowerCase();
  
  if (userRole === "admin") redirect("/dashboard/admin");
  if (userRole === "contractor") redirect("/dashboard/contractor");
  if (userRole === "employee") redirect("/dashboard/employee");
  if (userRole === "supplier") redirect("/dashboard/supplier");
  
  redirect("/dashboard/customer");
}
