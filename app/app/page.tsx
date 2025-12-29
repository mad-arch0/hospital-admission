"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [patientId, setPatientId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return alert("Please enter Patient ID");

    // Navigate to dashboard with query param
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
        fontFamily: "Arial, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 400,
          padding: 30,
          borderRadius: 12,
          backgroundColor: "#fff",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: 20, color: "#333" }}>Patient Login</h1>

        <input
          type="text"
          placeholder="Enter Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 6,
            border: "1px solid #ccc",
            marginBottom: 20,
            fontSize: 14,
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 6,
            border: "none",
            backgroundColor: "#0070f3",
            color: "#fff",
            fontSize: 16,
            cursor: "pointer",
            marginBottom: 10,
          }}
        >
          Login
        </button>

        <button
          type="button"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 6,
            border: "none",
            backgroundColor: "#ccc",
            color: "#333",
            fontSize: 16,
            cursor: "pointer",
          }}
          onClick={() => router.push("/register")}
        >
          Register
        </button>
      </form>
    </main>
  );
}
