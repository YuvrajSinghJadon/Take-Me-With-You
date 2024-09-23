import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios for API calls
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

const Home = () => {
  const { user, edit } = useSelector((state) => state.user);
  const [posts, setPosts] = useState([]); // State to store fetched posts
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(true); // Loading state while fetching posts

  // Fetch all posts (for homepage)
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

  // Use useEffect to fetch posts on component mount
  useEffect(() => {
    fetchPosts(); // Fetch posts when the component loads
  }, []);

  return (
    <>
      <div className="w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden">
        <TopBar />

        <div className="w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full">
          {/* LEFT */}
          <div className="hidden w-1/3 lg:w-1/4 h-full md:flex flex-col gap-6 overflow-y-auto">
            <ProfileCard user={user} />
            <FriendsCard friends={user?.friends} />
          </div>

          {/* CENTER */}
          <div className="flex-1 h-full px-4 flex flex-col gap-6 overflow-y-auto rounded-lg">
            <CreatePost fetchPosts={fetchPosts} user={user} />{" "}
            {/* Use CreatePost component */}
            {/* Display Posts */}
            {loading ? (
              <Loading />
            ) : posts?.length > 0 ? (
              posts?.map((post) => (
                <PostCard
                  key={post?._id}
                  post={post}
                  user={user}
                  deletePost={() => {}}
                />
              ))
            ) : (
              <div className="flex w-full h-full items-center justify-center">
                <p className="text-lg text-ascent-2">No Post Available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {edit && <EditProfile />}
    </>
  );
};

export default Home;
