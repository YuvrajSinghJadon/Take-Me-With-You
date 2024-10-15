import { Server as socketIO } from "socket.io";
import { groupChatSocketEvents } from "./groupChatSocket.js";
import { directMessageSocketEvents } from "./directMessageSocket.js";
import { postSocketEvents } from "./postSocket.js";

export const initializeSocket = (server) => {
  const io = new socketIO(server, {
    cors: {
      origin: "*", // Modify for production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Initialize  group ,direct chat and post socket events
    groupChatSocketEvents(socket, io);
    directMessageSocketEvents(socket, io);
    postSocketEvents(socket, io);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
