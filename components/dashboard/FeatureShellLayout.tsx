import { getSession } from "@/lib/auth/session";
import DashboardClientShell from "@/components/dashboard/DashboardClientShell";
import { prisma } from "@/lib/prisma";

export default async function FeatureShellLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  const role = session?.role || "Customer";
  let user: { fullName: string } | null = null;

  if (session?.userId) {
    try {
      user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { fullName: true }
      });
    } catch (e) {
      user = { fullName: `${role} User` };
    }
  }

  if (!user) {
    user = { fullName: `${role} Account` };
  }

  return (
    <DashboardClientShell role={role} user={user}>
      {children}
    </DashboardClientShell>
  );
}
