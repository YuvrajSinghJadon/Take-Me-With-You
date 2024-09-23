import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import moment from "moment";
import { NoProfile } from "../assets";
import axios from "axios";
import { BiComment } from "react-icons/bi";
const ReplyCard = ({ reply, user, commentId }) => {
  const [isLiked, setIsLiked] = useState(reply?.likes.includes(user._id));
  const [likesCount, setLikesCount] = useState(reply?.likes.length);

  const handleReplyLike = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/like-reply/${commentId}/${
          reply._id
        }`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
      }
    } catch (error) {
      console.error("Error liking reply:", error);
    }
  };
  return (
    <div className="w-full py-3 ml-12">
      <div className="flex gap-3 items-center mb-1">
        <Link to={"/profile/" + reply?.userId?._id}>
          <img
            src={reply?.userId?.profileUrl ?? NoProfile}
            alt={reply?.userId?.firstName}
            className="w-10 h-10 rounded-full object-cover"
          />
        </Link>

        <div>
          <Link to={"/profile/" + reply?.userId?._id}>
            <p className="font-medium text-base text-ascent-1">
              {reply?.userId?.firstName} {reply?.userId?.lastName}
            </p>
          </Link>
          <span className="text-ascent-2 text-sm">
            {moment(reply?.createdAt).fromNow()}
          </span>
        </div>
      </div>

      <div>
        <p className="text-ascent-2">{reply?.comment}</p>
        <div className="mt-2 flex items-center gap-3">
          <button onClick={handleReplyLike} className="flex items-center gap-1">
            {isLiked ? <AiFillLike size={20} /> : <AiOutlineLike size={20} />}
            {likesCount}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyCard;
