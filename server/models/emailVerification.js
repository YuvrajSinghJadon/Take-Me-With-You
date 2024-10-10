import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  whatsappNumber: { type: String, required: true },
  token: { type: String, required: true },
  expoPushToken: { type: String, default: null },
  JoinRequests: [],
  groups: [],
  createdAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
});

const Verification = mongoose.model("Verification", emailVerificationSchema);

export default Verification;
