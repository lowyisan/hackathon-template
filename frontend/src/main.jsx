import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

/**
 * Application Entry Point.
 * 
 * Mounts the React application into the DOM.
 * Wraps the App component with:
 * - React.StrictMode: For development checks.
 * - BrowserRouter: To enable client-side routing.
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
