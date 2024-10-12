import mongoose, { Schema } from "mongoose";

// DirectConversation Schema for 1:1 conversations
const directConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users", // Both native and traveller are users
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "DirectMessage", // Reference to the last message in the conversation
    },
    lastActiveAt: {
      type: Date,
      default: Date.now, // Automatically updated to the latest activity time
    },
  },
  { timestamps: true }
);

const DirectConversation = mongoose.model(
  "DirectConversation",
  directConversationSchema
);
export default DirectConversation;
