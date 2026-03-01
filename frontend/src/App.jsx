import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

/* ================= PATIENT PAGES ================= */
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientAssessment from "./pages/patient/Assessment";
import MyDoctor from "./pages/patient/MyDoctor";
import PatientHistory from "./pages/patient/PatientHistory";

/* ================= DOCTOR PAGES ================= */
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorRequestsPage from "./pages/doctor/DoctorRequests.jsx";
import DoctorPatientsPage from "./pages/doctor/DoctorPatients.jsx";
import DoctorPatientReportsPage from "./pages/doctor/DoctorPatientReports.jsx";



/* ================= PROTECTED ROUTE ================= */
import RoleProtectedRoute from "./components/RoleProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= PATIENT ROUTES ================= */}

        <Route
          path="/patient/dashboard"
          element={
            <RoleProtectedRoute allowedRole="patient">
              <PatientDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/patient/assessment"
          element={
            <RoleProtectedRoute allowedRole="patient">
              <PatientAssessment />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/patient/doctor"
          element={
            <RoleProtectedRoute allowedRole="patient">
              <MyDoctor />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/patient/history"
          element={
            <RoleProtectedRoute allowedRole="patient">
              <PatientHistory />
            </RoleProtectedRoute>
          }
        />

        {/* ================= DOCTOR ROUTES ================= */}

        <Route
          path="/doctor/dashboard"
          element={
            <RoleProtectedRoute allowedRole="doctor">
              <DoctorDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/doctor/requests"
          element={
            <RoleProtectedRoute allowedRole="doctor">
              <DoctorRequestsPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/doctor/patients"
          element={
            <RoleProtectedRoute allowedRole="doctor">
              <DoctorPatientsPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/doctor/patient/:id"
          element={
            <RoleProtectedRoute allowedRole="doctor">
              <DoctorPatientReportsPage />
            </RoleProtectedRoute>
          }
        />

        {/* ================= DEFAULT REDIRECT ================= */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;