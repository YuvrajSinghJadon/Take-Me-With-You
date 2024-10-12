import mongoose, { Schema } from "mongoose";

// DirectConversation Schema for 1:1 conversations
const directConversationSchema = new mongoose.Schema(
  {
    nativeId: {
      type: Schema.Types.ObjectId,
      ref: "Users", // Reference to the native user
      required: true,
    },
    travellerId: {
      type: Schema.Types.ObjectId,
      ref: "Users", // Reference to the traveller user
      required: true,
    },
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
