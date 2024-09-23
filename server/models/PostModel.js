import mongoose, { Schema } from "mongoose";

// Post Schema
const postSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    startDate: { type: Date }, // If posts involve trips
    estimatedDays: { type: Number }, // For trips, estimate of duration
    destinations: [{ type: String }], // Trip destinations
    likes: [{ type: Schema.Types.ObjectId, ref: "Users" }], // Array of users who liked the post
    comments: [{ type: Schema.Types.ObjectId, ref: "Comments" }], // References to comments
    joinRequests: [{ type: Schema.Types.ObjectId, ref: "JoinRequests" }], // Join trip requests if applicable
    tripMembers: [{ type: Schema.Types.ObjectId, ref: "Users" }],
  },
  { timestamps: true }
);

// Create and export the Post model
const Posts = mongoose.models.Posts || mongoose.model("Posts", postSchema);
export default Posts;
