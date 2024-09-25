import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TextInput from "./TextInput";
import Loading from "./Loading"; // Your custom loading component
import CustomButton from "./CustomButton";
import { UpdateProfile, SetEditState } from "../redux/userSlice";
import { setLoading } from "../redux/loaderSlice"; // For loading state
import axios from "axios";

const EditProfile = () => {
  const { user } = useSelector((state) => state.user);
  const { isLoading } = useSelector((state) => state.loader); // Get the loader state
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errMsg, setErrMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [picture, setPicture] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: { ...user },
  });

  const onSubmit = async (data) => {
    dispatch(setLoading(true)); // Start loading
    setErrMsg("");

    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("profession", data.profession);
      formData.append("location", data.location);

      if (picture) {
        formData.append("profilePicture", picture);
      }

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/update-user`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        dispatch(UpdateProfile(response.data.user));
        reset(); // Reset form fields
        setPicture(null); // Clear selected image
        setShowPopup(true); // Show success popup
        dispatch(setLoading(false)); // Stop loading before showing popup

        // Delay modal close and redirect by 3 seconds
        setTimeout(() => {
          setShowPopup(false); // Hide the popup
          dispatch(SetEditState(false)); // Close the modal by setting edit state to false
          navigate("/"); // Redirect to home page
        }, 3000); // 3 seconds
      } else {
        setErrMsg("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      setErrMsg("Profile update failed. Please try again.");
    } finally {
      dispatch(setLoading(false)); // Stop loading after everything
    }
  };

  const handleClose = () => {
    dispatch(SetEditState(false)); // Close the modal using SetEditState
  };

  const handleSelect = (e) => {
    setPicture(e.target.files[0]);
  };

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center overflow-y-auto">
      {/* Full-Screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loading /> {/* Your custom loading animation */}
        </div>
      )}

      {/* Modal */}
      <div className="fixed inset-0 bg-black opacity-60"></div>
      <div className="relative bg-white w-full max-w-lg rounded-lg shadow-xl p-8 z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit Profile</h2>
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextInput
            name="firstName"
            label="First Name"
            placeholder="First Name"
            type="text"
            styles="w-full border border-gray-300 rounded-md p-2"
            register={register("firstName", {
              required: "First Name is required!",
            })}
            error={errors.firstName ? errors.firstName?.message : ""}
          />

          <TextInput
            name="lastName"
            label="Last Name"
            placeholder="Last Name"
            type="text"
            styles="w-full border border-gray-300 rounded-md p-2"
            register={register("lastName", {
              required: "Last Name is required!",
            })}
            error={errors.lastName ? errors.lastName?.message : ""}
          />

          <TextInput
            name="profession"
            label="Profession"
            placeholder="Profession"
            type="text"
            styles="w-full border border-gray-300 rounded-md p-2"
            register={register("profession", {
              required: "Profession is required!",
            })}
            error={errors.profession ? errors.profession?.message : ""}
          />

          <TextInput
            name="location"
            label="Location"
            placeholder="Location"
            type="text"
            styles="w-full border border-gray-300 rounded-md p-2"
            register={register("location", {
              required: "Location is required!",
            })}
            error={errors.location ? errors.location?.message : ""}
          />

          {/* Image upload section */}
          <div className="flex items-center space-x-4">
            <div>
              <label
                htmlFor="file-upload"
                className="inline-block px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-md shadow-sm cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upload Picture
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleSelect}
                className="hidden"
              />
            </div>
          </div>

          {errMsg && (
            <span role="alert" className="text-sm text-red-500 mt-2">
              {errMsg}
            </span>
          )}

          <div className="flex justify-end mt-6">
            {!isLoading ? (
              <CustomButton
                type="submit"
                title="Submit"
                size="md" // Using medium size for this button
                backgroundColor="bg-blue-600" // Custom background color
                textColor="text-white" // Custom text color
                containerStyles="rounded-full transition hover:bg-blue-700" // Simplified and retained hover state
              />
            ) : null}
          </div>
        </form>
      </div>

      {/* Success Popup */}
      {showPopup && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-lg">
          Profile updated successfully! Redirecting...
        </div>
      )}
    </div>
  );
};

export default EditProfile;
