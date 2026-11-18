
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import CitizenDashboard from "./pages/CitizenDashboard";
import SubmitGrievance from "./pages/SubmitGrievance";
import TrackGrievance from "./pages/TrackGrievance";
import AdminDashboard from "./pages/AdminDashboard";
import OfficerDashboard from "./pages/OfficerDashboard";
import Contact from "./pages/Contact";
import AdminEnquiries from "./pages/AdminEnquiries";

function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem("access_token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/citizen"
          element={
            <ProtectedRoute roles={["citizen"]}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/citizen/submit"
          element={
            <ProtectedRoute roles={["citizen"]}>
              <SubmitGrievance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/citizen/track/:reference"
          element={
            <ProtectedRoute roles={["citizen"]}>
              <TrackGrievance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["cmo_admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/officer"
          element={
            <ProtectedRoute roles={["officer"]}>
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/contact" element={<Contact />} />
          <Route
  path="/admin/enquiries"
  element={
    <ProtectedRoute allowedRole="cmo_admin">
      <AdminEnquiries />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>

        
  );
}
