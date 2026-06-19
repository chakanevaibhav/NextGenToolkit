"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import Script from "next/script";
import styles from "./pricing.module.css";

export default function Pricing() {
  const handleUpgrade = async () => {
    try {
      const res = await fetch("/api/razorpay/create-order", { method: "POST" });
      const order = await res.json();

      if (order.error) {
        alert("Failed to create order: " + order.error);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "dummy",
        amount: order.amount,
        currency: order.currency,
        name: "PDFSuite",
        description: "Premium Plan Upgrade",
        order_id: order.id,
        handler: function (response: any) {
          alert("Payment successful! You are now a Premium member.");
          // Ideally redirect to dashboard here
          window.location.href = "/dashboard";
        },
        theme: {
          color: "#6366f1",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="container">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
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
            <button className="btn-primary" onClick={handleUpgrade}>Upgrade Now</button>
          </div>
        </div>
      </main>
    </div>
  );
}
