import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  FriendsCard,
  Loading,
  PostCard,
  ProfileCard,
  TopBar,
} from "../components";

const Profile = () => {
  const { id } = useParams(); // Get the profile ID from the URL
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user); // Current logged-in user
  const [userInfo, setUserInfo] = useState(null); // Store user info for the profile being viewed
  const [posts, setPosts] = useState([]); // Store posts for the profile
  const [loading, setLoading] = useState(true); // Loading state for fetching data
  const [errMsg, setErrMsg] = useState(""); // Error message

  // Function to fetch user info and posts by userId (profile id)
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Fetch user info
      const userResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/get-user/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUserInfo(userResponse.data.user);

      // Fetch user posts
      const postResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/posts/get-user-post/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setPosts(postResponse.data.data); // Update posts state
    } catch (error) {
      console.error("Error fetching profile data:", error);
      setErrMsg("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile data when the component mounts or when the id changes
  useEffect(() => {
    fetchProfileData();
  }, [id]);

  // Handle deleting a post
  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      // After deleting, refetch the posts
      fetchProfileData();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Try again.");
    }
  };

  // Handle join trip functionality
  const handleJoinTrip = async (postId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/posts/join-request/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Request to join the trip has been sent!");
    } catch (error) {
      console.error("Failed to send join request:", error);
      alert("Failed to send join request. Try again.");
    }
  };

  return (
    <>
      <div className="home w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden">
        <TopBar />

        <div className="w-full flex gap-2 lg:gap-4 md:pl-4 pt-5 pb-10 h-full">
          {/* LEFT SIDE */}
          <div className="hidden w-1/3 lg:w-1/4 md:flex flex-col gap-6 overflow-y-auto">
            {/* Profile Card */}
            {userInfo && <ProfileCard user={userInfo} />}
            {/* Friends Card */}
            <div className="block lg:hidden">
              {userInfo && <FriendsCard friends={userInfo?.friends} />}
            </div>
          </div>

          {/* CENTER */}
          <div className="flex-1 h-full bg-primary px-4 flex flex-col gap-6 overflow-y-auto">
            {loading ? (
              <Loading />
            ) : posts?.length > 0 ? (
              posts?.map((post) => (
                <PostCard
                  post={post}
                  key={post?._id}
                  user={user}
                  deletePost={() => handleDelete(post?._id)}
                  joinTrip={() => handleJoinTrip(post?._id)}
                />
              ))
            ) : (
              <div className="flex w-full h-full items-center justify-center">
                <p className="text-lg text-ascent-2">No Post Available</p>
              </div>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto">
            {userInfo && <FriendsCard friends={userInfo?.friends} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
