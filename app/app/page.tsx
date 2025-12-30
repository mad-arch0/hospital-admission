"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [patientId, setPatientId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return alert("Please enter Patient ID");

    router.push(`/dashboard?patientId=${patientId}`);
  };

  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          ...cardStyle,
          width: 400,
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: 24, color: "#333" }}>Patient Login</h1>

        <input
          type="text"
          placeholder="Enter Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          style={{ ...inputStyle, marginBottom: 20 }}
        />

        <button
          type="submit"
          style={{ ...buttonStyleBlue, width: "100%", marginBottom: 12 }}
        >
          Login
        </button>

        <button
          type="button"
          style={{ ...buttonStyleRed, width: "100%" }}
          onClick={() => router.push("/register")}
        >
          Register
        </button>
      </form>
    </main>
  );
}

/* ================= STYLES ================= */

const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  padding: 30,
  boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
  backgroundColor: "#ffffff",
  transition: "all 0.2s",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #ccc",
  fontSize: 14,
  height: 44,
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  height: 44,
};

const buttonStyleBlue: React.CSSProperties = {
  ...buttonStyle,
  background: "linear-gradient(90deg, #2196f3, #1976d2)",
  boxShadow: "0 4px 12px rgba(33,150,243,0.3)",
};

const buttonStyleRed: React.CSSProperties = {
  ...buttonStyle,
  background: "linear-gradient(90deg, #9e9e9e, #757575)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
};
