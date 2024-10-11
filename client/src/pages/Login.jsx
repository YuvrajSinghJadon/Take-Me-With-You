import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { CustomButton, Loading, TextInput } from "../components";
import LoginBackground from "../assets/LoginBackground.png";
import Logo1 from "../assets/Logo1.png";
import { UserLogin } from "../redux/userSlice";
import { setLoading } from "../redux/loaderSlice";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const { isLoading } = useSelector((state) => state.loader);
  const [errMsg, setErrMsg] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  // const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data) => {
    dispatch(setLoading(true));
    setErrMsg("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          email: data.email,
          password: data.password,
        }
      );
      console.log("response.data: ", response.data);
      const { token, user } = response.data;

      // Decode the token
      let decodedToken;
      try {
        decodedToken = jwtDecode(token); // Correctly decode the token
        console.log("Decoded Token: ", decodedToken);
      } catch (decodeError) {
        console.error("Token decoding failed:", decodeError);
        setErrMsg("Failed to decode token");
        return;
      }

      // Extract userType from the decoded token
      const userType = decodedToken.userType; // Directly access userType from decoded token
      console.log("Extracted userType:", userType);

      if (!userType) {
        setErrMsg("Invalid token: userType missing");
        return;
      }

      dispatch(UserLogin(user, token));
      const lowerCaseUserType = userType.toLowerCase(); // Convert to lowercase for consistency

      // Role-based redirection
      if (lowerCaseUserType === "traveller") {
        navigate("/traveller-home");
      } else if (lowerCaseUserType === "native") {
        navigate("/native-home");
      } else {
        navigate("/pagenotfound"); // Fallback in case no userType is found
      }
    } catch (error) {
      setErrMsg("Invalid email or password");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="bg-bgColor w-full h-screen flex items-center justify-center p-6 relative">
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${LoginBackground})` }}
      ></div>

      {/* The form content */}
      <div
        className={`relative z-10 w-full md:w-2/3 lg:w-1/2 xl:w-1/3 rounded-xl shadow-2xl p-8 bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 transform transition duration-300 ${
          isLoading ? "opacity-20" : "opacity-100"
        } transition-opacity`}
      >
        <div className="flex flex-col items-center">
          <div className="mb-6">
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

            <CustomButton
              type="submit"
              containerStyles="inline-flex justify-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-white"
              title="Login"
              disabled={isLoading}
            />
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

      {/* Full-screen loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default Login;
