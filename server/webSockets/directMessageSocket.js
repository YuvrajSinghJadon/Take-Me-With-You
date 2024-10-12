import DirectMessage from "../models/directMessageModel.js";
import DirectConversation from "../models/directConversationModel.js";

export const directMessageSocketEvents = (socket, io) => {
  // Join Direct Conversation
  socket.on("joinConversation", async ({ conversationId, userId }) => {
    try {
      socket.join(conversationId);
      const messages = await DirectMessage.find({ conversationId })
        .populate("sender", "firstName lastName")
        .sort({ createdAt: 1 });

      socket.emit("loadMessages", messages);
    } catch (error) {
      console.error("Error joining conversation:", error);
    }
  });

  // Send Direct Message
  socket.on("sendMessage", async ({ conversationId, message, senderId }) => {
    try {
      const newMessage = await DirectMessage.create({
        conversationId,
        sender: senderId,
        message,
      });

      // Update the lastMessage field in the conversation
      await DirectConversation.findByIdAndUpdate(conversationId, {
        lastMessage: newMessage._id,
      });

      io.to(conversationId).emit("receiveMessage", newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });
};
