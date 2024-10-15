// directChatSocket.js
import DirectMessage from "../models/directMessageModel.js";
import DirectConversation from "../models/directConversationModel.js";

export const directMessageSocketEvents = (socket, io) => {
  // Join Direct Conversation
  socket.on("joinDirectConversation", async ({ conversationId }) => {
    try {
      socket.join(conversationId);
      console.log(`User joined direct conversation: ${conversationId}`);
    } catch (error) {
      console.error("Error joining conversation:", error);
    }
  });

  // Send Direct Message
  socket.on(
    "sendDirectMessage",
    async ({ conversationId, message, senderId }) => {
      try {
        const newMessage = await DirectMessage.create({
          conversationId,
          sender: senderId,
          message,
        });

        const populatedMessage = await DirectMessage.findById(newMessage._id)
          .populate("sender", "firstName lastName _id")
          .exec();

        await DirectConversation.findByIdAndUpdate(conversationId, {
          lastMessage: newMessage._id,
        });

        io.to(conversationId).emit("receiveDirectMessage", populatedMessage);
      } catch (error) {
        console.error("Error sending direct message:", error);
      }
    }
  );

  // Edit Direct Message
  socket.on("editDirectMessage", async ({ messageId, newMessageContent }) => {
    try {
      const updatedMessage = await DirectMessage.findByIdAndUpdate(
        messageId,
        { message: newMessageContent },
        { new: true }
      ).populate("sender", "firstName lastName");

      io.to(updatedMessage.conversationId.toString()).emit(
        "directMessageEdited",
        updatedMessage
      );
    } catch (error) {
      console.error("Error editing direct message:", error);
    }
  });

  // Delete Direct Message
  socket.on("deleteDirectMessage", async ({ messageId, conversationId }) => {
    try {
      await DirectMessage.findByIdAndDelete(messageId);
      io.to(conversationId).emit("directMessageDeleted", messageId);
    } catch (error) {
      console.error("Error deleting direct message:", error);
    }
  });
};
