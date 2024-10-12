// webSockets/postSocket.js
let io;

export const initializePostSocket = (socketServer) => {
  io = socketServer;

  // Emit post creation event to all clients
  io.on("connection", (socket) => {
    console.log("Post socket connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Post socket disconnected:", socket.id);
    });
  });
};

// Function to emit the post created event
export const emitPostCreated = (post) => {
  if (io) {
    io.emit("postCreated", post); // Emit the post event
  } else {
    console.log("Socket.IO instance not initialized for posts");
  }
};
