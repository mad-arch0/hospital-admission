"use client";

import { useEffect, useState } from "react";
import { useSearchParams , useRouter } from "next/navigation";

type Patient = {
  patientId: string;
  name: string;
  address: string;
  aadhar: string;
  phone: string;
  bloodGroup?: string;
  allergies?: string;
  emergencyContact?: string;
  fingerprintUrl?: string;
  status: string;
  referredBy?: string;
  roomType?: string;
  roomNo?: string;
  wardNo?: string;
  updatedAt: string;
  dischargeSummary?: string;
};

type Bill = {
  _id: string;
  amount: number;
  paid: boolean;
  createdAt: string;
  billFileUrl?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");

  const [patient, setPatient] = useState<Patient | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Hospital info modal
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [hospitalInfo, setHospitalInfo] = useState({
    referredBy: "",
    roomType: "",
    roomNo: "",
    wardNo: "",
  });

  // Discharge summary modal
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [dischargeText, setDischargeText] = useState("");

  useEffect(() => {
    if (!patientId) return;

    // fetch patient
    fetch(`/api/patients/${patientId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setPatient(data);
        else setError(data.error);
      })
      .catch(() => setError("Failed to load patient"));

    // fetch bills
    fetch(`/api/bills/${patientId}`)
      .then((res) => res.json())
      .then(setBills)
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (error) return <p style={{ padding: 20, color: "red" }}>{error}</p>;
  if (!patient) return null;

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const totalUnpaid = bills.filter((b) => !b.paid).reduce((acc, b) => acc + b.amount, 0);

  // Admit patient
  const handleAdmit = () => setShowAdmitModal(true);
  const submitHospitalInfo = async () => {
    if (!hospitalInfo.roomType || !hospitalInfo.roomNo || !hospitalInfo.wardNo) {
      return alert("Please fill all hospital info fields");
    }
    const res = await fetch(`/api/patients/${patient.patientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "admitted", ...hospitalInfo }),
    });
    const data = await res.json();
    if (!data.error) {
      setPatient(data);
      setShowAdmitModal(false);
      setHospitalInfo({ referredBy: "", roomType: "", roomNo: "", wardNo: "" });
    }
  };

  // Discharge patient
  const submitDischarge = async () => {
    if (!patient) return;

    try {
      // 1. Delete all bills for this patient
      await fetch(`/api/bills/${patient.patientId}`, {
        method: "DELETE",
      });

      // 2. Update patient status to discharged and save doctor's summary
      const res = await fetch(`/api/patients/${patient.patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "discharged",
          roomType: "",
          roomNo: "",
          wardNo: "",
          referredBy: "",
          dischargeSummary: dischargeText,
        }),
      });
      const data = await res.json();
      if (!data.error) {
        setPatient(data);

        // 3. Keep only unpaid bills in the state for discharge summary
        const unpaid = bills.filter((b) => !b.paid);
        setBills(unpaid);

        setShowDischargeModal(false);
        setDischargeText("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main style={{ padding: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
      {/* Patient Info Card */}
      <div style={cardStyle}>
        <h2>Patient Info</h2>
        <div><strong>Patient ID:</strong> {patient.patientId}</div>
        <div><strong>Name:</strong> {patient.name}</div>
        <div><strong>Address:</strong> {patient.address}</div>
        <div><strong>Aadhaar No:</strong> {patient.aadhar}</div>
        <div><strong>Phone No:</strong> {patient.phone}</div>
        <div><strong>Blood Group:</strong> {patient.bloodGroup || "-"}</div>
        <div><strong>Allergies:</strong> {patient.allergies || "-"}</div>
        <div><strong>Emergency Contact:</strong> {patient.emergencyContact || "-"}</div>
        {patient.fingerprintUrl && (
          <div style={{ marginTop: 15 }}>
            <strong>Fingerprint:</strong><br />
            <img src={patient.fingerprintUrl} alt="Fingerprint" style={{ width: 250, border: "1px solid #ccc", borderRadius: 8 }} />
          </div>
        )}
      </div>

      {/* Hospital Info Card */}
      <div style={cardStyle}>
        <div style={{ textAlign: "right", color: "#555", marginBottom: 10, fontSize: 12 }}>
          Last Updated: {formatDateTime(patient.updatedAt)}
        </div>
        <h2>Hospital Info</h2>
        <div style={{ marginBottom: 10 }}>
          <strong>Status:</strong>{" "}
          <span style={{ color: patient.status === "admitted" ? "green" : "red", fontWeight: "bold" }}>
            {patient.status.toUpperCase()}
          </span>
        </div>

        {patient.status === "admitted" ? (
          <>
            <div><strong>Referred By:</strong> {patient.referredBy || "-"}</div>
            <div><strong>Room Type:</strong> {patient.roomType || "-"}</div>
            <div><strong>Room No:</strong> {patient.roomNo || "-"}</div>
            <div><strong>Ward No:</strong> {patient.wardNo || "-"}</div>
            <button style={buttonStyleRed} onClick={submitDischarge}>Discharge</button>
          </>
        ) : (
          <button style={buttonStyleBlue} onClick={handleAdmit}>Admit Patient</button>
        )}
        <div>
          <button
            style={{ ...buttonStyleBlue, marginTop: 10 }}
            onClick={() => router.push(`/bills?patientId=${patient.patientId}`)}
          >
            View Bills
          </button>
        </div>
      </div>

      {/* Discharge Summary Card */}
      {patient.status === "discharged" && (
        <div style={cardStyleRight}>
          <h2>Discharge Summary</h2>
          <div><strong>Date & Time:</strong> {formatDateTime(new Date().toISOString())}</div>
          <div><strong>Total Unpaid Bills:</strong> ${totalUnpaid}</div>

          <div style={{ marginTop: 10 }}>
            <strong>Bills:</strong>
            <ul>
              {bills.map((b) => (
                <li key={b._id}>
                  {formatDateTime(b.createdAt)} - ${b.amount} - {b.billFileUrl ? <a href={b.billFileUrl} target="_blank" rel="noreferrer">Download</a> : "No file"}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Admit Modal */}
      {showAdmitModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Enter Hospital Info</h3>
            <input placeholder="Referred By" value={hospitalInfo.referredBy} onChange={(e) => setHospitalInfo({ ...hospitalInfo, referredBy: e.target.value })} style={inputStyle} />
            <select value={hospitalInfo.roomType} onChange={(e) => setHospitalInfo({ ...hospitalInfo, roomType: e.target.value })} style={inputStyle}>
              <option value="">Select Room Type</option>
              <option value="Super Deluxe">Super Deluxe</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Normal">Normal</option>
              <option value="Ward">Ward</option>
            </select>
            <input placeholder="Room No" value={hospitalInfo.roomNo} onChange={(e) => setHospitalInfo({ ...hospitalInfo, roomNo: e.target.value })} style={inputStyle} />
            <input placeholder="Ward No" value={hospitalInfo.wardNo} onChange={(e) => setHospitalInfo({ ...hospitalInfo, wardNo: e.target.value })} style={inputStyle} />
            <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
              <button style={buttonStyleBlue} onClick={submitHospitalInfo}>Admit</button>
              <button style={{ ...buttonStyle, backgroundColor: "#ccc", color: "#333" }} onClick={() => setShowAdmitModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Discharge Modal */}
      {showDischargeModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Write Discharge Summary</h3>
            <textarea value={dischargeText} onChange={(e) => setDischargeText(e.target.value)} style={{ width: "100%", height: 120, marginTop: 10, padding: 8 }} />
            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
              <button style={buttonStyleRed} onClick={submitDischarge}>Confirm Discharge</button>
              <button style={{ ...buttonStyle, backgroundColor: "#ccc", color: "#333" }} onClick={() => setShowDischargeModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

// Styles
const cardStyle: React.CSSProperties = {
  width: 550,
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 25,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  backgroundColor: "#f9f9f9",
  fontFamily: "Arial, sans-serif",
};

const cardStyleRight: React.CSSProperties = {
  flex: 1,
  minWidth: 350,
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 25,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  backgroundColor: "#fff8e1",
  fontFamily: "Arial, sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 8,
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const buttonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "none",
  color: "#fff",
  cursor: "pointer",
};

const buttonStyleRed: React.CSSProperties = { ...buttonStyle, backgroundColor: "#e53935" };
const buttonStyleBlue: React.CSSProperties = { ...buttonStyle, backgroundColor: "#0070f3" };

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContent: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: 25,
  borderRadius: 12,
  width: 400,
};
