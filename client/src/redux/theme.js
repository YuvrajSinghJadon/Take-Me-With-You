import { createSlice } from "@reduxjs/toolkit";

// Check localStorage safely for the theme
const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    return JSON.parse(window.localStorage.getItem("theme")) || "light";
  }
  return "dark"; // Default theme
};

const initialState = {
  theme: getInitialTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("theme", JSON.stringify(action.payload));
      }
    },
  },
});

// Export the reducer
export default themeSlice.reducer;

// Action creator to set theme
export const SetTheme = (value) => (dispatch) => {
  dispatch(themeSlice.actions.setTheme(value));
};
