import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducer"; // Assuming you have it as the default export

const store = configureStore({
  reducer: rootReducer,
});

// No need to export dispatch separately, as you can directly use `store.dispatch`
export { store };
