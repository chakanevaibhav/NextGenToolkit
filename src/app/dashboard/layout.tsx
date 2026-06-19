import Link from "next/link";
import { LayoutDashboard, FileUp, Settings } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import styles from "./dashboard.module.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  let plan = "Free Plan";
  let actionsUsed = 0;
  let maxActions = 3;
  let percent = 0;

  if (session && session.user) {
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
    });
    if (user) {
      plan = user.subscriptionPlan === "premium" ? "Premium Plan" : "Free Plan";
      actionsUsed = user.actionsUsed;
      maxActions = user.subscriptionPlan === "premium" ? Infinity : 3;
      percent = maxActions === Infinity ? 100 : (actionsUsed / maxActions) * 100;
    }
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <Link href="/">PDFSuite</Link>
        </div>
        <nav className={styles.sidebarNav}>
          <Link href="/dashboard" className={styles.navItem}>
            <LayoutDashboard size={20} /> Overview
          </Link>
          <Link href="/dashboard/compress" className={styles.navItem}>
            <FileUp size={20} /> Tools
          </Link>
          <Link href="/dashboard/settings" className={styles.navItem}>
            <Settings size={20} /> Settings
          </Link>
        </nav>
        
        <div className={styles.quotaBox}>
          <p className={styles.quotaTitle}>{plan}</p>
          <p className={styles.quotaText}>
            {maxActions === Infinity ? "Unlimited actions" : `${actionsUsed} / ${maxActions} actions today`}
          </p>
          {maxActions !== Infinity && (
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${percent}%` }}></div>
            </div>
          )}
          {plan !== "Premium Plan" && (
            <Link href="/pricing" className={styles.upgradeLink}>Upgrade to Premium</Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
