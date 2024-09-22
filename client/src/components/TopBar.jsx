import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { Link } from "react-router-dom";
import TextInput from "./TextInput";
import CustomButton from "./CustomButton";
import { useForm } from "react-hook-form";
import { BsMoon, BsSunFill } from "react-icons/bs";
import { IoMdNotificationsOutline } from "react-icons/io";
import { SetTheme } from "../redux/theme";
import { Logout } from "../redux/userSlice";
import Logo1 from "../assets/Logo1.png"; // Import the logo image
import axios from "axios";

const TopBar = () => {
  const { theme } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.user);
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleTheme = () => {
    const themeValue = theme === "light" ? "dark" : "light";
    dispatch(SetTheme(themeValue));
  };

  const handleSearch = async (data) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/search`,
        {
          params: { q: data.search }, // Send search query as parameter
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Set the results in state
      setSearchResults(response.data);
    } catch (error) {
      console.error("Failed to search:", error);
    }
  };

  return (
    <div className="topbar w-full flex items-center justify-between py-2 px-4 bg-primary">
      {/* Logo Section */}
      <Link to="/" className="flex gap-2 items-center">
        <div className="p-1 md:p-2">
          <img src={Logo1} alt="Logo1" className="h-10 w-10" />{" "}
          {/* Logo Image */}
        </div>
        <span className="text-xl md:text-2xl text-blue font-semibold">
          Take Me With You
        </span>
      </Link>

      {/* Search Bar */}
      <form
        className="hidden md:flex items-center justify-center"
        onSubmit={handleSubmit(handleSearch)}
      >
        <TextInput
          placeholder="Search..."
          styles="w-[18rem] lg:w-[38rem] rounded-l-full py-3 border-none"
          register={register("search")}
        />
        <CustomButton
          title="Search"
          type="submit"
          containerStyles="bg-[#0444a4] text-white px-6 py-3 rounded-r-full"
        />
      </form>

      {/* Icons and Logout */}
      <div className="flex gap-4 items-center text-ascent-1 text-md md:text-xl">
        {/* Theme Toggle */}
        <button
          onClick={() => handleTheme()}
          aria-label={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
        >
          {theme === "light" ? <BsMoon /> : <BsSunFill />}
        </button>

        {/* Notifications (Hidden on smaller screens) */}
        <div className="hidden lg:flex">
          <IoMdNotificationsOutline aria-label="Notifications" />
        </div>

        {/* Logout Button */}
        <div>
          <CustomButton
            onClick={() => dispatch(Logout())}
            title="Log Out"
            containerStyles="text-sm text-white px-4 md:px-6 py-1 md:py-2 border border-[#666] rounded-full"
          />
        </div>
      </div>

      {/* Search Results */}
      {searchResults.users.length > 0 || searchResults.posts.length > 0 ? (
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white shadow-lg rounded-lg p-4 z-50">
          <h3 className="text-lg font-semibold">Search Results:</h3>

          <div className="flex flex-col gap-4 mt-4">
            {/* Display Users */}
            {searchResults.users.length > 0 && (
              <div>
                <h4 className="text-base font-semibold">Users</h4>
                {searchResults.users.map((user) => (
                  <Link
                    key={user._id}
                    to={`/profile/${user._id}`}
                    className="block py-2 border-b border-gray-200"
                  >
                    {user.firstName} {user.lastName}
                  </Link>
                ))}
              </div>
            )}

            {/* Display Posts */}
            {searchResults.posts.length > 0 && (
              <div>
                <h4 className="text-base font-semibold">Posts</h4>
                {searchResults.posts.map((post) => (
                  <div key={post._id} className="py-2 border-b border-gray-200">
                    <p>{post.description}</p>
                    <Link
                      to={`/profile/${post.userId._id}`}
                      className="text-sm text-blue-500"
                    >
                      {post.userId.firstName} {post.userId.lastName}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TopBar;
