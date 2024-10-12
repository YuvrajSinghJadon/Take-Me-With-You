import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux"; // Add this line to use Redux state
import Loading from "../components/Loading";
import GroupChat from "../components/GroupChat";
import { FaTrashAlt } from "react-icons/fa"; // Import Trash Icon
import JoinRequests from "../components/JoinRequests";
import ExpenseTrackerModal from "../components/ExpenseTrackerModal"; // Import the modal component
import NativeList from "../components/nativeComponents/NativeList";
const PostDetails = () => {
  const { id } = useParams(); // Get the post ID from the URL
  const [post, setPost] = useState(null); // Store the post data
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null); // Store the group information
  const [groupError, setGroupError] = useState(false); // Store group fetch error
  const [isChatOpen, setIsChatOpen] = useState(false); // Modal state for Group Chat
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  // Get the logged-in user from Redux store
  const { user, token } = useSelector((state) => state.user);

  const [natives, setNatives] = useState([]); // Store natives data
  const [nativesError, setNativesError] = useState(null);

  // Fetch the post and related group data
  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/posts/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
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

        // Fetch join requests for this post
        const joinRequestsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/posts/join-requests/${
            response.data.data._id
          }/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error("Error fetching post details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);
  // Handle user removal
  const handleRemoveUser = async (userId) => {
    try {
      // Ensure only the post owner can remove a user
      if (group && post && post.userId?._id === user?._id) {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/posts/groups/${
            group._id
          }/remove/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Update group members after removal
        setGroup({
          ...group,
          users: group.users.filter((member) => member._id !== userId),
        });
      } else {
        alert("You are not authorized to remove this user.");
      }
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  // Function to find natives by location
  const handleFindNatives = async () => {
    if (!post || !post.destinations || post.destinations.length === 0) {
      setNativesError("No destinations specified in the post.");
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/natives?location=${
          post.destinations[0]
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNatives(response.data); // Set the natives data to the state
      setNativesError(null);
    } catch (error) {
      console.error("Error fetching natives:", error);
      setNativesError("Failed to fetch natives.");
    }
  };

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
                <strong>Start Date:</strong>{" "}
                {new Date(post.startDate).toLocaleDateString()}
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
                    <li key={member._id} className="flex items-center mb-2">
                      <span>
                        {member.firstName} {member.lastName}
                      </span>

                      {/* Show remove icon for the post owner and not for themselves */}
                      {post.userId?._id === user?._id &&
                        member._id !== post.userId._id && (
                          <FaTrashAlt
                            className="ml-2 text-red-500 cursor-pointer"
                            onClick={() => handleRemoveUser(member._id)}
                            title={`Remove ${member.firstName}`}
                          />
                        )}
                    </li>
                  ))}
                </ul>

                {/* Show group chat button only if the logged-in user is in the group */}
                {group.users.some((member) => member._id === user?._id) ? (
                  <button
                    className="bg-blue-500 text-white p-2 rounded-lg mt-4"
                    onClick={() => setIsChatOpen(true)}
                  >
                    Open Group Chat
                  </button>
                ) : (
                  <p className="text-red-500">
                    You are no longer a member of this group.
                  </p>
                )}
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
          {user?._id === post.userId?._id && (
            <div className=" mx-auto mt-5 flex justify-between">
              <JoinRequests posts={[post]} />
            </div>
          )}
          {/* Modal for Group Chat */}
          {isChatOpen && group && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setIsChatOpen(false)}
                >
                  ❌
                </button>
                <GroupChat roomId={group._id} />
              </div>
            </div>
          )}
          <div>
            {/* Existing content */}
            <button
              className="bg-green-500 text-white p-2 rounded-lg mt-4"
              onClick={() => setIsExpenseModalOpen(true)}
            >
              Open Expense Tracker
            </button>

            {isExpenseModalOpen && (
              <ExpenseTrackerModal
                tripId={post._id}
                closeModal={() => setIsExpenseModalOpen(false)}
                group={group}
              />
            )}
          </div>
          <div>
            {/* Find Natives Button */}
            <button
              className="bg-blue-500 text-white p-2 rounded-lg mt-4"
              onClick={handleFindNatives}
            >
              Find Natives in {post.destinations[0]}
            </button>

            {/* Display Natives List */}
            {natives.length > 0 ? (
              <NativeList natives={natives} />
            ) : nativesError ? (
              <p className="text-red-500">{nativesError}</p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default PostDetails;
