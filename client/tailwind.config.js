/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primaryRed: "#E43D12",
        secondaryRed: "#D6536D",
        lightPink: "#FFA2B6",
        yellowAccent: "#EFB11D",
        offWhite: "#EBE9E1",
      },
      fontFamily: {
        headline: ["Futura", "Roboto Condensed", "sans-serif"],
        body: ["Roboto", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};
