import React, { useState } from "react";
import ReplyForm from "./ReplyForm";
import ReplyCard from "./ReplyCard";
import moment from "moment";
import { NoProfile } from "../assets";

const CommentCard = ({ comment, user, addReply }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState(comment?.replies || []);

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

      <div className="mt-2">
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
            <ReplyCard key={reply._id} reply={reply} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentCard;
