import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextInput from "./TextInput";
import CustomButton from "./CustomButton";
import { useForm } from "react-hook-form";
import { BsMoon, BsSunFill } from "react-icons/bs";
import { IoMdNotificationsOutline } from "react-icons/io";
import { SetTheme } from "../redux/theme";
import { Logout } from "../redux/userSlice";
import Logo1 from "../assets/Logo1.png"; // Import the logo image
import axios from "axios";
import { TbGripHorizontal } from "react-icons/tb"; // Import the collapsing icon
import { CiLogout } from "react-icons/ci";

const TopBar = () => {
  const { theme } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.user);
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [menuOpen, setMenuOpen] = useState(false); // State to toggle collapsed menu
  const dispatch = useDispatch();
  const searchResultsRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Fix the theme toggle logic
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
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target)
      ) {
        setSearchResults({ users: [], posts: [] }); // Clear search results
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchResultsRef]);

  return (
    <>
      <div className="topbar font-headline w-full flex items-center justify-between py-2 px-4 bg-primary-light dark:bg-primary-dark shadow-md">
        {/* Logo Section */}
        <Link to="/" className="flex gap-4 items-center">
          <div className="p-1 md:p-2">
            <img src={Logo1} alt="Logo1" className="h-10 w-10" />
          </div>
          <span className="text-xl md:text-2xl text-primaryRed font-semibold">
            Take Me With You
          </span>
        </Link>

        {/* Search Bar */}
        <form
          className="hidden md:flex items-center justify-center flex-grow mx-6"
          onSubmit={handleSubmit(handleSearch)}
        >
          <div className="flex items-center">
            <TextInput
              placeholder="Search..."
              styles="w-[18rem] lg:w-[38rem] rounded-l-full py-3 border-none"
              register={register("search")}
            />
            <CustomButton
              title="Search"
              type="submit"
              size="md" // Specify size (sm, md, lg) as per our new props
              backgroundColor="bg-blue-600" // Custom background color using Tailwind class
              textColor="text-white" // Custom text color using Tailwind class
              containerStyles="px-6 py-3 rounded-r-full"
            />
          </div>
        </form>

        {/* Icons for small screens */}
        <div className="flex items-center lg:hidden gap-4">
          {/* Notification icon - Small screen */}
          <IoMdNotificationsOutline
            size={24}
            className="text-white"
            aria-label="Notifications"
          />
          {/* Hamburger Icon for small screens */}
          <button
            className="p-3 bg-blue-500 text-white border-2 border-black rounded-full shadow-lg"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
          >
            <TbGripHorizontal size={24} />
          </button>
        </div>

        {/* Full Menu for larger screens */}
        <div className="hidden lg:flex items-center gap-6">
          {/* Theme Toggle */}
          <button
            onClick={handleTheme}
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
          >
            {theme === "light" ? <BsMoon size={24} /> : <BsSunFill size={24} />}
          </button>

          {/* Notification icon - Large screen */}
          <IoMdNotificationsOutline
            size={24}
            aria-label="Notifications"
            className="text-primaryRed"
          />

          {/* Logout button */}
          <CustomButton
            onClick={() => dispatch(Logout())}
            title="Log Out"
            size="md" // Using small size for the log out button
            textColor="text-primaryRed" // Keeping white text color
            backgroundColor="bg-transparent" // Transparent background since it's bordered
            containerStyles="border rounded-full " // Retained border and rounded styles
            hoverBackgroundColor="hover:bg-yellow-400"
          />
        </div>

        {/* Sliding Menu for smaller screens */}
        {menuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
            <div className="absolute top-16 right-4 w-52 bg-white dark:bg-gray-800 shadow-lg rounded-lg flex flex-col z-60 p-4">
              <button
                className="text-right text-xl text-gray-900 dark:text-gray-200"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                &times;
              </button>

              {/* Menu Content */}
              <div className="flex flex-col gap-4 mt-2">
                {/* Theme Toggle */}
                <div className="flex items-center gap-3 text-gray-900 dark:text-gray-200">
                  <button onClick={handleTheme} aria-label="Toggle Theme">
                    {theme === "light" ? (
                      <BsMoon size={24} />
                    ) : (
                      <BsSunFill size={24} />
                    )}
                  </button>
                  <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                </div>

                {/* Logout */}
                <div
                  onClick={() => dispatch(Logout())}
                  className="flex items-center gap-3 text-gray-900 dark:text-gray-200"
                >
                  <CiLogout size={24} aria-label="Logout" />
                  <span>Log Out</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.users.length > 0 || searchResults.posts.length > 0 ? (
        <div
          ref={searchResultsRef} // Add the ref here
          className="absolute top-12 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-50"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
            Search Results:
          </h3>

          <div className="flex flex-col gap-4 mt-4">
            {/* Display Users */}
            {searchResults.users.length > 0 && (
              <div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-200">
                  Users
                </h4>
                {searchResults.users.map((user) => (
                  <Link
                    key={user._id}
                    to={`/profile/${user._id}`}
                    className="block py-2 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    {user.firstName} {user.lastName}
                  </Link>
                ))}
              </div>
            )}

            {/* Display Posts */}
            {searchResults.posts.length > 0 && (
              <div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-200">
                  Posts
                </h4>
                {searchResults.posts.map((post) => (
                  <div
                    key={post._id}
                    className="py-2 border-b border-gray-200 dark:border-gray-600"
                  >
                    <p className="text-gray-700 dark:text-gray-300">
                      {post.description}
                    </p>
                    <Link
                      to={`/profile/${post.userId._id}`}
                      className="text-sm text-blue-500 dark:text-blue-400"
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
    </>
  );
};

export default TopBar;
