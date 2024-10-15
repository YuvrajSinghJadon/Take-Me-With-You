import Group from "../models/Groups.js";
import Message from "../models/messageModel.js";

export const groupChatSocketEvents = (socket, io) => {
  // Create Group
  socket.on("createGroup", async (groupData) => {
    try {
      const newGroup = await Group.create(groupData);
      io.emit("groupCreated", newGroup);
    } catch (error) {
      console.error("Error creating group:", error);
      socket.emit("error", "Failed to create group.");
    }
  });

  // Join Group Room
  socket.on("joinRoom", async ({ roomId, userId }) => {
    try {
      socket.join(roomId);
      const group = await Group.findById(roomId).populate({
        path: "messages",
        populate: { path: "sender", select: "firstName lastName" },
      });

      if (!group) {
        socket.emit("error", "Group not found.");
        return;
      }

      const isUserInGroup = group.users.some(
        (groupUser) => groupUser.toString() === userId
      );
      if (!isUserInGroup) {
        socket.emit("accessDenied", "You are not a member of this group.");
        return;
      }

      socket.emit("loadMessages", group.messages);
    } catch (error) {
      console.error("Error joining group:", error);
    }
  });

  // Send Message in Group
  socket.on("sendGroupMessage", async ({ groupId, message, senderId }) => {
    try {
      const newMessage = await Message.create({
        groupId,
        sender: senderId,
        message,
      });
      const group = await Group.findById(groupId);

      if (!group.users.includes(senderId)) {
        socket.emit("accessDenied", "You are no longer a member of this group.");
        return;
      }

      const populatedMessage = await Message.findById(newMessage._id).populate(
        "sender",
        "firstName lastName"
      );
      await Group.findByIdAndUpdate(groupId, {
        $push: { messages: newMessage._id },
      });
      io.to(groupId).emit("receiveMessage", populatedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // Edit Message
  socket.on("editMessage", async ({ messageId, message, groupId }) => {
    try {
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { message },
        { new: true }
      ).populate("sender", "firstName lastName");
      io.to(groupId).emit("messageEdited", updatedMessage);
    } catch (error) {
      console.error("Error editing message:", error);
    }
  });

  // Delete Message
  socket.on("deleteMessage", async ({ messageId, groupId }) => {
    try {
      await Message.findByIdAndDelete(messageId);
      await Group.findByIdAndUpdate(groupId, { $pull: { messages: messageId } });
      io.to(groupId).emit("messageDeleted", messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  });
};
