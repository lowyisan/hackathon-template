import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

/**
 * Incoming Requests Page (The "Inbox").
 * 
 * Displays trade requests that other companies have sent to the current user.
 * Highlights "Overdue" requests (older than 7 days).
 * Allows the user to ACCEPT or REJECT these requests.
 */
export default function RequestsReceivedPage() {
  // State for the list of incoming requests
  const [requests, setRequests] = useState([]);
  // State for storing IDs of overdue requests to highlight them
  const [overdueIds, setOverdueIds] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    // 1. Get all pending requests targeting my company
    api.get("/me/requests-received").then((res) => setRequests(res.data));
    // 2. Get the list of overdue request IDs
    api.get("/me/alerts").then((res) => setOverdueIds(res.data));
  }, []);

  // Handle the decision (Accept/Reject)
  const decide = async (id, decision) => {
    try {
      // Send the decision to the backend
      await api.post(`/me/requests-received/${id}/decision`, { decision });
      // Remove the processed request from the local list
      setRequests((r) => r.filter((x) => x.id !== id));
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to process request");
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Requests Received</h1>

      {requests.length === 0 && (
          <p className="text-muted">No requests received.</p>
      )}

      {requests.map((r) => {
        // Check if this specific request is in the overdue list
        const isOverdue = overdueIds.includes(r.id);
        
        return (
            <Card key={r.id} className={isOverdue ? 'border-danger border-2' : ''}>
            {/* Show Warning if overdue */}
            {isOverdue && (
                <p className="text-danger font-bold mb-2">⚠️ OVERDUE</p>
            )}
            <div className="grid grid-cols-2 gap-2">
                <p><b>Source ID:</b> {r.requestorCompanyId}</p>
                <p><b>Type:</b> {r.requestType}</p>
                <p><b>Qty:</b> {r.carbonQuantity}</p>
                <p><b>Price:</b> {r.carbonUnitPrice}</p>
                <p><b>Date:</b> {new Date(r.requestDate).toLocaleString()}</p>
            </div>
            <p className="mt-2"><b>Reason:</b> {r.requestReason}</p>
            
            <div className="flex gap-2 mt-4">
                {/* Action Buttons */}
                <Button onClick={() => decide(r.id, "ACCEPT")}>Accept</Button>
                <Button className="bg-danger" onClick={() => decide(r.id, "REJECT")}>
                Reject
                </Button>
            </div>
            </Card>
        );
      })}
       
       {/* Navigation back to dashboard */}
       <Button className="mt-4" onClick={() => (window.location.href = "/")}>
        Back to Dashboard
      </Button>
    </div>
  );
}