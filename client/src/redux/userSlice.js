import { createSlice } from "@reduxjs/toolkit";
import { user as defaultUser } from "../assets/data";

// Function to safely get the user from localStorage (browser-only)
const getInitialUser = () => {
  if (typeof window !== "undefined") {
    return JSON.parse(window.localStorage.getItem("user")) ?? defaultUser;
  }
  return defaultUser;
};

const initialState = {
  user: getInitialUser(),
  edit: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },
    logout(state) {
      state.user = null;
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("user");
      }
    },
    updateProfile(state, action) {
      state.edit = action.payload;
    },
  },
});

// Export reducer
export default userSlice.reducer;

// Export actions
export const { login, logout, updateProfile } = userSlice.actions;

// Simplified action creators
export const UserLogin = (user) => (dispatch) => {
  dispatch(login(user));
};

export const Logout = () => (dispatch) => {
  dispatch(logout());
};

export const UpdateProfile = (val) => (dispatch) => {
  dispatch(updateProfile(val));
};
