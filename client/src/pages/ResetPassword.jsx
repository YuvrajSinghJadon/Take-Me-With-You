import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { CustomButton, Loading, TextInput } from "../components";
import ResetBackground from "../assets/ResetBackground.png"; // Background Image
import axios from "axios";

const ResetPassword = () => {
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrMsg("");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/request-passwordreset`,
        {
          email: data.email,
        }
      );

      if (response.data.status === "PENDING") {
        setErrMsg({
          status: "success",
          message: "Reset link has been sent to your email. Please check.",
        });
      } else {
        setErrMsg({
          status: "failed",
          message: response.data.message || "Something went wrong.",
        });
      }
    } catch (error) {
      setErrMsg({
        status: "failed",
        message: error.response?.data?.message || "Failed to reset password.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen bg-bgColor flex items-center justify-center relative p-6">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${ResetBackground})` }}
      ></div>

      {/* Content */}
      <div className="relative bg-white/80 w-full md:w-1/3 2xl:w-1/4 px-6 py-8 shadow-md rounded-lg flex flex-col items-center">
        <p className="text-blue text-2xl font-bold mb-4">Forgot Password</p>

        <span className="text-sm text-blue mb-6 text-center">
          Enter the email address you used during registration, and we’ll help
          you reset your password.
        </span>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-4"
        >
          {/* Email Input */}
          <TextInput
            name="email"
            placeholder="email@example.com"
            type="email"
            register={register("email", {
              required: "Email Address is required!",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
              },
            })}
            styles="w-full rounded-lg border border-primary px-4 py-2"
            error={errors.email ? errors.email.message : ""}
          />

          {/* Error Message */}
          {errMsg?.message && (
            <span
              role="alert"
              className={`text-sm ${
                errMsg?.status === "failed"
                  ? "text-[#f64949fe]"
                  : "text-[#2ba150fe]"
              } mt-0.5`}
            >
              {errMsg?.message}
            </span>
          )}

          {/* Submit Button */}
          {isSubmitting ? (
            <Loading />
          ) : (
            <CustomButton
              type="submit"
              containerStyles="w-full bg-primary text-white py-3 rounded-full text-sm font-medium"
              title="Submit"
            />
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
