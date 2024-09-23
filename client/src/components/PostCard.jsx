import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import { NoProfile } from "../assets";
import { BiComment } from "react-icons/bi"; // For Queries
import { FaUserPlus } from "react-icons/fa"; // For Join Request
import { MdOutlineDeleteOutline } from "react-icons/md";
import CommentForm from "./CommentForm";
import Loading from "./Loading";
import CommentCard from "./CommentCard";
import axios from "axios"; // Import Axios for API requests

const PostCard = ({ post, user, deletePost, joinTrip }) => {
  const [comments, setComments] = useState(post?.comments || []); // Existing comments
  const [showComments, setShowComments] = useState(false); // Toggle to show/hide comments
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getComments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/comments/${post._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setComments(response.data.data); // Update comments with the fetched data
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle comment submission
  const addComment = async (commentData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/comment/${post._id}`,
        { comment: commentData.comment }, // Send the comment text
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Update the comment list with the new comment
      setComments((prevComments) => [...prevComments, response.data.data]);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };
  // Function to add a reply
  const addReply = async (replyData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/reply-comment/${
          replyData.commentId
        }`,
        replyData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data.data; // Return the added reply to update local state
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  // Handle toggle of comment section
  const toggleComments = () => {
    if (!showComments) {
      getComments(); // Fetch comments only when expanding
    }
    setShowComments(!showComments); // Toggle comment section
  };

  return (
    <div className="mb-2 bg-primary p-4 rounded-xl cursor-pointer">
      <div className="flex gap-3 items-center mb-2">
        <Link to={`/profile/${post?.userId?._id}`}>
          <img
            src={post?.userId?.profileUrl ?? NoProfile}
            alt={post?.userId?.firstName}
            className="w-14 h-14 object-cover rounded-full"
          />
        </Link>
        <div className="w-full flex justify-between">
          <div>
            <Link to={`/profile/${post?.userId?._id}`}>
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

      <div>
        {/* Trip details */}
        {post?.imageUrl && (
          <img
            src={post?.imageUrl}
            alt="Post"
            className="w-full h-64 mt-2 rounded-lg object-cover"
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

      {/* Join and Query Buttons */}
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

        {/* Toggle Comments Section */}
        <p
          className="flex gap-2 items-center text-base cursor-pointer"
          onClick={toggleComments}
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

      {/* Display Comments Section */}
      {showComments && (
        <div className="mt-4">
          <CommentForm user={user} addComment={addComment} />
          {loading ? (
            <Loading />
          ) : (
            comments.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                user={user}
                addReply={addReply} // Pass the addReply function
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
