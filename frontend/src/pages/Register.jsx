
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, ShieldCheck } from "lucide-react";
import api from "../services/api";


export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", form);

      setSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.logo}>
          <ShieldCheck size={30} />
        </div>
        <h2>CM Kerala Grievance Portal</h2>
        <p>Create your citizen account</p>
      </div>

      <div style={styles.card}>
        <h2>
          <UserPlus size={22} style={{ verticalAlign: "middle" }} /> Register
        </h2>

        <p style={styles.subtitle}>
          Enter your details to get started
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              placeholder="Enter mobile number"
              value={form.mobile}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-btn"
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
        <p style={{ marginTop: "15px", textAlign: "center" }}>
  <Link to="/contact" style={{ color: "#14532d", fontWeight: 600 }}>
    Contact Us
  </Link>
</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "25px",
  },
  header: {
    textAlign: "center",
    marginBottom: "25px",
  },
  logo: {
    width: "60px",
    height: "60px",
    borderRadius: "15px",
    background: "#14532d",
    color: "white",
    display: "grid",
    placeItems: "center",
    margin: "0 auto 15px",
  },
  card: {
    background: "white",
    width: "100%",
    maxWidth: "450px",
    padding: "32px",
    borderRadius: "14px",
    border: "1px solid #e5eaf1",
  },
  subtitle: {
    color: "#64748b",
    margin: "10px 0 24px",
  },
  button: {
    width: "100%",
    marginTop: "8px",
  },
  footer: {
    textAlign: "center",
    marginTop: "22px",
    fontSize: "14px",
  },
};
