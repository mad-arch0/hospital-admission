"use client";

import { useEffect, useState } from "react";
import { useSearchParams , useRouter } from "next/navigation";
import Loading from "../loading";

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
};

type Bill = {
  _id: string;
  amount: number;
  paid: boolean;
  createdAt: string;
  billFileUrl?: string;
};

type DoctorSummary = {
  _id: string;
  summaryImageUrl: string;
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");

  const [patient, setPatient] = useState<Patient | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [doctorHistory, setDoctorHistory] = useState<{ _id: string; summaryImageUrl: string; createdAt: string }[]>([]);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  const [isDischarged, setIsDischarged] = useState(false);

  const [doctorNoteFile, setDoctorNoteFile] = useState<File | null>(null);
  const [doctorSummaries, setDoctorSummaries] = useState<DoctorSummary[]>([]);

  const [showDoctorNoteModal, setShowDoctorNoteModal] = useState(false);

  // Hospital info modal
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [hospitalInfo, setHospitalInfo] = useState({
    referredBy: "",
    roomType: "",
    roomNo: "",
    wardNo: "",
  });

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

    // fetch doctor summaries
    fetch(`/api/ds?patientId=${patientId}`)
      .then((res) => res.json())
      .then(setDoctorSummaries);

    fetch(`/api/ds?patientId=${patientId}`)
    .then(res => res.json())
    .then(data => setDoctorHistory(data))
    .catch(err => console.error(err));
  }, [patientId]);

  if (loading) return Loading();
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

  const submitDischarge = async () => {
    if (!patient) return;

    try {
      const res = await fetch(`/api/patients/${patient.patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "discharged",
          roomType: "",
          roomNo: "",
          wardNo: "",
          referredBy: "",
        }),
      });

      const updatedPatient = await res.json();
      if (updatedPatient.error) {
        console.error(updatedPatient.error);
        return;
      }

      // Only show discharge summary locally
      setIsDischarged(true);

      // Refresh patient info
      setPatient(updatedPatient);

      // Refresh bills
      const billsRes = await fetch(`/api/bills/${patient.patientId}`);
      const billsData = await billsRes.json();
      setBills(billsData);


    } catch (err) {
      console.error(err);
    }
  };


  return (
    <main
      style={{
        padding: 20,
        display: "flex",
        gap: 20,
        flexWrap: "nowrap",
        alignItems: "stretch",
        width: "100%",
        backgroundColor: "#f0f2f5",
      }}
    >
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
            <button style={buttonStyleRed} onClick={() => setShowDoctorNoteModal(true)}>Discharge</button>
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
        <div style={{ marginTop: 15, position: "relative" }}>
          <label style={{ fontWeight: "bold" }}>History:</label>
          <div onClick={() => setShowHistoryDropdown(!showHistoryDropdown)} style={dropdownHeader}>
            {showHistoryDropdown ? "Hide History" : "Show History"}
            <span style={{ transform: showHistoryDropdown ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
          </div>

          {showHistoryDropdown && (
            <div style={dropdownContent}>
              {doctorHistory.length === 0 ? (
                <p style={{ color: "#777" }}>No doctor notes yet.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {doctorHistory.map((d) => (
                    <li key={d._id} style={{ marginBottom: 10, borderBottom: "1px solid #eee", paddingBottom: 5 }}>
                      <div><strong>Date:</strong> {new Date(d.createdAt).toLocaleString()}</div>
                      <div>
                        <a href={d.summaryImageUrl} target="_blank" rel="noreferrer" style={{ color: "#0070f3" }}>
                          View / Download
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Discharge Summary Card */}
      {isDischarged && (
        <div style={cardStyleRight}>
          <h2>Discharge Summary</h2>
          <div style={{ marginBottom: 8 }}>
            <strong>Date & Time:</strong>{" "}
            {formatDateTime(patient.updatedAt)}
          </div>

          <div style={{ marginBottom: 8 }}>
            <strong>Total Unpaid Bills:</strong> ₹{totalUnpaid}
          </div>

          <div style={{ marginTop: 12 }}>
            <strong>Bills:</strong>
            {bills.length === 0 ? (
              <p style={{ color: "#777", marginTop: 6 }}>No unpaid bills 🎉</p>
            ) : (
              <ul>
                {bills.map((b) => (
                  <li key={b._id}>
                    {formatDateTime(b.createdAt)} — ₹{b.amount}
                    {b.billFileUrl && (
                      <> — <a href={b.billFileUrl} target="_blank" rel="noreferrer">Download</a></>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Doctor Summary */}
          <div style={{ marginTop: 20 }}>
            <strong>Doctor's Summary:</strong>
            {doctorSummaries.length === 0 ? (
              <p style={{ color: "#777", marginTop: 6 }}>No doctor summary uploaded yet.</p>
            ) : (
              <>
                <div style={{ marginTop: 10 }}>
                  <img
                    src={doctorSummaries[0].summaryImageUrl}
                    alt="Doctor Summary"
                    style={{ width: "100%", maxWidth: 400, border: "1px solid #ccc", borderRadius: 8 }}
                  />
                  <div>
                    <a href={doctorSummaries[0].summaryImageUrl} download style={{ marginTop: 5, display: "inline-block" }}>Download</a>
                  </div>
                </div>

                {doctorSummaries.length > 1 && (
                  <div style={{ marginTop: 20 }}>
                    <strong>History:</strong>
                    <select
                      style={{ width: "100%", padding: 8, marginTop: 5 }}
                      onChange={(e) => {
                        const selected = doctorSummaries.find(d => d._id === e.target.value);
                        if (selected) setDoctorSummaries(prev => [selected, ...prev.filter(p => p._id !== selected._id)]);
                      }}
                    >
                      {doctorSummaries.map((d) => (
                        <option key={d._id} value={d._id}>
                          {formatDateTime(d.createdAt)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Doctor Note Modal */}
      {showDoctorNoteModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Upload Doctor's Note</h3>
            <label style={fileInputStyle}>
              {doctorNoteFile ? doctorNoteFile.name : "Click or drag file to upload"}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setDoctorNoteFile(e.target.files?.[0] || null)}
                style={{
                  ...fileInputHidden,
                  cursor: "pointer",
                }}
              />
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                style={buttonStyleRed}
                onClick={async () => {
                  if (!doctorNoteFile) return alert("Please select a file");

                  const formData = new FormData();
                  formData.append("patientId", patient.patientId);
                  formData.append("file", doctorNoteFile);

                  const res = await fetch("/api/ds", { method: "POST", body: formData });
                  const data = await res.json();
                  if (data.error) return console.log(data.error);

                  setDoctorSummaries(prev => [data, ...prev]);
                  await submitDischarge();

                  setShowDoctorNoteModal(false);
                  setDoctorNoteFile(null);
                }}
              >
                Confirm Discharge
              </button>
              <button
                style={{ ...buttonStyle, backgroundColor: "#ccc", color: "#333" }}
                onClick={() => setShowDoctorNoteModal(false)}
              >
                Cancel
              </button>
            </div>
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
    </main>
  );
}

// Styles
const cardStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  borderRadius: 12,
  padding: 24,
  boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
  backgroundColor: "#ffffff",
  transition: "all 0.2s",
};

const cardStyleRight: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  borderRadius: 12,
  padding: 24,
  boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
  backgroundColor: "#fffbe6",
  transition: "all 0.2s",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 10,
  marginBottom: 12,
  borderRadius: 8,
  border: "1px solid #ccc",
  fontSize: 14,
  transition: "border 0.2s",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  transition: "all 0.2s",
};

const buttonStyleRed: React.CSSProperties = {
  ...buttonStyle,
  background: "linear-gradient(90deg, #f44336, #e53935)",
  boxShadow: "0 4px 12px rgba(244,67,54,0.3)",
};
const buttonStyleBlue: React.CSSProperties = {
  ...buttonStyle,
  background: "linear-gradient(90deg, #2196f3, #1976d2)",
  boxShadow: "0 4px 12px rgba(33,150,243,0.3)",
};

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
  padding: 28,
  borderRadius: 14,
  width: 420,
  boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const dropdownHeader: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #ccc",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#f7f7f7",
  fontWeight: 500,
  transition: "background 0.2s",
};

const dropdownContent: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  left: 0,
  width: "100%",
  maxHeight: 250,
  overflowY: "auto",
  backgroundColor: "#fff",
  border: "1px solid #ddd",
  borderRadius: 8,
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  marginTop: 6,
  padding: 12,
  zIndex: 10,
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

const fileInputHidden: React.CSSProperties = {
  position: "absolute",
  width: "100%",
  height: "100%",
  opacity: 0,
  cursor: "pointer",
};
