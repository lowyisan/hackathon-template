import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import RequestsReceivedPage from "./pages/RequestsReceivedPage.jsx";

/**
 * Checks if the user is currently authenticated.
 * Returns true if an access token exists in local storage.
 */
function isLoggedIn() {
  return Boolean(localStorage.getItem("access_token"));
}

/**
 * A wrapper for routes that requires authentication.
 * Redirects to /login if the user is not authenticated.
 */
function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/**
 * Main Application Component.
 * 
 * Defines the routing structure:
 * - /login: Public login page
 * - /register: Public registration page
 * - /: Dashboard (Protected)
 * - /requests-received: Inbox (Protected)
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <LandingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests-received"
        element={
          <ProtectedRoute>
            <RequestsReceivedPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
