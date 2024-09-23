import React, { useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { NoProfile } from "../assets";
import ReplyCard from "./ReplyCard";
import CommentForm from "./CommentCard";

const CommentCard = ({
  comment,
  user,
  getComments,
  replyComments,
  setReplyComments,
  showReply,
  setShowReply,
}) => {
  return (
    <div className="w-full py-2">
      <div className="flex gap-3 items-center mb-1">
        <Link to={"/profile/" + comment?.userId?._id}>
          <img
            src={comment?.userId?.profileUrl ?? NoProfile}
            alt={comment?.userId?.firstName}
            className="w-10 h-10 rounded-full object-cover"
          />
        </Link>
        <div>
          <Link to={"/profile/" + comment?.userId?._id}>
            <p className="font-medium text-base text-ascent-1">
              {comment?.userId?.firstName} {comment?.userId?.lastName}
            </p>
          </Link>
          <span className="text-ascent-2 text-sm">
            {moment(comment?.createdAt).fromNow()}
          </span>
        </div>
      </div>
      <div className="ml-12">
        <p className="text-ascent-2">{comment?.comment}</p>
        <div className="mt-2 flex gap-6">
          <p
            className="text-blue cursor-pointer"
            onClick={() => setReplyComments(comment?._id)}
          >
            Reply
          </p>
        </div>
        {replyComments === comment?._id && (
          <CommentForm
            user={user}
            id={comment?._id}
            replyAt={comment?.from}
            getComments={() => getComments()}
          />
        )}
        <div className="py-2 px-8 mt-6">
          {comment?.replies?.length > 0 && (
            <p
              className="text-base text-ascent-1 cursor-pointer"
              onClick={() =>
                setShowReply(showReply === comment?._id ? 0 : comment?._id)
              }
            >
              Show Replies ({comment?.replies?.length})
            </p>
          )}
          {showReply === comment?._id &&
            comment?.replies?.map((reply) => (
              <ReplyCard
                reply={reply}
                user={user}
                key={reply?._id}
                handleLike={() => console.log("Handle reply like logic")}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default CommentCard;
