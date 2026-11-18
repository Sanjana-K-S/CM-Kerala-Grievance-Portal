
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import api from "../services/api";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/contact/send-otp", form);

      setDemoOtp(response.data.demo_otp);
      setOtpSent(true);
      setSuccess("Demo OTP generated. Use the OTP displayed below.");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to generate OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/contact/verify-otp", {
        email: form.email,
        otp,
      });

      setSuccess(response.data.message);
      setForm({ name: "", email: "", subject: "", message: "" });
      setOtp("");
      setDemoOtp("");
      setOtpSent(false);
    } catch (err) {
      setError(err.response?.data?.detail || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: 650, margin: "30px auto" }}>
        <Link to="/login" style={styles.back}>
          <ArrowLeft size={17} /> Back to Login
        </Link>

        <div style={styles.heading}>
          <Mail size={35} color="#14532d" />
          <h1>Contact Us</h1>
          <p>Send your enquiry to our support team.</p>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {!otpSent ? (
          <form onSubmit={sendOTP}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange}
                minLength="2" maxLength="150" required />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={form.email}
                onChange={handleChange} maxLength="150" required />
              <small>Demo mode: no real email will be sent.</small>
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input name="subject" value={form.subject} onChange={handleChange}
                minLength="3" maxLength="255" required />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea name="message" value={form.message}
                onChange={handleChange} rows="5"
                minLength="10" maxLength="5000" required />
            </div>

            <button className="primary-btn" type="submit"
              disabled={loading} style={styles.button}>
              {loading ? "Generating OTP..." : "Generate Demo OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOTP}>
            <div style={styles.otpInfo}>
              <ShieldCheck size={25} color="#15803d" />
              <div>
                <strong>Demo OTP: {demoOtp}</strong>
                <p>Enter this code to verify the demo email address.</p>
              </div>
            </div>

            <div className="form-group">
              <label>Enter 6-digit OTP</label>
              <input value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric" maxLength="6" required />
            </div>

            <button className="primary-btn" type="submit"
              disabled={loading || otp.length !== 6} style={styles.button}>
              {loading ? "Verifying..." : "Verify OTP and Submit Enquiry"}
            </button>

            <button type="button" style={styles.secondaryButton}
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setDemoOtp("");
                setError("");
                setSuccess("");
              }}>
              Change Details
            </button>
          </form>
        )}

        <p style={styles.footer}>
          Demonstration prototype. Not an official Government of Kerala website.
        </p>
      </div>
    </div>
  );
}

const styles = {
  back: { display: "inline-flex", gap: 7, marginBottom: 25, color: "#14532d" },
  heading: { textAlign: "center", marginBottom: 28 },
  button: { width: "100%", textAlign: "center" },
  secondaryButton: {
    width: "100%", marginTop: 12, padding: 11,
    border: "1px solid #cbd5e1", borderRadius: 7,
    background: "white", cursor: "pointer"
  },
  otpInfo: {
    display: "flex", gap: 12, alignItems: "center",
    background: "#f0fdf4", padding: 15, borderRadius: 8,
    marginBottom: 20, lineHeight: 1.5
  },
  footer: {
    textAlign: "center", fontSize: 12,
    color: "#64748b", marginTop: 25
  }
};
