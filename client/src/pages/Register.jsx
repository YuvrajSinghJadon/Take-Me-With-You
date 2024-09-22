import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Add useNavigate for redirection
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { CustomButton, Loading, TextInput } from "../components";
import RegisterBackground from "../assets/RegisterBackground.png"; // Background Image
import Logo1 from "../assets/Logo1.png"; // Logo Image
import axios from "axios"; // For API calls

const Register = () => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // To redirect after successful registration

  // Submit function to handle registration
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrMsg("");

    try {
      // Send registration request to the backend
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/register`,
        {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        }
      );

      const { token, user } = response.data;

      // Store JWT token in localStorage
      localStorage.setItem("token", token);

      // Dispatch action to save user to Redux store
      dispatch({
        type: "USER_REGISTER_SUCCESS",
        payload: user,
      });

      // Redirect to the dashboard or login after successful registration
      navigate("/login"); // or redirect to login if you want the user to log in separately
    } catch (error) {
      // Handle error during registration
      setErrMsg("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-orange w-full h-screen flex items-center justify-center relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${RegisterBackground})` }}
      ></div>

      {/* Content */}
      <div className="relative w-full lg:w-2/3 xl:w-1/2 bg-gray/80 rounded-xl shadow-xl flex overflow-hidden">
        {/* LEFT SECTION */}
        <div className="hidden lg:flex w-1/2 bg-blue flex-col items-center justify-center py-10 px-8">
          <div className="relative w-64 h-64 flex items-center justify-center rounded-full overflow-hidden">
            <img
              src={RegisterBackground}
              alt="Background Image"
              className="object-cover"
            />
          </div>
          <div className="mt-8 text-center text-white">
            <p className="text-xl font-bold">Connect, Share & Interact</p>
            <p className="text-sm opacity-80 mt-2">
              Explore and share travel memories with friends.
            </p>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="w-full lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center">
          <div className="flex items-center justify-center mb-6">
            <img src={Logo1} alt="Logo" className="w-16 h-16" />
            <span className="text-2xl text-primary font-semibold ml-4">
              Take Me With You
            </span>
          </div>

          <p className="text-primary text-lg font-semibold mb-4">
            Create your account
          </p>

          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* First and Last Name */}
            <div className="flex flex-col lg:flex-row gap-4">
              <TextInput
                name="firstName"
                label="First Name"
                placeholder="First Name"
                type="text"
                styles="w-full rounded-full border border-primary px-4 py-2"
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
                styles="w-full rounded-full border border-primary px-4 py-2"
                register={register("lastName", {
                  required: "Last Name is required!",
                })}
                error={errors.lastName ? errors.lastName?.message : ""}
              />
            </div>

            {/* Email Address */}
            <TextInput
              name="email"
              label="Email Address"
              placeholder="email@example.com"
              type="email"
              styles="w-full rounded-full border border-primary px-4 py-2"
              register={register("email", {
                required: "Email Address is required",
              })}
              error={errors.email ? errors.email.message : ""}
            />

            {/* Password and Confirm Password */}
            <div className="flex flex-col lg:flex-row gap-4">
              <TextInput
                name="password"
                label="Password"
                placeholder="Password"
                type="password"
                styles="w-full rounded-full border border-primary px-4 py-2"
                register={register("password", {
                  required: "Password is required!",
                })}
                error={errors.password ? errors.password?.message : ""}
              />

              <TextInput
                name="cPassword"
                label="Confirm Password"
                placeholder="Confirm Password"
                type="password"
                styles="w-full rounded-full border border-primary px-4 py-2"
                register={register("cPassword", {
                  validate: (value) => {
                    const { password } = getValues();
                    if (password !== value) {
                      return "Passwords do not match";
                    }
                  },
                })}
                error={
                  errors.cPassword && errors.cPassword.type === "validate"
                    ? errors.cPassword?.message
                    : ""
                }
              />
            </div>

            {/* Error Message */}
            {errMsg && (
              <span className="text-sm text-red-500 mt-1">{errMsg}</span>
            )}

            {/* Submit Button */}
            {isSubmitting ? (
              <Loading />
            ) : (
              <CustomButton
                type="submit"
                containerStyles="w-full bg-primary text-white py-3 rounded-full text-sm font-medium"
                title="Create Account"
              />
            )}
          </form>

          {/* Link to Login */}
          <p className="text-blue text-sm text-center mt-6">
            Already have an account?
            <Link
              to="/login"
              className="text-accent font-semibold ml-2 cursor-pointer"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
