
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  RefreshCw,
  LogOut,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";

const statusColors = {
  Submitted: "#2563eb",
  "Under Review": "#d97706",
  "In Progress": "#7c3aed",
  Resolved: "#16a34a",
  Reopened: "#dc2626",
};

// Safely convert backend errors into readable messages
const getErrorMessage = (err, fallback) => {
  const detail = err.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const location = Array.isArray(item.loc)
          ? item.loc.slice(1).join(".")
          : "";

        return location
          ? `${location}: ${item.msg}`
          : item.msg;
      })
      .join(", ");
  }

  return fallback;
};

export default function OfficerDashboard() {
  const navigate = useNavigate();

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch assigned grievances
  const fetchGrievances = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/officer/grievances");

      const data = response.data.grievances || [];

      setGrievances(
        data.map((g) => ({
          ...g,
          id: g.grievance_id ?? g.id,
        }))
      );

    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load assigned grievances."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  // Open status update modal
  const openUpdate = (grievance) => {
    if (!grievance.id) {
      setError("Grievance ID is missing. Please refresh the dashboard.");
      return;
    }

    setSelectedGrievance(grievance);
    setNewStatus("");
    setRemarks("");
    setError("");
    setMessage("");
  };

  // Update grievance status
  const updateStatus = async (e) => {
    e.preventDefault();

    if (!selectedGrievance?.id) {
      setError("Invalid grievance ID. Please refresh the dashboard.");
      return;
    }

    if (!newStatus || remarks.trim().length < 3) {
      setError(
        "Select a status and enter remarks (at least 3 characters)."
      );
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await api.patch(
        `/officer/grievances/${selectedGrievance.id}/status`,
        {
          status: newStatus,
          remarks: remarks.trim(),
        }
      );

      const successMessage =
        response.data.message ||
        "Grievance status updated successfully.";

      setSelectedGrievance(null);
      setNewStatus("");
      setRemarks("");

      setMessage(successMessage);

      await fetchGrievances();

      // Keep success message visible after refreshing
      setMessage(successMessage);

    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to update grievance status."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Dashboard statistics
  const counts = {
    total: grievances.length,
    submitted: grievances.filter(
      (g) => g.status === "Submitted"
    ).length,
    inProgress: grievances.filter(
      (g) => ["Under Review", "In Progress"].includes(g.status)
    ).length,
    resolved: grievances.filter(
      (g) => g.status === "Resolved"
    ).length,
  };

  const statCards = [
    {
      title: "Assigned Grievances",
      value: counts.total,
      icon: <ClipboardList size={24} />,
      color: "#2563eb",
    },
    {
      title: "Submitted",
      value: counts.submitted,
      icon: <Clock size={24} />,
      color: "#d97706",
    },
    {
      title: "In Progress",
      value: counts.inProgress,
      icon: <RefreshCw size={24} />,
      color: "#7c3aed",
    },
    {
      title: "Resolved",
      value: counts.resolved,
      icon: <CheckCircle size={24} />,
      color: "#16a34a",
    },
  ];

  return (
    <div className="page-container">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "25px",
        }}>
          <div>
            <h1 style={{ margin: 0 }}>
              Officer Dashboard
            </h1>

            <p style={{
              color: "#64748b",
              marginTop: "6px",
            }}>
              Manage and resolve your assigned grievances
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={logout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#475569",
            }}
          >
            <LogOut size={17} />
            Logout
          </button>
        </header>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {/* Dashboard content */}
        {loading ? (
          <div className="card">
            Loading assigned grievances...
          </div>
        ) : (
          <>

            {/* Statistics */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "25px",
            }}>
              {statCards.map((stat) => (
                <div className="card" key={stat.title}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <span style={{
                      color: "#64748b",
                      fontSize: "14px",
                    }}>
                      {stat.title}
                    </span>

                    <span style={{ color: stat.color }}>
                      {stat.icon}
                    </span>
                  </div>

                  <h2 style={{
                    fontSize: "30px",
                    marginTop: "12px",
                  }}>
                    {stat.value}
                  </h2>
                </div>
              ))}
            </div>

            {/* Assigned grievances */}
            <div className="card">
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "20px",
              }}>
                <h2 style={{ margin: 0 }}>
                  My Assigned Grievances
                </h2>

                <button
                  className="primary-btn"
                  onClick={fetchGrievances}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              {grievances.length === 0 ? (
                <p style={{ color: "#64748b" }}>
                  No grievances have been assigned to you yet.
                </p>
              ) : (
                <div style={{
                  display: "grid",
                  gap: "16px",
                }}>
                  {grievances.map((g) => (
                    <div
                      key={g.id}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "18px",
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}>
                        <div>
                          <strong>{g.subject}</strong>

                          <p style={{
                            color: "#64748b",
                            fontSize: "13px",
                            marginTop: "6px",
                          }}>
                            Reference: {g.reference_number}
                          </p>
                        </div>

                        <span style={{
                          background: `${statusColors[g.status] || "#64748b"}18`,
                          color: statusColors[g.status] || "#64748b",
                          padding: "7px 12px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}>
                          {g.status}
                        </span>
                      </div>

                      <p style={{
                        margin: "12px 0",
                        lineHeight: 1.6,
                      }}>
                        {g.description}
                      </p>

                      <div style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "18px",
                        color: "#64748b",
                        fontSize: "13px",
                        marginBottom: "15px",
                      }}>
                        <span>District: {g.district}</span>
                        <span>Category: {g.category}</span>
                        <span>Priority: {g.priority}</span>
                      </div>

                      <button
                        className="primary-btn"
                        onClick={() => openUpdate(g)}
                      >
                        Update Status
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <p style={{
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "12px",
          marginTop: "25px",
        }}>
          Demonstration prototype. Not an official Government of Kerala website.
        </p>

        {/* Status update modal */}
        {selectedGrievance && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            zIndex: 1000,
          }}>
            <div className="card" style={{
              width: "100%",
              maxWidth: "500px",
            }}>
              <h2 style={{ marginTop: 0 }}>
                Update Grievance Status
              </h2>

              <p style={{
                color: "#64748b",
                marginBottom: "20px",
              }}>
                {selectedGrievance.reference_number}
              </p>

              <form onSubmit={updateStatus}>
                <div className="form-group">
                  <label>New Status *</label>

                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                  >
                    <option value="">Select status</option>
                    <option value="Under Review">Under Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Reopened">Reopened</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Remarks *</label>

                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={4}
                    minLength={3}
                    maxLength={1000}
                    placeholder="Explain the action taken or reason for this update..."
                    required
                  />
                </div>

                <div style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}>
                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={saving}
                  >
                    {saving ? "Updating..." : "Save Update"}
                  </button>

                  <button
                    type="button"
                    className="primary-btn"
                    style={{ background: "#64748b" }}
                    onClick={() => setSelectedGrievance(null)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
