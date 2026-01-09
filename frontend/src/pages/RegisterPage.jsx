import { useState } from "react";
import { api } from "../api/client";
import { Button } from "../components/Button";

/**
 * Registration Page.
 * 
 * Allows new users to sign up by providing:
 * - Email
 * - Password
 * - Company Name
 * 
 * On success, creates the user and company, logs them in (via token), 
 * and redirects to the dashboard.
 */
export default function RegisterPage() {
  // State for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  // State for error handling
  const [error, setError] = useState("");

  const register = async () => {
    try {
      // Post registration data to backend
      const res = await api.post("/auth/register", { 
        email, 
        password, 
        companyName 
      });
      // Store the token immediately so the user is logged in
      localStorage.setItem("access_token", res.data.access_token);
      // Redirect to dashboard
      window.location.href = "/";
    } catch (err) {
      // Display error message from backend (e.g., "Email taken")
      setError(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-80 space-y-4">
        <h1 className="text-xl font-bold">Register Company</h1>

        {/* Email Input */}
        <input
          className="w-full p-2 rounded bg-surface border border-border"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password Input with Hint */}
        <div className="space-y-1">
            <input
            type="password"
            className="w-full p-2 rounded bg-surface border border-border"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-muted">Min 8 chars, 1 letter, 1 number</p>
        </div>

        {/* Company Name Input */}
        <input
          className="w-full p-2 rounded bg-surface border border-border"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />

        {error && <p className="text-danger">{error}</p>}

        <Button onClick={register} className="w-full">
          Register
        </Button>
        
        <p className="text-center text-sm">
          Already have an account? <a href="/login" className="text-primary hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
}
