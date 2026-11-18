
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Send, MessageSquare } from "lucide-react";
import api from "../services/api";

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [responses, setResponses] = useState({});
  const [statuses, setStatuses] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/contact/admin");
      const data = response.data.enquiries || [];

      setEnquiries(data);

      const responseValues = {};
      const statusValues = {};

      data.forEach((item) => {
        responseValues[item.id] = item.admin_response || "";
        statusValues[item.id] = item.status || "Pending";
      });

      setResponses(responseValues);
      setStatuses(statusValues);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load enquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const updateEnquiry = async (id) => {
    try {
      setSavingId(id);
      setError("");
      setSuccess("");

      await api.patch(`/contact/admin/${id}`, {
        status: statuses[id] || "Pending",
        admin_response: responses[id] || null,
      });

      setSuccess(`Enquiry #${id} updated successfully.`);
      await loadEnquiries();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to update enquiry."
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="page-container">
      <div style={styles.header}>
        <div>
          <h1>Contact Enquiries</h1>
          <p>View enquiries and manage admin responses.</p>
        </div>

        <div style={styles.actions}>
          <button className="primary-btn" onClick={loadEnquiries}>
            <RefreshCw size={16} /> Refresh
          </button>
          <Link to="/admin" className="primary-btn">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      {loading ? (
        <div className="card">Loading enquiries...</div>
      ) : enquiries.length === 0 ? (
        <div className="card">No contact enquiries found.</div>
      ) : (
        <>
          <p style={{ marginBottom: 18 }}>
            Total enquiries: <strong>{enquiries.length}</strong>
          </p>

          {enquiries.map((item) => (
            <div className="card" key={item.id} style={styles.card}>
              <div style={styles.top}>
                <div>
                  <h3>{item.subject || "General Enquiry"}</h3>
                  <p style={styles.muted}>Enquiry #{item.id}</p>
                </div>

                <span style={styles.badge}>
                  {statuses[item.id] || item.status}
                </span>
              </div>

              <p><strong>Name:</strong> {item.name}</p>
              <p><strong>Email:</strong> {item.email}</p>
              <p>
                <strong>Submitted:</strong>{" "}
                {item.created_at
                  ? new Date(item.created_at).toLocaleString()
                  : "N/A"}
              </p>

              <div style={styles.message}>
                <strong>Citizen Message</strong>
                <p>{item.message}</p>
              </div>

              <div style={styles.formGroup}>
                <label htmlFor={`status-${item.id}`}>
                  Enquiry Status
                </label>
                <select
                  id={`status-${item.id}`}
                  value={statuses[item.id] || "Pending"}
                  onChange={(e) =>
                    setStatuses((prev) => ({
                      ...prev,
                      [item.id]: e.target.value,
                    }))
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Responded">Responded</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label htmlFor={`response-${item.id}`}>
                  <MessageSquare size={15} /> Admin Response
                </label>
                <textarea
                  id={`response-${item.id}`}
                  rows="4"
                  maxLength={5000}
                  placeholder="Write a response to this enquiry..."
                  value={responses[item.id] || ""}
                  onChange={(e) =>
                    setResponses((prev) => ({
                      ...prev,
                      [item.id]: e.target.value,
                    }))
                  }
                />
              </div>

              <button
                className="primary-btn"
                onClick={() => updateEnquiry(item.id)}
                disabled={savingId === item.id}
              >
                <Send size={16} />
                {savingId === item.id ? "Saving..." : "Save Response"}
              </button>

              {item.responded_at && (
                <p style={styles.muted}>
                  Responded: {new Date(item.responded_at).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </>
      )}

      <p style={styles.footer}>
        Demonstration prototype. Not an official Government of Kerala website.
      </p>
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  card: {
    marginBottom: 20,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  muted: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 5,
  },
  badge: {
    background: "#e0f2fe",
    color: "#075985",
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
  },
  message: {
    background: "#f8fafc",
    padding: 16,
    borderRadius: 8,
    lineHeight: 1.6,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  footer: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 12,
    marginTop: 30,
  },
};
