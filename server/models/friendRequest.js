import mongoose, { Schema } from "mongoose";

// Friend Request Schema
const friendRequestSchema = new mongoose.Schema(
  {
    requestFrom: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    requestTo: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    requestStatus: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Create and export the Friend Request model
const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
export default FriendRequest;
