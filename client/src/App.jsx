import { Outlet, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  TravellerHome,
  Login,
  Profile,
  Register,
  ResetPassword,
  PostDetails,
  VerificationSuccess,
  SetNewPassword,
  NativeHome,
  Unauthorized,
} from "./pages"; // Import the page components
import Hero from "./pages/Hero";
import ProtectedRoute from "./utils/ProtectedRoutes.jsx"; // Import ProtectedRoute

// Layout Component that checks for user authentication
function Layout() {
  const { token } = useSelector((state) => state.user); // Only check for token in Layout
  const location = useLocation(); // For redirecting back to the page user was trying to access

  // Check if token exists and return the outlet or redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />; // If token exists, render the child routes
}

// Main App Component
function App() {
  const { theme } = useSelector((state) => state.theme); // Get theme from Redux state

  return (
    <div data-theme={theme} className="w-full min-h-[100vh]">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Hero />} /> {/* Hero page */}
        <Route path="/verification-success" element={<VerificationSuccess />} />
        <Route
          path="/reset-password/:userId/:token"
          element={<SetNewPassword />}
        />
        <Route path="/register" element={<Register />} /> {/* Register page */}
        <Route path="/login" element={<Login />} /> {/* Login page */}
        <Route path="*" element={<Unauthorized />} />{" "}
        {/* 404 for undefined routes */}
        {/* Protected Routes */}
        <Route element={<Layout />}>
          <Route
            path="/traveller-home"
            element={
              <ProtectedRoute allowedRoles={["traveller"]}>
                <TravellerHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/native-home"
            element={
              <ProtectedRoute allowedRoles={["native"]}>
                <NativeHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id?"
            element={
              <ProtectedRoute allowedRoles={["traveller", "native"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/posts/:id"
            element={
              <ProtectedRoute allowedRoles={["traveller", "native"]}>
                <PostDetails />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
