// webSockets/postSocket.js
let ioInstance;

export const postSocketEvents = (socket, io) => {
  ioInstance = io; // Store the io instance for later use in emit functions
  console.log("Post socket connected:", socket.id);

  // If you have specific event listeners for posts, set them up here
  // For example:
  // socket.on("somePostEvent", (data) => { ... });

  socket.on("disconnect", () => {
    console.log("Post socket disconnected:", socket.id);
  });
};

// Function to emit the post created event
export const emitPostCreated = (post) => {
  if (ioInstance) {
    console.log("Emitting new post:", post);
    ioInstance.emit("postCreated", post);
  } else {
    console.log("Socket.IO instance not initialized for posts");
  }
};
