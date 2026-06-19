import Link from "next/link";
import { FileDown, Scissors, FileSignature, Layers } from "lucide-react";
import { getServerSession } from "next-auth/next";
import styles from "./page.module.css";

export default async function Home() {
  const session = await getServerSession();

  return (
    <div className="container">
      <header className={styles.header}>
        <div className={styles.logo}>
          <Layers size={28} className={styles.logoIcon} />
          <span>PDFSuite</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/pricing" className="btn-secondary">Pricing</Link>
          {session ? (
            <Link href="/dashboard" className="btn-primary">Dashboard</Link>
          ) : (
            <Link href="/api/auth/signin" className="btn-primary">Sign In</Link>
          )}
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>
            Master Your Documents with <br />
            <span className="text-gradient">Ultimate Precision.</span>
          </h1>
          <p className={styles.subtitle}>
            Compress, split, merge, and sign PDFs securely in your browser. 
            No more bloated files or missing signatures.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/dashboard" className="btn-primary">Start for Free</Link>
          </div>
        </section>

        <section className={styles.features}>
          <div className={`glass-panel ${styles.featureCard}`}>
            <div className={styles.featureIconWrap}>
              <FileDown size={32} />
            </div>
            <h3>Smart Compression</h3>
            <p>Reduce file sizes by up to 80% without losing quality. Perfect for portal uploads.</p>
          </div>

          <div className={`glass-panel ${styles.featureCard}`}>
            <div className={styles.featureIconWrap}>
              <Scissors size={32} />
            </div>
            <h3>Split & Merge</h3>
            <p>Extract exactly what you need or combine multiple documents seamlessly.</p>
          </div>

          <div className={`glass-panel ${styles.featureCard}`}>
            <div className={styles.featureIconWrap}>
              <FileSignature size={32} />
            </div>
            <h3>Quick Signatures</h3>
            <p>Add secure, perfectly placed digital signatures in seconds.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
