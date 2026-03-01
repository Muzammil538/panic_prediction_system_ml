import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import DoctorSidebar from "../../components/doctor/DoctorSidebar";
import DoctorHeader from "../../components/doctor/DoctorHeader";
import PatientReportModal from "../../components/doctor/PatientReportModal";

export default function DoctorPatientReportsPage() {
  const { id } = useParams();
  const [reports, setReports] = useState(null);

  useEffect(() => {
    if (id) fetchReports();
  }, [id]);

  const fetchReports = async () => {
    try {
      const res = await API.get(`/doctor/patient/${id}`);
      setReports(res.data);
    } catch (err) {
      console.error("Failed to load patient reports", err);
    }
  };

  return (
    <div className="flex bg-gray-50">
      <DoctorSidebar />
      <div className="flex-1">
        <DoctorHeader />
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">
            Patient Reports
          </h2>
          {reports ? (
            <PatientReportModal
              reports={reports}
              onClose={() => setReports(null)}
            />
          ) : (
            <p className="text-gray-600">Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}
