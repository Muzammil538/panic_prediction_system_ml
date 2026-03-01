import { useEffect, useState } from "react";
import API from "../../services/api";

import DoctorSidebar from "../../components/doctor/DoctorSidebar";
import DoctorHeader from "../../components/doctor/DoctorHeader";
import AnalyticsCards from "../../components/doctor/AnalyticsCards";
import PatientRequests from "../../components/doctor/PatientRequests";
import PatientsList from "../../components/doctor/PatientsList";
import CollectiveChart from "../../components/doctor/CollectiveChart";

import PatientReportModal from "../../components/doctor/PatientReportModal";

export default function DoctorDashboard() {
  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [severityData, setSeverityData] = useState([]);
  const [avgRisk, setAvgRisk] = useState(0);
  const [selectedReports, setSelectedReports] = useState(null);

  useEffect(() => {
    fetchRequests();
    fetchPatients();
  }, []);

  const fetchRequests = async () => {
    const res = await API.get("/doctor/requests");
    setRequests(res.data);
  };

  const fetchPatients = async () => {
    const res = await API.get("/doctor/patients");
    setPatients(res.data);

    // Compute analytics
    let totalRisk = 0;
    let count = 0;
    let severityCount = { Low: 0, Moderate: 0, High: 0 };

    res.data.forEach((p) => {
      p.reports?.forEach((r) => {
        totalRisk += r.risk_score;
        count++;
        severityCount[r.severity]++;
      });
    });

    setAvgRisk(count ? (totalRisk / count).toFixed(1) : 0);

    setSeverityData([
      { name: "Low", value: severityCount.Low },
      { name: "Moderate", value: severityCount.Moderate },
      { name: "High", value: severityCount.High },
    ]);
  };

  const acceptRequest = async (requestId) => {
    await API.post("/doctor/accept", { request_id: requestId });
    fetchRequests();
    fetchPatients();
  };

  const viewPatient = async (patientId) => {
    const res = await API.get(`/doctor/patient/${patientId}`);
    setSelectedReports(res.data);
  };

  return (
    <>
      <div className="flex bg-gray-50">
        <DoctorSidebar />

        <div className="flex-1">
          <DoctorHeader />

          <div className="p-8 space-y-8">
            <AnalyticsCards totalPatients={patients.length} avgRisk={avgRisk} />

            <div className="grid md:grid-cols-2 gap-6">
              <PatientRequests requests={requests} onAccept={acceptRequest} />

              <PatientsList patients={patients} onSelect={viewPatient} />
            </div>

            <CollectiveChart data={severityData} />
          </div>
        </div>
      </div>
      {selectedReports && (
        <PatientReportModal
          reports={selectedReports}
          onClose={() => setSelectedReports(null)}
        />
      )}
    </>
  );
}
