import Link from "next/link";
import { Check } from "lucide-react";
import styles from "./pricing.module.css";

export default function Pricing() {
  return (
    <div className="container">
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <span>PDFSuite</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.heading}>
          <h1 className="text-gradient">Simple, Transparent Pricing</h1>
          <p>Start for free, upgrade when you need more power.</p>
        </div>

        <div className={styles.pricingGrid}>
          {/* Free Tier */}
          <div className={`glass-panel ${styles.pricingCard}`}>
            <h2>Free</h2>
            <div className={styles.price}>
              <span className={styles.currency}>₹</span>0<span className={styles.period}>/mo</span>
            </div>
            <p className={styles.description}>Perfect for occasional quick edits.</p>
            <ul className={styles.featuresList}>
              <li><Check size={16} className={styles.checkIcon} /> Up to 3 actions per day</li>
              <li><Check size={16} className={styles.checkIcon} /> Max 10MB per file</li>
              <li><Check size={16} className={styles.checkIcon} /> Split, Merge, Sign</li>
              <li><Check size={16} className={styles.checkIcon} /> Standard Compression</li>
            </ul>
            <Link href="/dashboard" className="btn-secondary">Get Started</Link>
          </div>

          {/* Premium Tier */}
          <div className={`glass-panel ${styles.pricingCard} ${styles.premiumCard}`}>
            <div className={styles.popularBadge}>Most Popular</div>
            <h2>Premium</h2>
            <div className={styles.price}>
              <span className={styles.currency}>₹</span>499<span className={styles.period}>/mo</span>
            </div>
            <p className={styles.description}>For professionals handling daily documents.</p>
            <ul className={styles.featuresList}>
              <li><Check size={16} className={styles.checkIcon} /> Unlimited daily actions</li>
              <li><Check size={16} className={styles.checkIcon} /> Max 100MB per file</li>
              <li><Check size={16} className={styles.checkIcon} /> Batch processing (up to 20 files)</li>
              <li><Check size={16} className={styles.checkIcon} /> Maximum Compression</li>
              <li><Check size={16} className={styles.checkIcon} /> Priority Support</li>
            </ul>
            <button className="btn-primary">Upgrade Now</button>
          </div>
        </div>
      </main>
    </div>
  );
}
