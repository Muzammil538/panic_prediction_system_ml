import { useEffect, useState, useRef } from "react";
import API from "../../services/api";
import PatientSidebar from "../../components/patient/PatientSidebar";
import PatientHeader from "../../components/patient/PatientHeader";
import RiskSummaryCard from "../../components/patient/RiskSummaryCard";
import TrendChart from "../../components/patient/TrendChart";

export default function PatientDashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorStatus, setDoctorStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const pageVisibleRef = useRef(true);
  const pollIntervalRef = useRef(null);

  // Handle page visibility changes (tab focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      pageVisibleRef.current = !document.hidden;
      console.log("Page visibility changed:", pageVisibleRef.current ? "visible" : "hidden");
      if (pageVisibleRef.current) {
        // Page became visible, refresh data immediately
        console.log("Refreshing data because page became visible");
        fetchHistory();
        fetchDoctorStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Initial load and polling
  useEffect(() => {
    fetchHistory();
    fetchDoctorStatus();

    // Poll for doctor status updates every 5 seconds
    pollIntervalRef.current = setInterval(() => {
      console.log("Polling for doctor status updates...");
      fetchDoctorStatus();
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await API.get("/history");
      setHistory(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching history:", err.response?.data || err.message);
      setLoading(false);
    }
  };

  const fetchDoctorStatus = async () => {
    try {
      const res = await API.get("/patient/doctor-status");
      console.log("Doctor status response:", res.data);
      setDoctorStatus(res.data);
    } catch (err) {
      console.error("Doctor status fetch failed:", err.response?.data || err.message);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    await fetchDoctorStatus();
    setRefreshing(false);
  };

  // Format chart data
  const trendData = history.map((item, index) => ({
    date: new Date(item.timestamp).toLocaleDateString(),
    risk: item.risk_score,
  }));

  const latest = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="flex bg-gray-50">
      <PatientSidebar />

      <div className="flex-1">
        <PatientHeader />

        <div className="p-8 space-y-8">
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : (
            <>
              <RiskSummaryCard
                risk={latest?.risk_score || 0}
                severity={latest?.severity || "Low"}
              />

              <TrendChart data={trendData} />

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Consulting Doctor Status
                  </h3>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:opacity-50"
                  >
                    {refreshing ? "Refreshing..." : "Refresh"}
                  </button>
                </div>

                {!doctorStatus || doctorStatus.status === "none" ? (
                  <div className="text-gray-600">No doctor selected yet.</div>
                ) : doctorStatus.status === "pending" ? (
                  <div className="text-yellow-600 font-medium">
                    Request sent to Dr. {doctorStatus.doctor_name} (Pending
                    Approval)
                  </div>
                ) : (
                  <div className="text-green-600 font-medium">
                    Approved by Dr. {doctorStatus.doctor_name}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
