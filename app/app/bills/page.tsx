"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Bill = {
  _id: string;
  amount: number;
  paid: boolean;
  billFileUrl?: string;
  createdAt: string;
};

export default function BillsPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAmount, setNewAmount] = useState("");
  const [newBillFile, setNewBillFile] = useState<string>("");

  useEffect(() => {
    if (!patientId) return;

    fetch(`/api/bills/${patientId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setBills(data);
        setLoading(false);
      });
  }, [patientId]);

  const handleAddBill = async () => {
    if (!newAmount) return alert("Enter amount");

    const res = await fetch(`/api/bills/${patientId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(newAmount), billFileUrl: newBillFile }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    setBills([data, ...bills]);
    setNewAmount("");
    setNewBillFile("");
  };

  const deleteBill = async (billId: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this bill?");
    if (!confirmDelete) return;

    const res = await fetch(`/api/bills/delete-one/${billId}`, {
        method: "DELETE",
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    // remove bill from UI
    setBills(bills.filter((b) => b._id !== billId));
    };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setNewBillFile(reader.result as string);
    reader.readAsDataURL(file);
  };

  const togglePaid = async (billId: string, paid: boolean) => {
    const res = await fetch(`/api/bills/update/${billId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    setBills(bills.map((b) => (b._id === billId ? data : b)));
  };

  if (loading) return <p>Loading bills...</p>;

  return (
    <main style={{ padding: 20 }}>
      <h1>Bills for Patient {patientId}</h1>

      {/* Add new bill */}
      <div style={{ margin: "20px 0" }}>
        <input
          type="number"
          placeholder="Amount"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          style={{ padding: 8, marginRight: 10 }}
        />
        <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} style={{ marginRight: 10 }} />
        <button onClick={handleAddBill} style={{ padding: "8px 12px" }}>
          Add Bill
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Time</th>
            <th style={thStyle}>Amount</th>
            <th style={thStyle}>Bill File</th>
            <th style={thStyle}>Paid</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill) => {
            const dateObj = new Date(bill.createdAt);
            const dateStr = dateObj.toLocaleDateString("en-GB");
            const timeStr = dateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
            return (
              <tr key={bill._id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={tdStyle}>{dateStr}</td>
                <td style={tdStyle}>{timeStr}</td>
                <td style={tdStyle}>₹{bill.amount}</td>
                <td style={tdStyle}>
                  {bill.billFileUrl ? (
                    <a href={bill.billFileUrl} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={bill.paid}
                    onChange={(e) => togglePaid(bill._id, e.target.checked)}
                  />
                </td>
                <td style={tdStyle}>
                    <button
                        onClick={() => deleteBill(bill._id)}
                        style={{
                        backgroundColor: "#e53935",
                        color: "#fff",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: 4,
                        cursor: "pointer",
                        }}
                    >
                        Delete
                    </button>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: 8,
  borderBottom: "2px solid #333",
};

const tdStyle: React.CSSProperties = {
  padding: 8,
};
