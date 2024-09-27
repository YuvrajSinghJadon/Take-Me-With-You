import mongoose, { Schema } from "mongoose";

// Schema for messages in group chat
const messageSchema = new mongoose.Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Groups",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Messages = mongoose.model("Messages", messageSchema);

export default Messages;
