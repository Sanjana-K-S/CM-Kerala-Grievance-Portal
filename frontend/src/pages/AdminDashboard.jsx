
import { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  LogOut,
  Building2,
  Users,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const statusColors = {
  Submitted: "#2563eb",
  "Under Review": "#d97706",
  "In Progress": "#7c3aed",
  Resolved: "#16a34a",
  Reopened: "#dc2626",
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [grievances, setGrievances] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);

  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [departmentId, setDepartmentId] = useState("");
  const [officerId, setOfficerId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingOfficer, setCreatingOfficer] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [officerForm, setOfficerForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    department_id: "",
  });

  // Load dashboard information
  const fetchDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [statsRes, grievancesRes, departmentsRes] =
        await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/grievances"),
          api.get("/departments/"),
        ]);

      setStats(statsRes.data);
      setGrievances(grievancesRes.data.grievances || []);

      setDepartments(
        Array.isArray(departmentsRes.data)
          ? departmentsRes.data
          : []
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load the admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Load officers belonging to selected department
  const fetchOfficers = async (id) => {
    setDepartmentId(id);
    setOfficerId("");
    setOfficers([]);
    setError("");

    if (!id) return;

    try {
      const response = await api.get(
        `/admin/officers?department_id=${id}`
      );

      setOfficers(response.data.officers || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load department officers."
      );
    }
  };

  // Open assignment window
  const openAssignment = (grievance) => {
    setSelectedGrievance(grievance);

    const existingDepartment = departments.find(
      (department) => department.name === grievance.department
    );

    setDepartmentId(
      existingDepartment ? String(existingDepartment.id) : ""
    );

    setOfficerId("");
    setOfficers([]);
    setError("");
    setMessage("");

    if (existingDepartment) {
      loadExistingDepartmentOfficers(existingDepartment.id);
    }
  };

  // Load officers when opening an already assigned grievance
  const loadExistingDepartmentOfficers = async (id) => {
    try {
      const response = await api.get(
        `/admin/officers?department_id=${id}`
      );

      setOfficers(response.data.officers || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load department officers."
      );
    }
  };

  // Assign or reassign grievance
  const assignGrievance = async (e) => {
    e.preventDefault();

    if (!selectedGrievance || !departmentId || !officerId) {
      setError("Please select both a department and an officer.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await api.post("/assignments/", {
        grievance_id: selectedGrievance.id,
        department_id: Number(departmentId),
        officer_id: Number(officerId),
      });

      setSelectedGrievance(null);
      setMessage("Grievance assigned successfully.");

      await fetchDashboard();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to assign the grievance."
      );
    } finally {
      setSaving(false);
    }
  };

  // Register a new officer
  const createOfficer = async (e) => {
    e.preventDefault();

    setCreatingOfficer(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/admin/officers", {
        ...officerForm,
        name: officerForm.name.trim(),
        email: officerForm.email.trim().toLowerCase(),
        mobile: officerForm.mobile.trim(),
        department_id: Number(officerForm.department_id),
      });

      setMessage(
        response.data.message ||
        "Officer account created successfully."
      );

      setOfficerForm({
        name: "",
        email: "",
        mobile: "",
        password: "",
        department_id: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to create officer account."
      );
    } finally {
      setCreatingOfficer(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Dashboard cards
  const cards = [
    {
      title: "Total Grievances",
      value: stats.total_grievances ?? 0,
      icon: <FileText size={25} />,
      color: "#2563eb",
    },
    {
      title: "Submitted",
      value: stats.submitted ?? 0,
      icon: <Clock size={25} />,
      color: "#d97706",
    },
    {
      title: "Under Review",
      value: stats.under_review ?? 0,
      icon: <AlertCircle size={25} />,
      color: "#7c3aed",
    },
    {
      title: "In Progress",
      value: stats.in_progress ?? 0,
      icon: <RefreshCw size={25} />,
      color: "#0891b2",
    },
    {
      title: "Resolved",
      value: stats.resolved ?? 0,
      icon: <CheckCircle size={25} />,
      color: "#16a34a",
    },
    {
      title: "Reopened",
      value: stats.reopened ?? 0,
      icon: <AlertCircle size={25} />,
      color: "#dc2626",
    },
  ];

  return (
    <div className="page-container">
      <div style={{ maxWidth: "1250px", margin: "0 auto" }}>

        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
            <p style={{ color: "#64748b", marginBottom: 0 }}>
              Grievance management and department administration
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/admin/enquiries"
              className="primary-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#14532d",
              }}
            >
              View Contact Enquiries
            </Link>

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
          </div>
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

        {loading ? (
          <div className="card">
            Loading dashboard...
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(175px, 1fr))",
                gap: "16px",
                marginBottom: "30px",
              }}
            >
              {cards.map((card) => (
                <div className="card" key={card.title}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        color: "#64748b",
                        fontSize: "14px",
                      }}
                    >
                      {card.title}
                    </span>

                    <span style={{ color: card.color }}>
                      {card.icon}
                    </span>
                  </div>

                  <h2
                    style={{
                      fontSize: "30px",
                      margin: "12px 0 0",
                    }}
                  >
                    {card.value}
                  </h2>
                </div>
              ))}
            </div>

            {/* Department Overview */}
            <div className="card" style={{ marginBottom: "25px" }}>
              <h2
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: 0,
                }}
              >
                <Building2 size={22} />
                Department Overview
              </h2>

              {Array.isArray(stats.department_statistics) &&
              stats.department_statistics.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {stats.department_statistics.map((item) => (
                    <div
                      key={item.department_id}
                      style={{
                        padding: "16px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid #e5eaf1",
                      }}
                    >
                      <strong>{item.department_name}</strong>

                      <p
                        style={{
                          margin: "10px 0 0",
                          color: "#64748b",
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                        }}
                      >
                        <Users size={16} />
                        {item.assigned_count ?? 0} assigned grievances
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#64748b" }}>
                  No department statistics available.
                </p>
              )}
            </div>

            {/* Manage Officers */}
            <div className="card" style={{ marginBottom: "25px" }}>
              <h2
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: 0,
                }}
              >
                <Users size={22} />
                Manage Officers
              </h2>

              <p style={{ color: "#64748b" }}>
                Register officers and assign them to their respective
                departments.
              </p>

              <form onSubmit={createOfficer}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "15px",
                  }}
                >
                  <div className="form-group">
                    <label>Officer Name *</label>
                    <input
                      type="text"
                      value={officerForm.name}
                      onChange={(e) =>
                        setOfficerForm({
                          ...officerForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter officer name"
                      required
                      minLength={2}
                      maxLength={150}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={officerForm.email}
                      onChange={(e) =>
                        setOfficerForm({
                          ...officerForm,
                          email: e.target.value,
                        })
                      }
                      placeholder="Enter email address"
                      required
                      maxLength={150}
                    />
                  </div>

                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      value={officerForm.mobile}
                      onChange={(e) =>
                        setOfficerForm({
                          ...officerForm,
                          mobile: e.target.value,
                        })
                      }
                      placeholder="Enter mobile number"
                      maxLength={15}
                    />
                  </div>

                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      value={officerForm.password}
                      onChange={(e) =>
                        setOfficerForm({
                          ...officerForm,
                          password: e.target.value,
                        })
                      }
                      placeholder="Minimum 8 characters"
                      minLength={8}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Department *</label>
                    <select
                      value={officerForm.department_id}
                      onChange={(e) =>
                        setOfficerForm({
                          ...officerForm,
                          department_id: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select department</option>

                      {departments.map((department) => (
                        <option
                          key={department.id}
                          value={department.id}
                        >
                          {department.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={creatingOfficer}
                  style={{ marginTop: "15px" }}
                >
                  {creatingOfficer
                    ? "Creating Account..."
                    : "Register Officer"}
                </button>
              </form>
            </div>

            {/* All Grievances */}
            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <h2 style={{ margin: 0 }}>
                  All Grievances
                </h2>

                <button
                  className="primary-btn"
                  onClick={fetchDashboard}
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
                  No grievances have been submitted yet.
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: "950px",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#f8fafc",
                          textAlign: "left",
                        }}
                      >
                        {[
                          "Reference",
                          "Citizen",
                          "Subject",
                          "District",
                          "Status",
                          "Department",
                          "Officer",
                          "Action",
                        ].map((heading) => (
                          <th
                            key={heading}
                            style={{
                              padding: "13px",
                              borderBottom: "1px solid #e2e8f0",
                              fontSize: "13px",
                            }}
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {grievances.map((g) => (
                        <tr key={g.id}>
                          <td
                            style={{
                              padding: "13px",
                              fontSize: "13px",
                            }}
                          >
                            {g.reference_number}
                          </td>

                          <td style={{ padding: "13px" }}>
                            {g.citizen_name || "Citizen"}
                          </td>

                          <td style={{ padding: "13px" }}>
                            {g.subject}
                          </td>

                          <td style={{ padding: "13px" }}>
                            {g.district}
                          </td>

                          <td style={{ padding: "13px" }}>
                            <span
                              style={{
                                color:
                                  statusColors[g.status] || "#64748b",
                                fontWeight: 600,
                              }}
                            >
                              {g.status}
                            </span>
                          </td>

                          <td style={{ padding: "13px" }}>
                            {g.department || "Not assigned"}
                          </td>

                          <td style={{ padding: "13px" }}>
                            {g.officer || "Not assigned"}
                          </td>

                          <td style={{ padding: "13px" }}>
                            <button
                              className="primary-btn"
                              onClick={() => openAssignment(g)}
                              style={{ whiteSpace: "nowrap" }}
                            >
                              {g.department ? "Reassign" : "Assign"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Assignment Modal */}
        {selectedGrievance && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.55)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
              zIndex: 1000,
            }}
          >
            <div
              className="card"
              style={{
                width: "100%",
                maxWidth: "500px",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                Assign Grievance
              </h2>

              <p style={{ color: "#64748b" }}>
                Reference: {selectedGrievance.reference_number}
              </p>

              <p>
                <strong>Subject:</strong>{" "}
                {selectedGrievance.subject}
              </p>

              <form onSubmit={assignGrievance}>
                <div className="form-group">
                  <label>Department *</label>

                  <select
                    value={departmentId}
                    onChange={(e) => fetchOfficers(e.target.value)}
                    required
                  >
                    <option value="">Select department</option>

                    {departments.map((department) => (
                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Officer *</label>

                  <select
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    required
                    disabled={!departmentId}
                  >
                    <option value="">Select officer</option>

                    {officers.map((officer) => (
                      <option
                        key={officer.id}
                        value={officer.id}
                      >
                        {officer.name} ({officer.email})
                      </option>
                    ))}
                  </select>
                </div>

                {departmentId && officers.length === 0 && (
                  <p
                    style={{
                      color: "#d97706",
                      fontSize: "13px",
                    }}
                  >
                    No officers are available in this department.
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={saving || !officerId}
                  >
                    {saving ? "Assigning..." : "Confirm Assignment"}
                  </button>

                  <button
                    type="button"
                    className="primary-btn"
                    style={{ background: "#64748b" }}
                    onClick={() => setSelectedGrievance(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <p
          style={{
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "12px",
            marginTop: "25px",
          }}
        >
          Demonstration prototype. Not an official Government of Kerala
          website.
        </p>
      </div>
    </div>
  );
}
