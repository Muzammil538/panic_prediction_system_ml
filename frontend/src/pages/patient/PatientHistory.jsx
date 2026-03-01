import { useEffect, useState } from "react";
import API from "../../services/api";
import PatientSidebar from "../../components/patient/PatientSidebar";
import PatientHeader from "../../components/patient/PatientHeader";

export default function PatientHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await API.get("/history");
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50">
      <PatientSidebar />
      <div className="flex-1">
        <PatientHeader />
        <div className="p-8 max-w-4xl">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">
            Assessment History
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-600">No assessments yet.</p>
          ) : (
            <ul className="space-y-4">
              {history.map((h) => (
                <li key={h.timestamp} className="bg-white p-4 rounded-lg border">
                  <div>Score: {h.risk_score}</div>
                  <div>Severity: {h.severity}</div>
                  <div>Date: {new Date(h.timestamp).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
