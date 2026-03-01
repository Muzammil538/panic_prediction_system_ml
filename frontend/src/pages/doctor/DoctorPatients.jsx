import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import DoctorSidebar from "../../components/doctor/DoctorSidebar";
import DoctorHeader from "../../components/doctor/DoctorHeader";
import PatientsList from "../../components/doctor/PatientsList";
import AnalyticsCards from "../../components/doctor/AnalyticsCards";
import CollectiveChart from "../../components/doctor/CollectiveChart";

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [avgRisk, setAvgRisk] = useState(0);
  const [severityData, setSeverityData] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await API.get("/doctor/patients");
      setPatients(res.data);

      // analytics
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
    } catch (err) {
      console.error("Failed to load patients", err);
    }
  };

  const navigate = useNavigate();

  const handleSelect = (id) => {
    navigate(`/doctor/patient/${id}`);
  };

  return (
    <div className="flex bg-gray-50">
      <DoctorSidebar />
      <div className="flex-1">
        <DoctorHeader />
        <div className="p-8 space-y-8">
          <AnalyticsCards totalPatients={patients.length} avgRisk={avgRisk} />
          <PatientsList patients={patients} onSelect={handleSelect} />
          <CollectiveChart data={severityData} />
        </div>
      </div>
    </div>
  );
}
