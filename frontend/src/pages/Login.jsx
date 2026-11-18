
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Mail } from "lucide-react";
import api from "../services/api";


export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
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
    setLoading(true);

    try {
      const response = await api.post("/auth/login", form);

      const { access_token, user } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "citizen") {
        navigate("/citizen");
      } else if (user.role === "cmo_admin") {
        navigate("/admin");
      } else if (user.role === "officer") {
        navigate("/officer");
      } else {
        setError("Unrecognized account role.");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || "Invalid email or password."
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
        <p>Public Grievance Redressal System</p>
      </div>

      <div style={styles.card}>
        <h2>Welcome Back</h2>
        <p style={styles.subtitle}>
          Sign in to access your account
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} />
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="primary-btn"
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <p style={{ marginTop: "15px", textAlign: "center" }}>
  <Link to="/contact" style={{ color: "#14532d", fontWeight: 600 }}>
    Contact Us
  </Link>
</p>

      </div>

      <p style={styles.disclaimer}>
        Demonstration prototype. Not an official Government of Kerala website.
      </p>
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
    maxWidth: "430px",
    padding: "32px",
    borderRadius: "14px",
    border: "1px solid #e5eaf1",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
  },
  subtitle: {
    color: "#64748b",
    margin: "8px 0 25px",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid #d5dce7",
    borderRadius: "7px",
    padding: "0 12px",
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
  disclaimer: {
    marginTop: "25px",
    color: "#64748b",
    fontSize: "12px",
    textAlign: "center",
  },
};
