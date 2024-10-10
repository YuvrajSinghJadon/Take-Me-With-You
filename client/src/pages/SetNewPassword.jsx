import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const SetNewPassword = () => {
  const { userId, token } = useParams(); // Extract userId and token from the URL
  const navigate = useNavigate(); // React Router v6: useNavigate instead of useHistory
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrMsg("");

    // Ensure that userId and token are present
    if (!userId || !token) {
      setErrMsg("Invalid password reset link. Missing required parameters.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/reset-password`,
        {
          userId,
          token,
          password: data.password,
        }
      );

      if (response.data.success) {
        alert(
          "Password changed successfully! Please login with your new password."
        );
        navigate("/login"); // Redirect to login page after success
      } else {
        setErrMsg(response.data.message || "Something went wrong.");
      }
    } catch (error) {
      setErrMsg(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Set New Password</h2>

        {/* New Password Input */}
        <input
          type="password"
          placeholder="New Password"
          {...register("password", { required: "Password is required!" })}
          className="border p-2 mb-4 w-full"
        />
        {errors.password && (
          <p className="text-red-500">{errors.password.message}</p>
        )}

        {/* Confirm Password Input */}
        <input
          type="password"
          placeholder="Confirm Password"
          {...register("confirmPassword", {
            required: "Please confirm your password!",
            validate: (value) =>
              value === watch("password") || "Passwords do not match.",
          })}
          className="border p-2 mb-4 w-full"
        />
        {errors.confirmPassword && (
          <p className="text-red-500">{errors.confirmPassword.message}</p>
        )}

        {/* Error Message Display */}
        {errMsg && <p className="text-red-500">{errMsg}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Set New Password"}
        </button>
      </form>
    </div>
  );
};

export default SetNewPassword;
