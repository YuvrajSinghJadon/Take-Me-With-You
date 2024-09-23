import { Outlet, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Home,
  Login,
  Profile,
  Register,
  ResetPassword,
  PostDetails,
} from "./pages"; // Import the page components

// Layout Component that checks for user authentication
function Layout() {
  const { token } = useSelector((state) => state.user); // Get token directly from Redux state
  const location = useLocation(); // For redirecting back to the page user was trying to access

  // Check if token exists
  return token ? (
    <Outlet /> // If token exists, allow access to the protected routes
  ) : (
    <Navigate to="/login" state={{ from: location }} replace /> // Redirect to login if not authenticated
  );
}

// Main App Component
function App() {
  const { theme } = useSelector((state) => state.theme); // Get theme from Redux state

  return (
    <div data-theme={theme} className="w-full min-h-[100vh]">
      <Routes>
        {/* Protected Routes: Only accessible when authenticated */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} /> {/* Home page */}
          <Route path="/profile/:id?" element={<Profile />} />{" "}
          {/* Profile page */}
          <Route path="/posts/:id" element={<PostDetails />} />
        </Route>
        {/* Public Routes: Accessible without authentication */}
        <Route path="/register" element={<Register />} /> {/* Register page */}
        <Route path="/login" element={<Login />} /> {/* Login page */}
        <Route path="/reset-password" element={<ResetPassword />} />{" "}
        {/* Reset Password page */}
      </Routes>
    </div>
  );
}

export default App;
