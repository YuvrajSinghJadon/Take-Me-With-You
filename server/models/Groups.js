import mongoose, { Schema } from "mongoose";

// Schema for Group model
const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Posts", // Reference to the post related to this group
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Users", // Reference to the user who owns/created the group
      required: true,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users", // List of users who are members of this group
      },
    ],
    messages: [
      {
        sender: { type: Schema.Types.ObjectId, ref: "Users" }, // Who sent the message
        message: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Groups = mongoose.model("Groups", groupSchema);

export default Groups;
