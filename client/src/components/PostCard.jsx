import React, { useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { NoProfile } from "../assets";
import { BiComment } from "react-icons/bi"; // For Queries
import { FaUserPlus } from "react-icons/fa"; // For Join Request
import { MdOutlineDeleteOutline } from "react-icons/md";
import CommentForm from "./CommentForm";
import Loading from "./Loading";
import CommentCard from "./CommentCard";

const PostCard = ({ post, user, deletePost, joinTrip }) => {
  const [showQueries, setShowQueries] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyComments, setReplyComments] = useState(0);
  const [showReply, setShowReply] = useState(0);

  const getComments = async () => {
    setLoading(true);
    try {
      // Call API to fetch comments for the post
      setComments(post.comments); // Assume post.comments is an array of comments
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-2 bg-primary p-4 rounded-xl">
      <div className="flex gap-3 items-center mb-2">
        <Link to={"/profile/" + post?.userId?._id}>
          <img
            src={post?.userId?.profileUrl ?? NoProfile}
            alt={post?.userId?.firstName}
            className="w-14 h-14 object-cover rounded-full"
          />
        </Link>
        <div className="w-full flex justify-between">
          <div>
            <Link to={"/profile/" + post?.userId?._id}>
              <p className="font-medium text-lg text-ascent-1">
                {post?.userId?.firstName} {post?.userId?.lastName}
              </p>
            </Link>
            <span className="text-ascent-2">{post?.userId?.location}</span>
          </div>
          <span className="text-ascent-2">
            {moment(post?.createdAt).fromNow()}
          </span>
        </div>
      </div>

      {/* Trip Details */}
      <div>
        {/* Display Post Image */}
        {post?.imageUrl && (
          <img
            src={post?.imageUrl}
            alt="Post"
            className="w-full h-64 mt-2 rounded-lg object-top object-contain" // Updated styling to preserve aspect ratio
          />
        )}
        <p className="text-ascent-2 font-medium">
          Trip Start Date: {post?.startDate}
        </p>
        <p className="text-ascent-2 font-medium">
          Estimated Days: {post?.estimatedDays}
        </p>
        <p className="text-ascent-2 font-medium">
          Destinations: {post?.destinations?.join(", ")}
        </p>
        <p className="text-ascent-2 mt-2">{post?.description}</p>
      </div>

      {/* JOIN and QUERIES Buttons */}
      <div className="mt-4 flex justify-between items-center px-3 py-2 text-ascent-2 text-base border-t border-[#66666645]">
        {/* Show "Request to Join" only if the logged-in user is not the post owner */}
        {user?._id !== post?.userId?._id && (
          <p
            className="flex gap-2 items-center text-base cursor-pointer"
            onClick={() => joinTrip(post._id)}
          >
            <FaUserPlus size={20} />
            Request to Join
          </p>
        )}

        <p
          className="flex gap-2 items-center text-base cursor-pointer"
          onClick={() => {
            setShowQueries(showQueries === post._id ? null : post._id);
            getComments(post._id);
          }}
        >
          <BiComment size={20} />
          {post?.comments?.length} Queries
        </p>
        {/* Show Delete button if the logged-in user is the post owner */}
        {user?._id === post?.userId?._id && (
          <div
            className="flex gap-1 items-center text-base text-ascent-1 cursor-pointer"
            onClick={() => deletePost(post?._id)}
          >
            <MdOutlineDeleteOutline size={20} />
            <span>Delete</span>
          </div>
        )}
      </div>

      {/* Display Queries Section */}
      {showQueries === post?._id && (
        <div className="w-full mt-4 border-t border-[#66666645] pt-4">
          <CommentForm
            user={user}
            id={post?._id}
            getComments={() => getComments(post?._id)}
          />
          {loading ? (
            <Loading />
          ) : comments?.length > 0 ? (
            comments?.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                user={user}
                getComments={getComments}
                replyComments={replyComments}
                setReplyComments={setReplyComments}
                showReply={showReply}
                setShowReply={setShowReply}
              />
            ))
          ) : (
            <span className="flex text-sm py-4 text-ascent-2 text-center">
              No Queries, be first to ask!
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
