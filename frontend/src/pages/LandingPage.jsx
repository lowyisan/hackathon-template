import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

/**
 * Main Dashboard Page.
 * 
 * Responsibilities:
 * 1. Displays the user's company balances (Cash & Carbon).
 * 2. Allows creating and editing "OutstandingRequests" (Trade proposals).
 * 3. Lists the user's active proposals.
 */
export default function LandingPage() {
  // State for storing company financial data
  const [balances, setBalances] = useState(null);
  // State for storing the list of trade requests created by this user
  const [requests, setRequests] = useState([]);
  // State for UI error messages
  const [error, setError] = useState("");
  // State to track if we are currently editing an existing request (stores the ID)
  const [editingId, setEditingId] = useState(null);

  // Form state for creating or editing a request
  const [form, setForm] = useState({
    targetCompanyId: "",
    requestType: "BUY",
    carbonUnitPrice: "",
    carbonQuantity: "",
    requestReason: "",
  });

  // Fetch initial data when the component mounts
  useEffect(() => {
    // 1. Get Carbon and Cash balances
    api.get("/me/balances").then((res) => setBalances(res.data));
    // 2. Get the list of requests I've created
    api.get("/me/requests").then((res) => setRequests(res.data));
  }, []);

  // Handle text input changes for the form
  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Populate the form with data from an existing request to edit it
  const startEdit = (request) => {
    setEditingId(request.id);
    setForm({
      targetCompanyId: request.targetCompanyId,
      requestType: request.requestType,
      carbonUnitPrice: request.carbonUnitPrice,
      carbonQuantity: request.carbonQuantity,
      requestReason: request.requestReason,
    });
  };

  // Clear the form and exit "Edit Mode"
  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      targetCompanyId: "",
      requestType: "BUY",
      carbonUnitPrice: "",
      carbonQuantity: "",
      requestReason: "",
    });
    setError("");
  };

  // Handle Form Submission (Create or Update)
  const submitForm = async () => {
    setError("");

    // Basic validation
    if (
      !form.targetCompanyId ||
      !form.carbonUnitPrice ||
      !form.carbonQuantity ||
      !form.requestReason
    ) {
      setError("All fields are required");
      return;
    }

    // Prepare payload for API (ensure numbers are numbers)
    const payload = {
      targetCompanyId: Number(form.targetCompanyId),
      requestType: form.requestType,
      carbonUnitPrice: Number(form.carbonUnitPrice),
      carbonQuantity: Number(form.carbonQuantity),
      requestReason: form.requestReason,
    };

    try {
      if (editingId) {
        // UPDATE existing request
        const res = await api.put(`/me/requests/${editingId}`, payload);
        // Update the item in the local list state
        setRequests((prev) =>
          prev.map((r) => (r.id === editingId ? res.data : r))
        );
        cancelEdit(); // Reset form
      } else {
        // CREATE new request
        const res = await api.post("/me/requests", payload);
        // Add new item to the top of the list
        setRequests((prev) => [res.data, ...prev]);
        // Reset form fields
        setForm({
          targetCompanyId: "",
          requestType: "BUY",
          carbonUnitPrice: "",
          carbonQuantity: "",
          requestReason: "",
        });
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to submit request");
    }
  };

  // Delete a request
  const deleteRequest = async (id) => {
    await api.delete(`/me/requests/${id}`);
    // Remove the item from the local list state
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  // Handle Logout
  const logout = () => {
    localStorage.removeItem("access_token"); // Destroy the token
    window.location.href = "/login"; // Redirect to login
  };

  // Show loading state until balances are fetched
  if (!balances) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="p-6 space-y-10 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button className="bg-danger" onClick={logout}>
          Logout
        </Button>
      </div>

      {/* Balances Section */}
      <Card>
        <h2 className="text-lg font-semibold mb-2">Balances</h2>
        <p>Carbon: {balances.carbonBalance}</p>
        <p>Cash: {balances.cashBalance}</p>
      </Card>

      {/* Form Section: Changes title based on whether we are editing */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? "Edit Carbon Credit Request" : "Create Carbon Credit Request"}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <input
            name="targetCompanyId"
            value={form.targetCompanyId}
            onChange={onChange}
            placeholder="Target Company ID (eg. 2)"
            className="p-2 rounded bg-surface border border-border"
          />

          <select
            name="requestType"
            value={form.requestType}
            onChange={onChange}
            className="p-2 rounded bg-surface border border-border"
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>

          <input
            name="carbonUnitPrice"
            value={form.carbonUnitPrice}
            onChange={onChange}
            placeholder="Unit Price"
            className="p-2 rounded bg-surface border border-border"
          />

          <input
            name="carbonQuantity"
            value={form.carbonQuantity}
            onChange={onChange}
            placeholder="Quantity"
            className="p-2 rounded bg-surface border border-border"
          />
        </div>

        <textarea
          name="requestReason"
          value={form.requestReason}
          onChange={onChange}
          placeholder="Reason for request"
          className="mt-3 w-full p-2 rounded bg-surface border border-border"
        />

        {error && <p className="text-danger mt-2">{error}</p>}

        <div className="flex gap-2 mt-4">
            <Button onClick={submitForm}>
            {editingId ? "Update Request" : "Submit Request"}
            </Button>
            {editingId && (
                <Button className="bg-danger" onClick={cancelEdit}>
                    Cancel
                </Button>
            )}
        </div>
      </Card>

      {/* List Section: Displays user's requests */}
      <div>
        <h2 className="text-lg font-semibold mb-3">My Requests</h2>

        {requests.length === 0 && (
          <p className="text-muted">No requests created yet.</p>
        )}

        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id}>
              <div className="grid grid-cols-2 gap-2">
                <p><b>Target:</b> {r.targetCompanyId}</p>
                <p><b>Type:</b> {r.requestType}</p>
                <p><b>Qty:</b> {r.carbonQuantity}</p>
                <p><b>Price:</b> {r.carbonUnitPrice}</p>
                <p><b>Status:</b> {r.status}</p>
                <p><b>Date:</b> {new Date(r.requestDate).toLocaleString()}</p>
              </div>
              <p className="mt-2"><b>Reason:</b> {r.requestReason}</p>

              {/* Only allow Edit/Delete if status is PENDING */}
              {r.status === "PENDING" && (
                <div className="flex gap-2 mt-2">
                    <Button onClick={() => startEdit(r)}>
                        Edit
                    </Button>
                    <Button
                    className="bg-danger"
                    onClick={() => deleteRequest(r.id)}
                    >
                    Delete
                    </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Navigation Link */}
      <Button onClick={() => (window.location.href = "/requests-received")}>
        View Requests Received
      </Button>
    </div>
  );
}