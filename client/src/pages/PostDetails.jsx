import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Loading from "../components/Loading";
import CommentCard from "../components/CommentCard";
import CommentForm from "../components/CommentForm";

const PostDetails = ({ user }) => {
  const { id } = useParams(); // Get the post ID from the URL
  const [post, setPost] = useState(null); // Store the post data
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/posts/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPost(response.data.data); // Set the post data
        setComments(response.data.data.comments); // Load the comments
      } catch (error) {
        console.error("Error fetching post details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

  const getComments = async () => {
    // Fetch comments if required to refresh
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="post-details-container">
      {post && (
        <div className="post-content bg-primary p-6 rounded-xl">
          {/* Post Image */}
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt="Post"
              className="w-full h-64 rounded-lg object-cover mb-4"
            />
          )}

          {/* Post Details */}
          <h2 className="text-lg font-semibold">{post.description}</h2>
          <p>Start Date: {post.startDate}</p>
          <p>Estimated Days: {post.estimatedDays}</p>
          <p>Destinations: {post.destinations?.join(", ")}</p>

          {/* Comment Section */}
          <div className="comments-section mt-6">
            <h3 className="text-lg font-semibold">Comments</h3>
            <CommentForm user={user} id={post._id} getComments={getComments} />
            {comments.map((comment) => (
              <CommentCard key={comment._id} comment={comment} user={user} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetails;
