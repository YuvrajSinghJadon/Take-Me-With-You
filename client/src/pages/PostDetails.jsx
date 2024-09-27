import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Loading from "../components/Loading";
import GroupChat from "../components/GroupChat";

const PostDetails = ({ user }) => {
  const { id } = useParams(); // Get the post ID from the URL
  const [post, setPost] = useState(null); // Store the post data
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null); // Store the group information
  const [groupError, setGroupError] = useState(false); // Store group fetch error
  const [isChatOpen, setIsChatOpen] = useState(false); // Modal state for Group Chat

  // Fetch the post and related group data
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

        // Fetch group info for this post
        try {
          const groupResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/posts/group/${
              response.data.data._id
            }`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setGroup(groupResponse.data.data);
        } catch (groupError) {
          if (groupError.response && groupError.response.status === 404) {
            setGroupError(true); // Handle 404 error specifically
          } else {
            console.error("Error fetching group:", groupError);
          }
        }
      } catch (error) {
        console.error("Error fetching post details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="post-details-container max-w-6xl mx-auto p-6 bg-gray-100 dark:bg-gray-900 rounded-xl">
      {post && (
        <>
          {/* Post Image */}
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt="Post"
              className="w-full h-80 rounded-lg object-cover mb-8"
            />
          )}

          {/* Post Details & Group */}
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex-1">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {post.description}
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Start Date:</strong> {post.startDate}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Estimated Days:</strong> {post.estimatedDays}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Destinations:</strong> {post.destinations?.join(", ")}
              </p>
            </div>

            {/* Group Info & Group Chat Button */}
            {group ? (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full lg:w-1/3">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Trip Group
                </h3>
                <ul className="text-gray-700 dark:text-gray-300">
                  {group.users.map((member) => (
                    <li key={member._id} className="mb-2">
                      {member.firstName} {member.lastName}
                    </li>
                  ))}
                </ul>
                <button
                  className="bg-blue-500 text-white p-2 rounded-lg mt-4"
                  onClick={() => setIsChatOpen(true)}
                >
                  Open Group Chat
                </button>
              </div>
            ) : groupError ? (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full lg:w-1/3">
                <p className="text-gray-700 dark:text-gray-300">
                  No group formed.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full lg:w-1/3">
                <p className="text-gray-700 dark:text-gray-300">
                  Loading group information...
                </p>
              </div>
            )}
          </div>

          {/* Modal for Group Chat */}
          {isChatOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setIsChatOpen(false)}
                >
                  Close
                </button>
                <GroupChat roomId={group._id} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostDetails;
