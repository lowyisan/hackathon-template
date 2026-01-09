import { useState } from "react";
import { api } from "../api/client";
import { Button } from "../components/Button";

/**
 * Authentication Page.
 * 
 * Allows users to log in with a username and password.
 * On success, stores the JWT access token in localStorage and redirects to the dashboard.
 */
export default function LoginPage() {
  // State for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // State for error display
  const [error, setError] = useState("");

  const login = async () => {
    try {
      // Send credentials to backend
      const res = await api.post("/auth/login", { email, password });
      
      // Save the received JWT token to localStorage.
      // The API client interceptor will automatically attach this to future requests.
      localStorage.setItem("access_token", res.data.access_token);
      
      // Redirect to the home page (Dashboard)
      window.location.href = "/";
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-80 space-y-4">
        <h1 className="text-xl font-bold">Login</h1>

        <input
          className="w-full p-2 rounded bg-surface border border-border"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-2 rounded bg-surface border border-border"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-danger">{error}</p>}

        <Button onClick={login} className="w-full">
          Login
        </Button>
        
        <p className="text-center text-sm">
          Don't have an account? <a href="/register" className="text-primary hover:underline">Register</a>
        </p>
      </div>
    </div>
  );
}
