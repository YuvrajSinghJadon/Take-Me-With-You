import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import TextInput from "./TextInput";
import CustomButton from "./CustomButton";
import { useForm } from "react-hook-form";
import { BsMoon, BsSunFill } from "react-icons/bs";
import { IoMdNotificationsOutline } from "react-icons/io";
import { SetTheme } from "../redux/theme";
import { Logout } from "../redux/userSlice";
import Logo1 from "../assets/Logo1.png"; // Import the logo image

const TopBar = () => {
  const { theme } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.user);
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
    // Implement search logic here
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
    </div>
  );
};

export default TopBar;
