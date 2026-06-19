import Link from "next/link";
import { LayoutDashboard, FileUp, Settings } from "lucide-react";
import styles from "./dashboard.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <Link href="/dashboard/tools" className={styles.navItem}>
            <FileUp size={20} /> Tools
          </Link>
          <Link href="/dashboard/settings" className={styles.navItem}>
            <Settings size={20} /> Settings
          </Link>
        </nav>
        
        <div className={styles.quotaBox}>
          <p className={styles.quotaTitle}>Free Plan</p>
          <p className={styles.quotaText}>0 / 3 actions today</p>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '0%' }}></div>
          </div>
          <Link href="/pricing" className={styles.upgradeLink}>Upgrade to Premium</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
