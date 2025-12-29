import mongoose, { Schema, models } from "mongoose";

const PatientSchema = new Schema(
  {
    patientId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    aadhar: { type: String, required: true },
    phone: { type: String, required: true },
    bloodGroup: { type: String },
    allergies: { type: String },
    emergencyContact: { type: String },
    fingerprintUrl: { type: String }, // base64 image
    status: { type: String, enum: ["admitted", "discharged"], default: "admitted" },
    referredBy: { type: String },          // Doctor's name
    roomType: { type: String },            // Super Deluxe, Deluxe, Normal, Ward
    roomNo: { type: String },
    wardNo: { type: String },
    dischargeSummary: { type: String }, // <-- NEW FIELD for Doctor's note
  },
  { timestamps: true }
);

// ✅ Important: use `models.Patient || ...` to prevent model overwrite
export default models.Patient || mongoose.model("Patient", PatientSchema);
