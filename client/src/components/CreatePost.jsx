import React, { useState } from "react";
import axios from "axios"; // Import Axios for API calls
import { useForm } from "react-hook-form";
import { BiImages } from "react-icons/bi";
import { CustomButton, Loading, TextInput } from "../components";
import { NoProfile } from "../assets";
import { AiOutlineClose } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../redux/loaderSlice"; // Import setLoading from loaderSlice

const CreatePost = ({ fetchPosts, user }) => {
  const [file, setFile] = useState(null); // State for image file
  const [errMsg, setErrMsg] = useState(""); // Error message state
  const [showModal, setShowModal] = useState(false); // State to show/hide modal

  const { isLoading } = useSelector((state) => state.loader); // Global loading state
  const dispatch = useDispatch(); // Dispatch for setting loading state

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const handlePostSubmit = async (data) => {
    try {
      dispatch(setLoading(true)); // Set global loading to true
      setErrMsg(""); // Clear any previous error messages
      const token = localStorage.getItem("token");

      // Convert the comma-separated destinations into an array
      const destinationsArray = data.destinations
        .split(",")
        .map((destination) => destination.trim());

      // Prepare FormData object for the post data and image
      const formData = new FormData();
      formData.append("description", data.description);
      formData.append("startDate", data.startDate || "");
      formData.append("estimatedDays", data.estimatedDays || 0);
      formData.append("destinations", JSON.stringify(destinationsArray)); // Send destinations as stringified array

      // Append the image file if the user has selected one
      if (file) {
        formData.append("image", file); // Attach image to FormData
      }

      // Send the POST request to the backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/create-post`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the auth token
            "Content-Type": "multipart/form-data", // Ensure proper content type
          },
        }
      );

      if (response.data.success) {
        alert("Post created successfully!");
        reset(); // Reset the form fields
        setFile(null); // Clear the file state
        fetchPosts(); // Refresh the posts list after successful creation
        setShowModal(false); // Close modal after successful post creation
      } else {
        setErrMsg("Failed to create post. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      setErrMsg("Failed to create post. Please try again.");
    } finally {
      dispatch(setLoading(false)); // Set global loading to false
    }
  };

  return (
    <>
      {/* Create Post Button */}
      <CustomButton
        title="Create Post"
        onClick={() => setShowModal(true)}
        size="lg" // Adjust size (based on the provided size)
        backgroundColor="bg-[#0444a4]" // Custom background color
        textColor="text-white" // Custom text color
        containerStyles="font-semibold mx-auto w-auto max-w-xs rounded-full" // Simplified and kept relevant custom styles
      />

      {/* Modal for Create Post */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white w-full max-w-lg p-8 rounded-lg shadow-lg relative">
              {/* Close Button */}
              <button
                className="absolute top-3 right-3 text-2xl"
                onClick={() => setShowModal(false)}
              >
                <AiOutlineClose />
              </button>

              {isLoading ? (
                <Loading /> // Show global loading spinner while the post is being created
              ) : (
                <form onSubmit={handleSubmit(handlePostSubmit)}>
                  <div className="w-full flex items-center gap-2 py-4 border-b border-gray-300">
                    <img
                      src={user?.profileUrl ?? NoProfile}
                      alt="User"
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <TextInput
                      styles="w-full rounded-full"
                      placeholder="What's on your mind...."
                      name="description"
                      register={register("description", {
                        required: "Write something about post",
                      })}
                      error={
                        errors.description ? errors.description.message : ""
                      }
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
                      error={
                        errors.destinations ? errors.destinations.message : ""
                      }
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
                        accept=".jpg, .png, .jpeg"
                      />
                      <BiImages />
                      <span>Image</span>
                    </label>

                    <div>
                      <CustomButton
                        type="submit"
                        title="Post"
                        size="sm" // Smaller button size for "Post"
                        backgroundColor="bg-[#0444a4]" // Custom background color
                        textColor="text-white" // Custom text color
                        containerStyles="font-semibold rounded-full" // Simplified the custom styles for consistency
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CreatePost;
