import { getSession } from "@/lib/auth/session";
import DashboardClientShell from "@/components/dashboard/DashboardClientShell";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  // Fetch minimal user profile for the avatar (with DB offline safety)
  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { fullName: true }
    });
  } catch (e) {
    console.warn("[DashboardLayout Warning] PostgreSQL database offline, using fallback user profile.");
    user = { fullName: `${session.role} User` };
  }

  return (
    <DashboardClientShell role={session.role} user={user}>
      {children}
    </DashboardClientShell>
  );
}
