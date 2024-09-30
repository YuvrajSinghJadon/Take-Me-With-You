import React from "react";
import { FaCheckCircle } from "react-icons/fa"; // For the success checkmark
import Lottie from "react-lottie"; // Optional: For confetti animation
import confettiAnimationData from "../assets/lottie/confetti.json"; // Optional: Path to your confetti animation
import { Link } from "react-router-dom";
const VerificationSuccess = () => {
  // Optional: Config for Lottie animation
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: confettiAnimationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      {/* Optional: Confetti Animation */}
      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
        <Lottie options={defaultOptions} height={400} width={400} />
      </div>

      {/* Success Icon */}
      <FaCheckCircle className="text-green-500 text-6xl mb-4 animate-bounce" />

      {/* Success Message */}
      <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
        Email Verified!
      </h1>
      <h3 className="text-xl text-gray-600 text-center mb-6">
        Your email has been successfully verified and your account is now
        active.
      </h3>

      {/* Confirmation Text */}
      <p className="text-base text-gray-500 text-center mb-8 max-w-md">
        Thank you for confirming your email. You can now explore your dashboard
        and start using all the features of your account.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col items-center space-y-4">
        {/* Primary CTA: Go to Dashboard */}
        <Link to="/login">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium shadow-md transition duration-300 ease-in-out">
            Login Here
          </button>
        </Link>

        {/* Optional Secondary CTA: Return to Home */}
        <Link to="/">
          <button className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg text-sm transition duration-300 ease-in-out mt-4">
            Return to Home
          </button>
        </Link>
      </div>
    </div>
  );
};

export default VerificationSuccess;
