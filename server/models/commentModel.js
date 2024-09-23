import mongoose, { Schema } from "mongoose";

const replySchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Users", required: true }, // Reference to user
    comment: { type: String, required: true }, // The reply text
    replyAt: { type: Date, default: Date.now() }, // Date of reply
    likes: [{ type: Schema.Types.ObjectId, ref: "Users" }], // Array of userIds who liked the reply
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

const commentSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Users", required: true }, // Reference to user
    postId: { type: Schema.Types.ObjectId, ref: "Posts", required: true }, // Reference to the post
    comment: { type: String, required: true }, // The main comment text
    replies: [replySchema], // Array of replies
    likes: [{ type: Schema.Types.ObjectId, ref: "Users" }], // Array of userIds who liked the comment
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

const Comments = mongoose.model("Comments", commentSchema);

export default Comments;
