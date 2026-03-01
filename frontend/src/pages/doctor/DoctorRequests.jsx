import { useEffect, useState } from "react";
import API from "../../services/api";
import DoctorSidebar from "../../components/doctor/DoctorSidebar";
import DoctorHeader from "../../components/doctor/DoctorHeader";
import PatientRequests from "../../components/doctor/PatientRequests";

export default function DoctorRequestsPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get("/doctor/requests");
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to load requests", err);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      await API.post("/doctor/accept", { request_id: requestId });
      fetchRequests();
    } catch (err) {
      console.error("Could not accept request", err);
    }
  };

  return (
    <div className="flex bg-gray-50">
      <DoctorSidebar />
      <div className="flex-1">
        <DoctorHeader />
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">
            Pending Patient Requests
          </h2>
          <PatientRequests requests={requests} onAccept={acceptRequest} />
        </div>
      </div>
    </div>
  );
}
