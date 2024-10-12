//socket implementation for direct messages
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
      console.log("Server received 'sendMessage' event:", {
        conversationId,
        message,
        senderId,
      });
      const newMessage = await DirectMessage.create({
        conversationId,
        sender: senderId,
        message,
      });

      const populatedMessage = await DirectMessage.findById(newMessage._id)
        .populate("sender", "firstName lastName _id")
        .exec();

      // Update the lastMessage field in the conversation
      await DirectConversation.findByIdAndUpdate(conversationId, {
        lastMessage: newMessage._id,
      });
      io.to(conversationId).emit("receiveMessage", populatedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });
  socket.on("editMessage", async ({ messageId, newMessageContent }) => {
    try {
      const updatedMessage = await DirectMessage.findByIdAndUpdate(
        messageId,
        { message: newMessageContent },
        { new: true }
      ).populate("sender", "firstName lastName");

      io.to(updatedMessage.conversationId.toString()).emit(
        "messageEdited",
        updatedMessage
      );
    } catch (error) {
      console.error("Error editing message:", error);
    }
  });

  socket.on("deleteMessage", async ({ messageId, conversationId }) => {
    try {
      await DirectMessage.findByIdAndDelete(messageId);
      io.to(conversationId).emit("messageDeleted", messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  });
};
