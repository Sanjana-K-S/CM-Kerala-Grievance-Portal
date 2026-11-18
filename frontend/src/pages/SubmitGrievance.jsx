
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  FileText,
  Sparkles,
  Loader2,
  Brain,
} from "lucide-react";
import api from "../services/api";

const districts = [
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod",
];

const categories = [
  "Road Maintenance",
  "Water Supply",
  "Electricity",
  "Healthcare",
  "Education",
  "Sanitation",
  "Public Services",
  "Other",
];

export default function SubmitGrievance() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    district: "",
    category: "",
    subject: "",
    description: "",
    priority: "Medium",
  });

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAnalyze = async () => {
    setAiError("");
    setAiResult(null);

    if (form.subject.trim().length < 3) {
      setAiError("Please enter a subject before analysing.");
      return;
    }

    if (form.description.trim().length < 10) {
      setAiError("Please enter at least 10 characters in the description.");
      return;
    }

    setAiLoading(true);

    try {
      const response = await api.post("/ai/analyze", {
        subject: form.subject,
        description: form.description,
      });

      const suggestions = response.data.suggestions;

      const aiCategory = String(suggestions.category || "").toLowerCase();

      const categoryMap = {
        road: "Road Maintenance",
        water: "Water Supply",
        electricity: "Electricity",
        power: "Electricity",
        health: "Healthcare",
        medical: "Healthcare",
        hospital: "Healthcare",
        education: "Education",
        school: "Education",
        sanitation: "Sanitation",
        waste: "Sanitation",
        public: "Public Services",
        government: "Public Services",
      };

      let matchedCategory = categories.find(
        (category) => category.toLowerCase() === aiCategory
      );

      if (!matchedCategory) {
        const matchedKey = Object.keys(categoryMap).find((key) =>
          aiCategory.includes(key)
        );
        matchedCategory = matchedKey
          ? categoryMap[matchedKey]
          : "Other";
      }

      setForm((previous) => ({
        ...previous,
        category: matchedCategory,
        priority: ["Low", "Medium", "High"].includes(suggestions.priority)
          ? suggestions.priority
          : "Medium",
      }));

      setAiResult(suggestions);
    } catch (err) {
      setAiError(
        err.response?.data?.detail ||
          "AI analysis failed. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/grievances/", form);
      setSuccess(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to submit your grievance. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-container">
        <div
          className="card"
          style={{
            maxWidth: "650px",
            margin: "50px auto",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "15px" }}>✓</div>
          <h2>Grievance Submitted Successfully!</h2>
          <p>Your complaint has been registered.</p>

          <div
            style={{
              background: "#f0f7ff",
              padding: "20px",
              borderRadius: "10px",
              margin: "25px 0",
            }}
          >
            <p style={{ margin: "0 0 8px", color: "#555" }}>
              Your Reference Number
            </p>
            <h2 style={{ color: "#1d4ed8", margin: 0 }}>
              {success.reference_number}
            </h2>
          </div>

          <p>Please save this reference number to track your grievance.</p>

          <button
            className="primary-btn"
            onClick={() =>
              navigate(
                `/citizen/track/${encodeURIComponent(
                  success.reference_number
                )}`
              )
            }
          >
            Track Grievance
          </button>

          <button
            className="primary-btn"
            style={{ marginLeft: "10px", background: "#475569" }}
            onClick={() => navigate("/citizen")}
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Link
          to="/citizen"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#334155",
            textDecoration: "none",
            marginBottom: "20px",
          }}
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "25px",
            }}
          >
            <FileText size={30} color="#2563eb" />
            <div>
              <h2 style={{ margin: 0 }}>Submit a Grievance</h2>
              <p style={{ color: "#64748b", margin: "5px 0 0" }}>
                Provide accurate details about your complaint.
              </p>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>District *</label>
              <select
                name="district"
                value={form.district}
                onChange={handleChange}
                required
              >
                <option value="">Select your district</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Grievance Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Briefly describe your issue"
                minLength={5}
                maxLength={255}
                required
              />
            </div>

            <div className="form-group">
              <label>Detailed Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Explain the issue, its location, and how it affects you..."
                rows={6}
                minLength={10}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "10px",
                padding: "18px",
                marginBottom: "22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  marginBottom: "8px",
                }}
              >
                <Brain size={21} color="#2563eb" />
                <strong style={{ color: "#1e40af" }}>
                  AI Grievance Assistant
                </strong>
              </div>

              <p
                style={{
                  color: "#475569",
                  fontSize: "13px",
                  margin: "0 0 14px",
                }}
              >
                Analyse your complaint to get suggested category, priority,
                department and a summary for the CMO.
              </p>

              {aiError && (
                <div className="error-message" style={{ marginBottom: "12px" }}>
                  {aiError}
                </div>
              )}

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={aiLoading}
                className="primary-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#2563eb",
                }}
              >
                {aiLoading ? (
                  <>
                    <Loader2 size={17} />
                    Analysing complaint...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    Analyse with AI
                  </>
                )}
              </button>

              {aiResult && (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "15px",
                    marginTop: "16px",
                  }}
                >
                  <h4 style={{ margin: "0 0 12px", color: "#1e293b" }}>
                    AI Analysis Results
                  </h4>

                  <p>
                    <strong>Suggested Department:</strong>{" "}
                    {aiResult.department}
                  </p>

                  <p>
                    <strong>Suggested Category:</strong>{" "}
                    {aiResult.category}
                  </p>

                  <p>
                    <strong>Recommended Priority:</strong>{" "}
                    {aiResult.priority}
                  </p>

                  <p style={{ marginBottom: "8px" }}>
                    <strong>Summary for CMO:</strong>
                  </p>

                  <p style={{ color: "#475569", marginTop: 0 }}>
                    {aiResult.summary}
                  </p>

                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginBottom: 0,
                    }}
                  >
                    These are AI-generated suggestions. Review and edit the
                    category and priority before submitting.
                  </p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Priority *</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <button
              type="submit"
              className="primary-btn"
              disabled={loading || aiLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Send size={17} />
              {loading ? "Submitting..." : "Submit Grievance"}
            </button>
          </form>

          <p
            style={{
              fontSize: "12px",
              color: "#64748b",
              marginTop: "20px",
            }}
          >
            Demonstration prototype. Not an official Government of Kerala
            website.
          </p>
        </div>
      </div>
    </div>
  );
}
