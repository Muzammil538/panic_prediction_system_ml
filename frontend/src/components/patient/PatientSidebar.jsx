import { Link } from "react-router-dom";

export default function PatientSidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      <h2 className="text-xl font-semibold text-blue-700 mb-8">
        Patient Panel
      </h2>

      <nav className="space-y-4 text-gray-600">
        <Link to="/patient/dashboard" className="block hover:text-blue-600">
          Dashboard
        </Link>
        <Link to="/patient/assessment" className="block hover:text-blue-600">
          New Assessment
        </Link>
        <Link to="/patient/history" className="block hover:text-blue-600">
          Assessment History
        </Link>
        <Link to="/patient/doctor" className="block hover:text-blue-600">
          My Doctor
        </Link>
      </nav>
    </div>
  );
}