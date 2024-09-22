import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Added useLocation for redirect
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { CustomButton, Loading, TextInput } from "../components";
import LoginBackground from "../assets/LoginBackground.png";
import Logo1 from "../assets/Logo1.png";
import axios from "axios";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Get the location to redirect the user back
  const from = location.state?.from?.pathname || "/"; // Redirect to the original page or home

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrMsg("");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        {
          email: data.email,
          password: data.password,
        }
      );

      const { token, user } = response.data;

      // Store JWT token in localStorage or sessionStorage
      localStorage.setItem("token", token);

      // Dispatch login action to Redux or handle user state in context
      dispatch({
        type: "USER_LOGIN_SUCCESS",
        payload: user,
      });

      // Redirect to the previous page or home after successful login
      navigate(from, { replace: true });
    } catch (error) {
      setErrMsg("Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-bgColor w-full h-screen flex items-center justify-center p-6">
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${LoginBackground})` }}
      ></div>
      <div className="relative w-full md:w-2/3 lg:w-1/2 xl:w-1/3 rounded-xl shadow-2xl p-8 bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 hover:shadow-3xl transform hover:scale-105 transition duration-300">
        <div className="flex flex-col items-center">
          <div className="mb-6">
            {/* Logo Placeholder */}
            <img
              src={Logo1}
              alt="TakeMeWithYou Logo"
              className="w-20 object-contain"
            />
          </div>

          <p className="text-blue text-lg font-semibold">
            Log in to your account
          </p>
          <span className="text-blue text-sm mt-2 ">
            Welcome back! Let's get you started.
          </span>

          <form
            className="py-6 flex flex-col gap-4 w-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            <TextInput
              name="email"
              placeholder="email@example.com"
              label="Email Address"
              type="email"
              register={register("email", {
                required: "Email Address is required",
              })}
              styles="w-full rounded-full border border-primary px-4 py-2"
              labelStyle="ml-2"
              error={errors.email ? errors.email.message : ""}
            />

            <TextInput
              name="password"
              label="Password"
              placeholder="Password"
              type="password"
              styles="w-full rounded-full border border-primary px-4 py-2"
              labelStyle="ml-2"
              register={register("password", {
                required: "Password is required!",
              })}
              error={errors.password ? errors.password?.message : ""}
            />

            <Link
              to="/reset-password"
              className="text-sm text-right text-blue font-semibold"
            >
              Forgot Password?
            </Link>

            {errMsg && (
              <span className="text-sm text-red-500 mt-0.5">{errMsg}</span>
            )}

            {isSubmitting ? (
              <Loading />
            ) : (
              <CustomButton
                type="submit"
                containerStyles="inline-flex justify-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-white"
                title="Login"
              />
            )}
          </form>

          <p className="text-secondary text-sm text-center">
            Don't have an account?
            <Link
              to="/register"
              className="text-accent font-semibold ml-2 cursor-pointer"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
