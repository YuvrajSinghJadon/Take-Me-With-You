import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  CustomButton,
  EditProfile,
  FriendsCard,
  Loading,
  PostCard,
  ProfileCard,
  TopBar,
  CreatePost,
} from "../components";
import { Link } from "react-router-dom";
import Notification from "../components/Notification";
import { HiMenuAlt3 } from "react-icons/hi";

const Home = () => {
  const { user, edit } = useSelector((state) => state.user);
  const [posts, setPosts] = useState([]);
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [joinStatus, setJoinStatus] = useState("");
  const [showStatus, setShowStatus] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Fetch all posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setPosts(response.data.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setErrMsg("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // JoinTrip functionality
  const joinTrip = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/join-request/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setJoinStatus("Join request sent successfully");
      } else {
        setJoinStatus(response.data.message);
      }
      setShowStatus(true);
    } catch (error) {
      console.error("Failed to send join request:", error);
      setJoinStatus("Failed to send join request. Try again.");
      setShowStatus(true);
    }
  };

  // Fade out join status after 3 seconds
  useEffect(() => {
    if (showStatus) {
      const timer = setTimeout(() => {
        setShowStatus(false);
        setJoinStatus("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showStatus]);

  // Toggle Menu Function
  const toggleMenu = () => {
    setShowMenu((prev) => {
      console.log("Toggling menu:", !prev);
      return !prev;
    });
  };

  return (
    <>
      {/* Hamburger Menu Outside the Main Container */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          className="p-3 bg-blue-500 text-white border-2 border-black rounded-full shadow-lg"
          onClick={toggleMenu}
          aria-label="Open menu"
        >
          <HiMenuAlt3 size={24} />
        </button>

        {/* Sliding Menu */}
        {showMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="absolute top-0 right-0 w-64 bg-white shadow-lg h-full flex flex-col z-60">
              <button
                className="text-right p-4 text-xl"
                onClick={() => setShowMenu(false)}
                aria-label="Close menu"
              >
                &times;
              </button>

              {/* Menu content */}
              <ProfileCard user={user} />
              <FriendsCard friends={user?.friends} />
            </div>
          </div>
        )}
      </div>

      {/* Main Container without Hamburger Menu */}
      <div className="w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden">
        <TopBar />
        <div className="w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full">
          {/* LEFT SECTION (PROFILE & FRIENDS) */}
          <div className="hidden lg:flex w-1/4 h-full flex-col gap-6 overflow-y-auto">
            <ProfileCard user={user} />
            <FriendsCard friends={user?.friends} />
          </div>

          {/* CENTER SECTION */}
          <div className="flex-1 h-full px-4 flex flex-col gap-6 overflow-y-auto">
            <div className="w-full lg:max-w-3xl mx-auto">
              <CreatePost fetchPosts={fetchPosts} />
              {loading ? (
                <Loading />
              ) : posts?.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post?._id}
                    post={post}
                    user={user}
                    deletePost={() => {}}
                    joinTrip={joinTrip}
                  />
                ))
              ) : (
                <div className="flex w-full h-full items-center justify-center">
                  <p className="text-lg text-ascent-2">No Post Available</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SECTION (NOTIFICATIONS) */}
          <div className="hidden lg:flex w-1/4 h-full flex-col gap-6 overflow-y-auto">
            <Notification />
          </div>
        </div>

        {/* Show join request status */}
        {joinStatus && (
          <div
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white py-2 px-4 rounded-lg transition-opacity duration-500 ${
              showStatus ? "opacity-100" : "opacity-0"
            }`}
          >
            {joinStatus}
          </div>
        )}

        {edit && <EditProfile />}
      </div>
    </>
  );
};

export default Home;
