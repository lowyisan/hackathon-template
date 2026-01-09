import axios from "axios";

export const api = axios.create({
  baseURL: "/api", // api base for backend
});

// Request Interceptor
// Automatically attaches the JWT 'access_token' from local storage to every outgoing request.
// This ensures that all API calls are authenticated as the currently logged-in user.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
