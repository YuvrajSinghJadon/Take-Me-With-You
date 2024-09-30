/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}", // Include the entry point for Expo
    "./app/**/*.{js,jsx,ts,tsx}", // Ensure this matches your folder structure
  ],
  theme: {
    extend: {},
  },
  plugins: [], // Use 'nativewind/tailwind' instead of 'nativewind/preset'
};
