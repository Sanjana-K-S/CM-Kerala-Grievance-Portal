
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Building2,
  AlertCircle,
  User,
  FileText,
} from "lucide-react";
import api from "../services/api";

const statusColors = {
  Submitted: "#2563eb",
  "Under Review": "#d97706",
  "In Progress": "#7c3aed",
  Resolved: "#16a34a",
  Reopened: "#dc2626",
};

export default function TrackGrievance() {
  const { reference } = useParams();

  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGrievance = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(
          `/grievances/track/${encodeURIComponent(reference)}`
        );

        // Backend returns the data inside response.data.grievance
        const data = response.data.grievance;

        if (!data) {
          throw new Error("Grievance information is missing.");
        }

        setGrievance(data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
          err.message ||
          "Unable to retrieve grievance details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGrievance();
  }, [reference]);

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card">Loading grievance details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="card">
          <h2>Unable to Track Grievance</h2>
          <p className="error-message">{error}</p>
          <Link to="/citizen">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (!grievance) return null;

  const statusColor =
    statusColors[grievance.status] || "#64748b";

  const history = grievance.history || [];

  return (
    <div className="page-container">
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        <Link
          to="/citizen"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#334155",
            marginBottom: "20px",
          }}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="card">

          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
          }}>
            <div>
              <h2 style={{ margin: 0 }}>Grievance Tracking</h2>

              <p style={{
                color: "#64748b",
                marginTop: "8px",
              }}>
                Reference: {grievance.reference_number}
              </p>
            </div>

            <span style={{
              background: `${statusColor}18`,
              color: statusColor,
              padding: "9px 16px",
              borderRadius: "20px",
              fontWeight: 600,
            }}>
              {grievance.status}
            </span>
          </div>

          <hr style={{
            border: 0,
            borderTop: "1px solid #e2e8f0",
            margin: "22px 0",
          }} />

          {/* Grievance details */}
          <h3 style={{ marginBottom: "20px" }}>
            <FileText
              size={20}
              style={{
                verticalAlign: "middle",
                marginRight: "8px",
              }}
            />
            Grievance Details
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "22px",
          }}>
            <div>
              <p style={{ color: "#64748b", marginBottom: "5px" }}>
                Subject
              </p>
              <strong>{grievance.subject}</strong>
            </div>

            <div>
              <p style={{ color: "#64748b", marginBottom: "5px" }}>
                District
              </p>
              <strong>{grievance.district}</strong>
            </div>

            <div>
              <p style={{ color: "#64748b", marginBottom: "5px" }}>
                Category
              </p>
              <strong>{grievance.category}</strong>
            </div>

            <div>
              <p style={{ color: "#64748b", marginBottom: "5px" }}>
                Priority
              </p>
              <strong>{grievance.priority}</strong>
            </div>

            <div>
              <p style={{ color: "#64748b", marginBottom: "5px" }}>
                Submitted On
              </p>
              <strong>{formatDate(grievance.created_at)}</strong>
            </div>

            <div>
              <p style={{ color: "#64748b", marginBottom: "5px" }}>
                Last Updated
              </p>
              <strong>{formatDate(grievance.updated_at)}</strong>
            </div>
          </div>

          <div style={{ marginTop: "25px" }}>
            <p style={{ color: "#64748b", marginBottom: "8px" }}>
              Description
            </p>

            <p style={{
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}>
              {grievance.description}
            </p>
          </div>

          <hr style={{
            border: 0,
            borderTop: "1px solid #e2e8f0",
            margin: "25px 0",
          }} />

          {/* Department assignment */}
          <h3 style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
          }}>
            <Building2 size={21} />
            Department Assignment
          </h3>

          {grievance.assigned_department ? (
            <div style={{
              background: "#f0f7ff",
              padding: "18px",
              borderRadius: "10px",
              marginTop: "15px",
            }}>
              <strong>
                {grievance.assigned_department}
              </strong>

              <p style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                margin: "10px 0 0",
                color: "#64748b",
              }}>
                <User size={16} />
                Assigned Officer:{" "}
                {grievance.assigned_officer || "Not specified"}
              </p>
            </div>
          ) : (
            <p style={{
              color: "#64748b",
              marginTop: "12px",
            }}>
              This grievance has not yet been assigned to a department.
            </p>
          )}

          <hr style={{
            border: 0,
            borderTop: "1px solid #e2e8f0",
            margin: "25px 0",
          }} />

          {/* Status history */}
          <h3 style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
          }}>
            <Clock size={21} />
            Status History
          </h3>

          {history.length > 0 ? (
            <div style={{ marginTop: "22px" }}>
              {history.map((item, index) => {
                const itemColor =
                  statusColors[item.new_status] || "#64748b";

                return (
                  <div
                    key={item.id || index}
                    style={{
                      display: "flex",
                      gap: "15px",
                      marginBottom: "25px",
                    }}
                  >
                    <div style={{ color: itemColor }}>
                      {item.new_status === "Resolved" ? (
                        <CheckCircle size={22} />
                      ) : (
                        <AlertCircle size={22} />
                      )}
                    </div>

                    <div>
                      <strong style={{ color: itemColor }}>
                        {item.new_status}
                      </strong>

                      {item.remarks && (
                        <p style={{
                          margin: "7px 0",
                          lineHeight: 1.6,
                        }}>
                          {item.remarks}
                        </p>
                      )}

                      <p style={{
                        color: "#64748b",
                        fontSize: "13px",
                        margin: "5px 0",
                      }}>
                        Updated by: {item.updated_by || "System"}
                      </p>

                      <small style={{ color: "#94a3b8" }}>
                        {formatDate(item.updated_at)}
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{
              color: "#64748b",
              marginTop: "12px",
            }}>
              No status updates have been recorded yet. Your submission is registered.
            </p>
          )}

        </div>

        <p style={{
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "12px",
          marginTop: "20px",
        }}>
          Demonstration prototype. Not an official Government of Kerala website.
        </p>

      </div>
    </div>
  );
}
