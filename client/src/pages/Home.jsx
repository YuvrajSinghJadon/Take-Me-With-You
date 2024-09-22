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
  TextInput,
  TopBar,
} from "../components";
import { Link } from "react-router-dom";
import { NoProfile } from "../assets";
import { BiImages } from "react-icons/bi";
import { useForm } from "react-hook-form";

const Home = () => {
  const { user, edit } = useSelector((state) => state.user);
  const [posts, setPosts] = useState([]); // State to store fetched posts
  const [errMsg, setErrMsg] = useState("");
  const [file, setFile] = useState(null);
  const [posting, setPosting] = useState(false); // State for form submission
  const [loading, setLoading] = useState(true); // Loading state while fetching posts

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Function to fetch posts from the backend
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts`,
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Add JWT token for authorization
          },
        }
      );
      setPosts(response.data.data); // Update posts state with the fetched data
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

  // Handle post submission
  const handlePostSubmit = async (data) => {
    try {
      setPosting(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("description", data.description);
      formData.append("startDate", data.startDate);
      formData.append("estimatedDays", data.estimatedDays);
      formData.append("destinations", JSON.stringify(data.destinations));
      if (file) formData.append("image", file);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/posts/create-post`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Post created successfully!");
      fetchPosts(); // Refresh posts after creating a new one
    } catch (error) {
      console.error("Failed to create post:", error);
      setErrMsg("Failed to create post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  // Function to handle joining a trip
  const joinTrip = async (postId) => {
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
            <form
              onSubmit={handleSubmit(handlePostSubmit)}
              className="bg-primary px-4 rounded-lg"
            >
              <div className="w-full flex items-center gap-2 py-4 border-b border-[#66666645]">
                <img
                  src={user?.profileUrl ?? NoProfile}
                  alt="User Image"
                  className="w-14 h-14 rounded-full object-cover"
                />
                <TextInput
                  styles="w-full rounded-full "
                  placeholder="What's on your mind...."
                  name="description"
                  register={register("description", {
                    required: "Write something about post",
                  })}
                  error={errors.description ? errors.description.message : ""}
                />
              </div>

              {/* Additional fields for trip details */}
              <div className="flex flex-col gap-4 py-4">
                <TextInput
                  styles="w-full rounded-full"
                  placeholder="Trip Start Date"
                  name="startDate"
                  type="date"
                  register={register("startDate", {
                    required: "Start date is required",
                  })}
                  error={errors.startDate ? errors.startDate.message : ""}
                />

                <TextInput
                  styles="w-full rounded-full"
                  placeholder="Estimated Days"
                  name="estimatedDays"
                  type="number"
                  register={register("estimatedDays", {
                    required: "Estimated days are required",
                  })}
                  error={
                    errors.estimatedDays ? errors.estimatedDays.message : ""
                  }
                />

                <TextInput
                  styles="w-full rounded-full"
                  placeholder="Destinations (comma separated)"
                  name="destinations"
                  register={register("destinations", {
                    required: "At least one destination is required",
                  })}
                  error={errors.destinations ? errors.destinations.message : ""}
                />
              </div>

              {errMsg && (
                <span role="alert" className="text-sm text-red-500 mt-0.5">
                  {errMsg}
                </span>
              )}

              <div className="flex items-center justify-between py-4">
                <label
                  htmlFor="imgUpload"
                  className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer"
                >
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    id="imgUpload"
                    data-max-size="5120"
                    accept=".jpg, .png, .jpeg"
                  />
                  <BiImages />
                  <span>Image</span>
                </label>

                <div>
                  {posting ? (
                    <Loading />
                  ) : (
                    <CustomButton
                      type="submit"
                      title="Post"
                      containerStyles="bg-[#0444a4] text-white py-1 px-6 rounded-full font-semibold text-sm"
                    />
                  )}
                </div>
              </div>
            </form>

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
      </div>

      {edit && <EditProfile />}
    </>
  );
};

export default Home;
