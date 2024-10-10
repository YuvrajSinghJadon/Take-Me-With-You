import mongoose, { Schema } from "mongoose";

// Schema for tracking Join Trip Requests
const joinRequestSchema = new mongoose.Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Posts", required: true }, // Reference to the trip post
    userId: { type: Schema.Types.ObjectId, ref: "Users", required: true }, // User who is requesting to join the trip
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"], // Status of the join request
      default: "Pending",
    },
    message: { type: String }, // Optional message from the user requesting to join
  },
  { timestamps: true }
);

const JoinRequests = mongoose.model("JoinRequests", joinRequestSchema);

export default JoinRequests;
