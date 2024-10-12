import mongoose, { Schema } from "mongoose";

// DirectMessage Schema for individual messages in a 1:1 conversation
const directMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "DirectConversation",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "Users", // Sender can be either native or traveller
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const DirectMessage = mongoose.model("DirectMessage", directMessageSchema);
export default DirectMessage;
