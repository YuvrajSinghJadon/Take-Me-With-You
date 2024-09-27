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
      ref: "Posts",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Messages", // Array of message references
      },
    ],
  },
  { timestamps: true }
);

const Groups = mongoose.model("Groups", groupSchema);

export default Groups;
