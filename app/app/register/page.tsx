"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    patientId: "",
    name: "",
    address: "",
    aadhar: "",
    phone: "",
    bloodGroup: "",
    allergies: "",
    emergencyContact: "",
    fingerprintUrl: "",
    referredBy: "",
    roomType: "",
    roomNo: "",
    wardNo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, fingerprintUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.patientId || !form.name || !form.address || !form.aadhar || !form.phone) {
      alert("Please fill all required fields");
      return;
    }

    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    alert("Patient registered successfully!");
    router.push("/");
  };

  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        padding: 40,
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 600,
          padding: 30,
          borderRadius: 12,
          backgroundColor: "#fff",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 25, color: "#333" }}>Patient Registration</h1>

        {/* Personal Info */}
        <h3 style={{ marginBottom: 10, color: "#555" }}>Personal Information</h3>
        <input
          name="patientId"
          placeholder="Patient ID"
          value={form.patientId}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <input
          name="aadhar"
          placeholder="Aadhaar No"
          value={form.aadhar}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <input
          name="phone"
          placeholder="Phone No"
          value={form.phone}
          onChange={handleChange}
          style={inputStyle}
          required
        />

        {/* Medical Info */}
        <h3 style={{ margin: "20px 0 10px", color: "#555" }}>Medical Information</h3>
        <input
          name="bloodGroup"
          placeholder="Blood Group"
          value={form.bloodGroup}
          onChange={handleChange}
          style={inputStyle}
        />
        <input
          name="allergies"
          placeholder="Allergies"
          value={form.allergies}
          onChange={handleChange}
          style={inputStyle}
        />
        <input
          name="emergencyContact"
          placeholder="Emergency Contact"
          value={form.emergencyContact}
          onChange={handleChange}
          style={inputStyle}
        />

        {/* Hospital Info */}
        <h3 style={{ margin: "20px 0 10px", color: "#555" }}>Hospital Information</h3>
        <input
          name="referredBy"
          placeholder="Referred By (Doctor)"
          value={form.referredBy}
          onChange={handleChange}
          style={inputStyle}
        />
        <select name="roomType" value={form.roomType} onChange={handleChange} style={inputStyle}>
          <option value="">Select Room Type</option>
          <option value="Super Deluxe">Super Deluxe</option>
          <option value="Deluxe">Deluxe</option>
          <option value="Normal">Normal</option>
          <option value="Ward">Ward</option>
        </select>
        <input
          name="roomNo"
          placeholder="Room Number"
          value={form.roomNo}
          onChange={handleChange}
          style={inputStyle}
        />
        <input
          name="wardNo"
          placeholder="Ward Number"
          value={form.wardNo}
          onChange={handleChange}
          style={inputStyle}
        />

        {/* Fingerprint Upload */}
        <h3 style={{ margin: "20px 0 10px", color: "#555" }}>Fingerprint</h3>
        <input type="file" accept="image/*" onChange={handleFileChange} style={fileInputStyle} />

        <button type="submit" style={buttonStyle}>
          Register Patient
        </button>
        <button type="button" style={{ ...buttonStyle, backgroundColor: "#ccc", marginLeft: 10 }} onClick={() => router.push("/")}>
          Back to Login
        </button>
      </form>
    </main>
  );
}

// Reusable styles
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 10,
  marginBottom: 12,
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: 14,
};

const buttonStyle: React.CSSProperties = {
  padding: "12px 20px",
  borderRadius: 6,
  border: "none",
  backgroundColor: "#0070f3",
  color: "#fff",
  fontSize: 16,
  cursor: "pointer",
  marginTop:20,
};

const fileInputStyle: React.CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 8,
  border: "2px dashed #ccc",
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.2s",
  color: "#555",
  fontWeight: 500,
};
