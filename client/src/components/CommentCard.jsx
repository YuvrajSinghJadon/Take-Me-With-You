import React, { useState } from "react";
import { AiOutlineLike, AiFillLike } from "react-icons/ai"; // Thumbs-up icons
import ReplyForm from "./ReplyForm";
import ReplyCard from "./ReplyCard";
import moment from "moment";
import { NoProfile } from "../assets";
import axios from "axios";

const CommentCard = ({ comment, user, addReply }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState(comment?.replies || []);
  const [isLiked, setIsLiked] = useState(comment?.likes.includes(user._id));
  const [likesCount, setLikesCount] = useState(comment?.likes.length);
  // Function to handle reply submission
  const handleAddReply = async (replyData) => {
    const newReply = {
      comment: replyData.reply,
      userId: user._id,
      postId: comment.postId,
      commentId: comment._id, // Make sure the comment ID is passed here
    };

    // Call parent function to add reply
    const addedReply = await addReply(newReply);
    // Update the local replies state with the newly added reply
    setReplies([...replies, addedReply]);
  };
  // Function to like/unlike a comment
  const handleLike = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/like-comment/${comment._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1); // Update like count
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        <img
          src={comment?.userId?.profileUrl || NoProfile}
          alt={comment?.userId?.firstName}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-medium">{comment?.userId?.firstName}</p>
          <span className="text-sm text-gray-500">
            {moment(comment?.createdAt).fromNow()}
          </span>
        </div>
      </div>

      <p className="mt-2">{comment?.comment}</p>

      <div className="mt-2 flex items-center gap-3">
        <button onClick={handleLike} className="flex items-center gap-1">
          {isLiked ? <AiFillLike size={20} /> : <AiOutlineLike size={20} />}
          {likesCount}
        </button>
        <button
          className="text-blue-500 text-sm"
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          {showReplyForm ? "Cancel" : "Reply"}
        </button>
      </div>

      {/* Reply Form */}
      {showReplyForm && <ReplyForm onSubmit={handleAddReply} />}

      {/* Display Replies */}
      {replies.length > 0 && (
        <div className="mt-4 ml-6">
          {replies.map((reply) => (
            <ReplyCard
              key={reply._id}
              reply={reply}
              user={user}
              commentId={comment._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentCard;
