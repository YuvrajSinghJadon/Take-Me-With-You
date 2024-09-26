import { Server } from "socket.io";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:8800", "http://127.0.0.1:5173"], // React frontend URL
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a group chat room
    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
      });

    // Listen for incoming messages and broadcast to the specific room
    socket.on("sendMessage", ({ message, roomId }) => {
      console.log(`Message received in room ${roomId}: ${message}`);
      io.to(roomId).emit("receiveMessage", message); // Only send to users in the room
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export default initializeSocket;
