import { createSlice } from "@reduxjs/toolkit";

// Function to safely get the user from localStorage (browser-only)
const getInitialUser = () => {
  if (typeof window !== "undefined") {
    return JSON.parse(window.localStorage.getItem("user")) ?? null;
  }
  return null;
};

// Function to safely get the token from localStorage (browser-only)
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") ?? null;
  }
  return null;
};

const initialState = {
  user: getInitialUser(), // Retrieve user from localStorage
  token: getToken(), // Retrieve token from localStorage
  edit: false, // This controls the UI for editing
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login(state, action) {
      // Store both the user and token in the state
      state.user = action.payload.user;
      state.token = action.payload.token;

      // Persist user and token in localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "user",
          JSON.stringify(action.payload.user)
        );
        window.localStorage.setItem("token", action.payload.token);
      }
    },
    logout(state) {
      // Clear user and token from the state
      state.user = null;
      state.token = null;

      // Remove user and token from localStorage
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("user");
        window.localStorage.removeItem("token");
      }
    },
    // This handles the UI state for showing/hiding the edit form
    setEditState(state, action) {
      state.edit = action.payload;
    },
    // This updates the actual user profile data
    updateProfile(state, action) {
      // Update the user profile in the state
      state.user = { ...state.user, ...action.payload };

      // Persist the updated user in localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
});

// Export reducer
export default userSlice.reducer;

// Export actions
export const { login, logout, updateProfile, setEditState } = userSlice.actions;

// Simplified action creators
export const UserLogin = (user, token) => (dispatch) => {
  // Dispatch login with both user and token
  dispatch(login({ user, token }));
};

export const Logout = () => (dispatch) => {
  dispatch(logout());

  // After dispatching logout, clear the browser history and navigate to the homepage
  if (typeof window !== "undefined") {
    window.location.href = "/"; // Navigate to the homepage after logging out
  }
};

// UpdateProfile action creator to update the actual user profile data
export const UpdateProfile = (updatedUserData) => (dispatch) => {
  // Dispatch the updated user data
  dispatch(updateProfile(updatedUserData));
};

// SetEditState action creator to control the edit modal visibility
export const SetEditState = (editState) => (dispatch) => {
  dispatch(setEditState(editState));
};
