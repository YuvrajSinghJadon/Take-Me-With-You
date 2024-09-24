import { combineReducers } from "@reduxjs/toolkit";

import userSlice from "./userSlice";
import themeSlice from "./theme";
import postSlice from "./postSlice";
import loaderSlice from "./loaderSlice"; // Import loaderSlice

const rootReducer = combineReducers({
  user: userSlice,
  theme: themeSlice,
  posts: postSlice,
  loader: loaderSlice,
});

export default rootReducer;
