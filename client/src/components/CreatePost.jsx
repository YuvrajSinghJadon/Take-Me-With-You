import React, { useState } from "react";
import axios from "axios"; // Import Axios for API calls
import { useForm } from "react-hook-form";
import { BiImages } from "react-icons/bi";
import { CustomButton, Loading, TextInput } from "../components";
import { NoProfile } from "../assets";
import { AiOutlineClose } from "react-icons/ai"; // Close icon

const CreatePost = ({ fetchPosts, user }) => {
  const [file, setFile] = useState(null); // State for image file
  const [posting, setPosting] = useState(false); // State for form submission
  const [errMsg, setErrMsg] = useState(""); // Error message state
  const [showModal, setShowModal] = useState(false); // State to show/hide modal

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const handlePostSubmit = async (data) => {
    try {
      setPosting(true); // Indicate that the form is being submitted
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
        // Clear the form fields, including the file input
        reset(); // This will reset the form fields
        setFile(null); // Clear the file state
        document.getElementById("imgUpload").value = null;
        fetchPosts(); // Refresh the posts list after successful creation
        setShowModal(false); // Close modal after successful post creation
      } else {
        setErrMsg("Failed to create post. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      setErrMsg("Failed to create post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      {/* Create Post Button */}
      <CustomButton
        title="Create Post"
        onClick={() => setShowModal(true)}
        containerStyles="bg-[#0444a4] text-white py-2 px-6 rounded-full font-semibold text-lg mx-auto w-auto max-w-xs"
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
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CreatePost;
