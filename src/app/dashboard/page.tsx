import Link from "next/link";
import { FileDown, Scissors, FileSignature } from "lucide-react";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <h1>Welcome back</h1>
        <p>Select a tool to start working on your PDFs.</p>
      </header>

      <div className={styles.toolsGrid}>
        {/* Compress Tool */}
        <Link href="/dashboard/compress" className={styles.toolCard}>
          <div className={styles.toolIcon}>
            <FileDown size={24} />
          </div>
          <h3>Compress PDF</h3>
          <p>Reduce file size while maintaining visual quality.</p>
        </Link>

        {/* Split/Merge Tool */}
        <Link href="/dashboard/split-merge" className={styles.toolCard}>
          <div className={styles.toolIcon}>
            <Scissors size={24} />
          </div>
          <h3>Split & Merge</h3>
          <p>Combine multiple files or extract specific pages.</p>
        </Link>

        {/* Sign Tool */}
        <Link href="/dashboard/sign" className={styles.toolCard}>
          <div className={styles.toolIcon}>
            <FileSignature size={24} />
          </div>
          <h3>Sign PDF</h3>
          <p>Add digital signatures and text to your documents.</p>
        </Link>
      </div>
    </>
  );
}
