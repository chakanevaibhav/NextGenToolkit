"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const SignPDFClient = dynamic(() => import("./SignPDFClient"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <Loader2 className="spin" size={32} color="var(--accent-primary)" />
    </div>
  ),
});

export default function SignPage() {
  return <SignPDFClient />;
}
