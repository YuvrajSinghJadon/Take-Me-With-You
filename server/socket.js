import { Server as socketIO } from "socket.io"; // Using ES6 imports for Socket.IO
import Group from "./models/Groups.js";
import Message from "./models/messageModel.js";

export const initializeSocket = (server) => {
  const io = new socketIO(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User joins a group chat room
    socket.on("joinRoom", async (groupId) => {
      socket.join(groupId);
      console.log(`User joined room: ${groupId}`);

      // Send the chat history to the user when they join, populating the sender details
      const group = await Group.findById(groupId).populate({
        path: "messages",
        populate: {
          path: "sender",
          select: "firstName lastName", // Only select necessary fields
        },
      });

      if (group) {
        socket.emit("loadMessages", group.messages);
      }
    });

    // User sends a message
    socket.on("sendMessage", async ({ groupId, message, senderId }) => {
      try {
        const newMessage = await Message.create({
          groupId,
          sender: senderId,
          message,
        });
        // Populate the sender details when sending the message back to the client
        const populatedMessage = await Message.findById(
          newMessage._id
        ).populate("sender", "firstName lastName");

        // Add the message to the group's messages array
        await Group.findByIdAndUpdate(groupId, {
          $push: { messages: newMessage._id },
        });

        // Broadcast the message to everyone in the room
        io.to(groupId).emit("receiveMessage", populatedMessage);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
    // Handle message deletion
    socket.on("deleteMessage", async ({ messageId, groupId }) => {
      try {
        await Message.findByIdAndDelete(messageId);

        // Remove the message from the group's messages array
        await Group.findByIdAndUpdate(groupId, {
          $pull: { messages: messageId },
        });

        // Broadcast message deletion to all users in the room
        io.to(groupId).emit("messageDeleted", messageId);
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    });

    // Handle message editing
    socket.on("editMessage", async ({ messageId, message, groupId }) => {
      try {
        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          { message },
          { new: true }
        ).populate("sender", "firstName lastName");

        // Broadcast the updated message to all users in the room
        io.to(groupId).emit("messageEdited", updatedMessage);
      } catch (error) {
        console.error("Error editing message:", error);
      }
    });
    // Group owner removes a user from the group
    socket.on("removeUser", async ({ groupId, userId }) => {
      try {
        // Remove the user from the group's users array
        await Group.findByIdAndUpdate(groupId, {
          $pull: { users: userId },
        });

        // Notify the removed user by targeting their socket
        const removedUserSocket = io.sockets.sockets.get(userId); // Assuming userId is socket id
        if (removedUserSocket) {
          removedUserSocket.leave(groupId); // Remove user from the room
          removedUserSocket.emit("removedFromGroup", groupId); // Notify the user
        }

        // Notify other members that the user has been removed
        io.to(groupId).emit("userRemoved", userId);
      } catch (error) {
        console.error("Error removing user from group:", error);
      }
    });

    // User leaves a group chat room
    socket.on("leaveRoom", (groupId) => {
      socket.leave(groupId);
      console.log(`User left room: ${groupId}`);
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
