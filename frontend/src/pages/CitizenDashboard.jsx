
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Upload,
  Paperclip,
  Star,
} from "lucide-react";

import api from "../services/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export default function CitizenDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [grievances, setGrievances] = useState([]);
  const [attachments, setAttachments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState({});
  const [uploadMessages, setUploadMessages] = useState({});

  // Feedback states
  const [feedbackByGrievance, setFeedbackByGrievance] = useState({});
  const [feedbackForms, setFeedbackForms] = useState({});
  const [feedbackSubmitting, setFeedbackSubmitting] = useState({});
  const [feedbackMessages, setFeedbackMessages] = useState({});

  // Fetch attachments
  const fetchAttachments = async (grievanceId) => {
    try {
      const response = await api.get(`/attachments/${grievanceId}`);

      setAttachments((previous) => ({
        ...previous,
        [grievanceId]: response.data.attachments || [],
      }));
    } catch (err) {
      console.error(
        `Unable to load attachments for grievance ${grievanceId}`,
        err
      );
    }
  };

  // Fetch previously submitted feedback
  const fetchFeedback = async () => {
    try {
      const response = await api.get("/feedback/my");

      const feedbackMap = {};

      (response.data.feedback || []).forEach((item) => {
        feedbackMap[item.grievance_id] = item;
      });

      setFeedbackByGrievance(feedbackMap);
    } catch (err) {
      console.error("Unable to load feedback", err);
    }
  };

  // Fetch citizen grievances
  const fetchGrievances = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/grievances/my");
      const data = response.data.grievances || [];

      setGrievances(data);

      await Promise.all([
        ...data.map((g) => fetchAttachments(g.id)),
        fetchFeedback(),
      ]);
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to load grievances. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  // Upload supporting documents
  const handleUpload = async (grievanceId, file) => {
    if (!file) return;

    setUploadMessages((previous) => ({
      ...previous,
      [grievanceId]: "",
    }));

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadMessages((previous) => ({
        ...previous,
        [grievanceId]:
          "Only JPG, PNG, WEBP and PDF files are allowed.",
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadMessages((previous) => ({
        ...previous,
        [grievanceId]: "File size must not exceed 5 MB.",
      }));
      return;
    }

    if (file.size === 0) {
      setUploadMessages((previous) => ({
        ...previous,
        [grievanceId]: "Empty files cannot be uploaded.",
      }));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading((previous) => ({
      ...previous,
      [grievanceId]: true,
    }));

    try {
      const response = await api.post(
        `/attachments/${grievanceId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await fetchAttachments(grievanceId);

      setUploadMessages((previous) => ({
        ...previous,
        [grievanceId]:
          response.data.message || "File uploaded successfully.",
      }));
    } catch (err) {
      const detail = err.response?.data?.detail;

      setUploadMessages((previous) => ({
        ...previous,
        [grievanceId]:
          typeof detail === "string"
            ? detail
            : "Unable to upload file. Please try again.",
      }));
    } finally {
      setUploading((previous) => ({
        ...previous,
        [grievanceId]: false,
      }));
    }
  };

  // Submit citizen feedback
  const handleFeedbackSubmit = async (grievanceId) => {
    const form = feedbackForms[grievanceId] || {
      rating: 0,
      comments: "",
    };

    if (!form.rating) {
      setFeedbackMessages((previous) => ({
        ...previous,
        [grievanceId]: "Please select a rating from 1 to 5 stars.",
      }));
      return;
    }

    setFeedbackSubmitting((previous) => ({
      ...previous,
      [grievanceId]: true,
    }));

    setFeedbackMessages((previous) => ({
      ...previous,
      [grievanceId]: "",
    }));

    try {
      const response = await api.post(`/feedback/${grievanceId}`, {
        rating: form.rating,
        comments: form.comments.trim() || null,
      });

      setFeedbackByGrievance((previous) => ({
        ...previous,
        [grievanceId]: response.data.feedback,
      }));

      setFeedbackMessages((previous) => ({
        ...previous,
        [grievanceId]:
          "Thank you! Your feedback was submitted successfully.",
      }));
    } catch (err) {
      const detail = err.response?.data?.detail;

      setFeedbackMessages((previous) => ({
        ...previous,
        [grievanceId]:
          typeof detail === "string"
            ? detail
            : "Unable to submit feedback. Please try again.",
      }));
    } finally {
      setFeedbackSubmitting((previous) => ({
        ...previous,
        [grievanceId]: false,
      }));
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Dashboard statistics
  const total = grievances.length;

  const pending = grievances.filter(
    (g) => ["Submitted", "Under Review"].includes(g.status)
  ).length;

  const inProgress = grievances.filter(
    (g) => g.status === "In Progress"
  ).length;

  const resolved = grievances.filter(
    (g) => g.status === "Resolved"
  ).length;

  const getStatusStyle = (status) => {
    const styles = {
      Submitted: { background: "#dbeafe", color: "#1d4ed8" },
      "Under Review": { background: "#fef3c7", color: "#92400e" },
      "In Progress": { background: "#ede9fe", color: "#6d28d9" },
      Resolved: { background: "#dcfce7", color: "#166534" },
      Reopened: { background: "#fee2e2", color: "#b91c1c" },
    };

    return styles[status] || {
      background: "#e5e7eb",
      color: "#374151",
    };
  };

  return (
    <div style={styles.page}>
      {/* Navigation */}
      <header style={styles.navbar}>
        <div style={styles.brand}>
          <ShieldCheck size={28} />

          <div>
            <strong>CM Kerala Grievance Portal</strong>
            <small>Citizen Services</small>
          </div>
        </div>

        <div style={styles.navRight}>
          <span>Welcome, {user?.name || "Citizen"}</span>

          <button onClick={logout} style={styles.logout}>
            <LogOut size={17} /> Logout
          </button>
        </div>
      </header>

      <main className="page-container">
        {/* Page heading */}
        <div style={styles.heading}>
          <div>
            <h1>Citizen Dashboard</h1>
            <p>Submit and monitor your public grievances.</p>
          </div>

          <Link to="/citizen/submit" style={styles.submitButton}>
            <Plus size={18} /> Submit Grievance
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="error-message">
            {error}

            <button onClick={fetchGrievances} style={styles.retry}>
              <RefreshCw size={15} /> Retry
            </button>
          </div>
        )}

        {/* Statistics */}
        <section style={styles.stats}>
          <StatCard
            title="Total Grievances"
            value={total}
            icon={<FileText size={23} />}
            color="#2563eb"
          />

          <StatCard
            title="Pending"
            value={pending}
            icon={<Clock size={23} />}
            color="#d97706"
          />

          <StatCard
            title="In Progress"
            value={inProgress}
            icon={<AlertCircle size={23} />}
            color="#7c3aed"
          />

          <StatCard
            title="Resolved"
            value={resolved}
            icon={<CheckCircle size={23} />}
            color="#16a34a"
          />
        </section>

        {/* My grievances */}
        <section className="card" style={styles.tableCard}>
          <div style={styles.sectionHeading}>
            <div>
              <h2>My Grievances</h2>
              <p>View and track your submitted complaints.</p>
            </div>

            <button onClick={fetchGrievances} style={styles.refresh}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          {loading ? (
            <p style={styles.message}>Loading grievances...</p>
          ) : grievances.length === 0 ? (
            <div style={styles.empty}>
              <FileText size={42} color="#94a3b8" />

              <h3>No grievances submitted yet</h3>

              <p>Your submitted grievances will appear here.</p>

              <Link to="/citizen/submit" style={styles.submitButton}>
                <Plus size={17} /> Submit Your First Grievance
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Reference Number</th>
                    <th>Subject</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submitted On</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {grievances.map((g) => (
                    <tr key={g.id}>
                      <td style={styles.reference}>
                        {g.reference_number}
                      </td>

                      <td>{g.subject}</td>
                      <td>{g.category}</td>
                      <td>{g.priority}</td>

                      <td>
                        <span
                          style={{
                            ...styles.status,
                            ...getStatusStyle(g.status),
                          }}
                        >
                          {g.status}
                        </span>
                      </td>

                      <td>
                        {g.created_at
                          ? new Date(g.created_at).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        <Link
                          to={`/citizen/track/${encodeURIComponent(
                            g.reference_number
                          )}`}
                          style={styles.trackLink}
                        >
                          Track
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Supporting documents */}
        {!loading && grievances.length > 0 && (
          <section style={{ marginTop: "25px" }}>
            <div style={styles.attachmentHeading}>
              <div>
                <h2>Supporting Documents</h2>

                <p>
                  Upload photographs or documents related to your grievances.
                </p>
              </div>
            </div>

            <div style={styles.attachmentGrid}>
              {grievances.map((g) => (
                <div className="card" key={`attachment-${g.id}`}>
                  <h3 style={{ marginBottom: "8px" }}>
                    {g.subject}
                  </h3>

                  <p style={styles.attachmentReference}>
                    {g.reference_number}
                  </p>

                  <div style={styles.uploadArea}>
                    <Upload size={21} color="#15803d" />

                    <label style={styles.uploadLabel}>
                      {uploading[g.id]
                        ? "Uploading..."
                        : "Choose a supporting file"}

                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        disabled={uploading[g.id]}
                        onChange={(e) => {
                          const file = e.target.files?.[0];

                          if (file) {
                            handleUpload(g.id, file);
                          }

                          e.target.value = "";
                        }}
                        style={{ display: "none" }}
                      />
                    </label>

                    <small style={styles.fileHint}>
                      JPG, PNG, WEBP or PDF · Maximum 5 MB
                    </small>
                  </div>

                  {uploading[g.id] && (
                    <p style={styles.uploadingText}>
                      Please wait while your file is uploaded...
                    </p>
                  )}

                  {uploadMessages[g.id] && (
                    <p
                      style={{
                        color: uploadMessages[g.id]
                          .toLowerCase()
                          .includes("successfully")
                          ? "#15803d"
                          : "#dc2626",
                        fontSize: "13px",
                        marginTop: "12px",
                      }}
                    >
                      {uploadMessages[g.id]}
                    </p>
                  )}

                  <div style={styles.attachmentList}>
                    <h4 style={styles.attachmentListTitle}>
                      <Paperclip size={16} />
                      Uploaded Files
                    </h4>

                    {(attachments[g.id] || []).length === 0 ? (
                      <p style={styles.noAttachments}>
                        No supporting files uploaded yet.
                      </p>
                    ) : (
                      (attachments[g.id] || []).map((item) => (
                        <div
                          key={item.id}
                          style={styles.attachmentItem}
                        >
                          <FileText size={17} color="#64748b" />

                          <div style={{ minWidth: 0 }}>
                            <p style={styles.fileName}>
                              {item.file_name}
                            </p>

                            <small style={styles.fileDate}>
                              {item.uploaded_at
                                ? new Date(
                                    item.uploaded_at
                                  ).toLocaleString()
                                : "Upload date unavailable"}
                            </small>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Citizen feedback */}
        {!loading &&
          grievances.some((g) => g.status === "Resolved") && (
            <section style={{ marginTop: "30px" }}>
              <div style={styles.attachmentHeading}>
                <h2>Citizen Feedback</h2>

                <p>
                  Share your experience after your grievance has been resolved.
                </p>
              </div>

              <div style={styles.attachmentGrid}>
                {grievances
                  .filter((g) => g.status === "Resolved")
                  .map((g) => {
                    const submitted = feedbackByGrievance[g.id];

                    const form = feedbackForms[g.id] || {
                      rating: 0,
                      comments: "",
                    };

                    return (
                      <div
                        className="card"
                        key={`feedback-${g.id}`}
                      >
                        <h3>{g.subject}</h3>

                        <p style={styles.attachmentReference}>
                          {g.reference_number}
                        </p>

                        {submitted ? (
                          <div>
                            <p style={styles.feedbackSuccess}>
                              <CheckCircle size={17} />
                              Feedback submitted
                            </p>

                            <p style={styles.feedbackStars}>
                              {"★".repeat(submitted.rating)}
                              {"☆".repeat(5 - submitted.rating)}
                            </p>

                            <p style={styles.feedbackComment}>
                              {submitted.comments ||
                                "No comments provided."}
                            </p>

                            <small style={styles.fileDate}>
                              Submitted:{" "}
                              {submitted.created_at
                                ? new Date(
                                    submitted.created_at
                                  ).toLocaleString()
                                : "—"}
                            </small>
                          </div>
                        ) : (
                          <>
                            <p style={styles.feedbackLabel}>
                              How satisfied are you with the resolution?
                            </p>

                            <div style={styles.ratingButtons}>
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  type="button"
                                  onClick={() =>
                                    setFeedbackForms((previous) => ({
                                      ...previous,
                                      [g.id]: {
                                        ...form,
                                        rating,
                                      },
                                    }))
                                  }
                                  style={{
                                    ...styles.starButton,
                                    color:
                                      rating <= form.rating
                                        ? "#f59e0b"
                                        : "#cbd5e1",
                                  }}
                                  aria-label={`${rating} star${
                                    rating > 1 ? "s" : ""
                                  }`}
                                >
                                  <Star
                                    size={29}
                                    fill={
                                      rating <= form.rating
                                        ? "#f59e0b"
                                        : "none"
                                    }
                                  />
                                </button>
                              ))}
                            </div>

                            <textarea
                              placeholder="Share your comments (optional)"
                              rows={3}
                              maxLength={2000}
                              value={form.comments}
                              onChange={(e) =>
                                setFeedbackForms((previous) => ({
                                  ...previous,
                                  [g.id]: {
                                    ...form,
                                    comments: e.target.value,
                                  },
                                }))
                              }
                              style={styles.feedbackTextarea}
                            />

                            <button
                              type="button"
                              className="primary-btn"
                              disabled={feedbackSubmitting[g.id]}
                              onClick={() =>
                                handleFeedbackSubmit(g.id)
                              }
                              style={styles.feedbackSubmit}
                            >
                              {feedbackSubmitting[g.id]
                                ? "Submitting..."
                                : "Submit Feedback"}
                            </button>
                          </>
                        )}

                        {feedbackMessages[g.id] && (
                          <p
                            style={{
                              ...styles.feedbackMessage,
                              color: feedbackMessages[g.id]
                                .toLowerCase()
                                .includes("successfully")
                                ? "#15803d"
                                : "#dc2626",
                            }}
                          >
                            {feedbackMessages[g.id]}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            </section>
          )}
      </main>

      <footer style={styles.footer}>
        Demonstration prototype. Not an official Government of Kerala website.
      </footer>
    </div>
  );
}

// Dashboard statistic card
function StatCard({ title, value, icon, color }) {
  return (
    <div className="card" style={styles.statCard}>
      <div>
        <p style={styles.statTitle}>{title}</p>
        <h2>{value}</h2>
      </div>

      <div
        style={{
          ...styles.statIcon,
          color,
          background: `${color}15`,
        }}
      >
        {icon}
      </div>
    </div>
  );
}

// Styles
const styles = {
  page: {
    minHeight: "100vh",
  },

  navbar: {
    background: "#14532d",
    color: "white",
    padding: "16px 5%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  logout: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "transparent",
    border: "1px solid #ffffff70",
    color: "white",
    padding: "9px 13px",
    borderRadius: "7px",
  },

  heading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "18px",
    marginBottom: "28px",
  },

  submitButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#14532d",
    color: "white",
    padding: "12px 18px",
    borderRadius: "7px",
    fontWeight: "600",
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "18px",
    marginBottom: "28px",
  },

  statCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statTitle: {
    color: "#64748b",
    fontSize: "14px",
    marginBottom: "10px",
  },

  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
  },

  tableCard: {
    overflow: "hidden",
  },

  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "22px",
  },

  refresh: {
    display: "flex",
    gap: "7px",
    alignItems: "center",
    background: "white",
    border: "1px solid #d5dce7",
    padding: "9px 13px",
    borderRadius: "7px",
  },

  retry: {
    marginLeft: "12px",
    background: "white",
    border: "1px solid #d5dce7",
    padding: "7px 10px",
    borderRadius: "6px",
    display: "inline-flex",
    gap: "6px",
    alignItems: "center",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "13px",
    minWidth: "850px",
  },

  reference: {
    color: "#14532d",
    fontWeight: "600",
  },

  status: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  trackLink: {
    color: "#15803d",
    fontWeight: "600",
  },

  message: {
    padding: "30px",
    textAlign: "center",
    color: "#64748b",
  },

  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "13px",
    padding: "40px 15px",
    textAlign: "center",
  },

  attachmentHeading: {
    marginBottom: "18px",
  },

  attachmentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
  },

  attachmentReference: {
    color: "#64748b",
    fontSize: "12px",
    marginBottom: "18px",
  },

  uploadArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    padding: "20px",
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    borderRadius: "9px",
  },

  uploadLabel: {
    color: "#15803d",
    fontWeight: "600",
    cursor: "pointer",
  },

  fileHint: {
    color: "#64748b",
    fontSize: "11px",
  },

  uploadingText: {
    color: "#2563eb",
    fontSize: "13px",
    marginTop: "12px",
  },

  attachmentList: {
    marginTop: "20px",
  },

  attachmentListTitle: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    marginBottom: "12px",
    fontSize: "14px",
  },

  noAttachments: {
    color: "#94a3b8",
    fontSize: "13px",
  },

  attachmentItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 0",
    borderTop: "1px solid #e5eaf1",
  },

  fileName: {
    fontSize: "13px",
    fontWeight: "600",
    overflowWrap: "anywhere",
  },

  fileDate: {
    color: "#94a3b8",
    fontSize: "11px",
  },

  // Feedback styles
  feedbackLabel: {
    fontSize: "13px",
    color: "#475569",
    marginBottom: "10px",
  },

  ratingButtons: {
    display: "flex",
    gap: "8px",
    marginBottom: "15px",
  },

  starButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "3px",
    display: "flex",
    alignItems: "center",
  },

  feedbackTextarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d5dce7",
    borderRadius: "7px",
    resize: "vertical",
    marginBottom: "12px",
    fontFamily: "inherit",
  },

  feedbackSubmit: {
    width: "100%",
  },

  feedbackSuccess: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#15803d",
    fontWeight: "600",
    marginBottom: "12px",
  },

  feedbackStars: {
    color: "#f59e0b",
    fontSize: "25px",
    letterSpacing: "3px",
    marginBottom: "10px",
  },

  feedbackComment: {
    color: "#475569",
    fontSize: "14px",
    marginBottom: "12px",
    overflowWrap: "anywhere",
  },

  feedbackMessage: {
    fontSize: "13px",
    marginTop: "12px",
  },

  footer: {
    textAlign: "center",
    padding: "22px 15px",
    color: "#64748b",
    fontSize: "12px",
  },
};
