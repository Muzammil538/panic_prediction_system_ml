import { Link } from "react-router-dom";

export default function DoctorSidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      <h2 className="text-xl font-semibold text-blue-700 mb-8">
        Doctor Panel
      </h2>

      <nav className="space-y-4 text-gray-600">
        <Link to="/doctor/dashboard" className="block hover:text-blue-600">
          Dashboard
        </Link>
        <Link to="/doctor/requests" className="block hover:text-blue-600">
          Pending Requests
        </Link>
        <Link to="/doctor/patients" className="block hover:text-blue-600">
          Patients
        </Link>
      </nav>
    </div>
  );
}