"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");

  return (
    <header style={headerStyle}>
      
      {/* Logo */}
      <div
        onClick={() => router.push("/")}
        style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
      >
        <Image
          src="/logo.png"
          alt="Hospital Logo"
          width={40}  // responsive width
          height={40} // responsive height
          style={{ objectFit: "contain" }}
        />
        <span style={{ ...leftStyle, marginLeft: 8 }}>MedPlus Hospital</span>
      </div>

      <div style={rightStyle}>
        {pathname !== "/" && (
          <button
            style={buttonStyleGray}
            onClick={() => router.push("/")}
          >
            Login
          </button>
        )}

        {patientId && pathname !== "/dashboard" && (
          <button
            style={buttonStyleBlue}
            onClick={() => router.push(`/dashboard?patientId=${patientId}`)}
          >
            Back to Dashboard
          </button>
        )}
      </div>
    </header>
  );
}

/* ================= STYLES ================= */

const headerStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#ffffff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  position: "sticky",
  top: 0,
  zIndex: 100,
};

const leftStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 18,
};

const rightStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
};

const buttonBase: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
};

const buttonStyleBlue: React.CSSProperties = {
  ...buttonBase,
  background: "linear-gradient(90deg, #2196f3, #1976d2)",
  color: "#fff",
};

const buttonStyleGray: React.CSSProperties = {
  ...buttonBase,
  background: "#e0e0e0",
  color: "#333",
};
