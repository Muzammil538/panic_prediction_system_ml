import { useEffect, useState } from "react";
import API from "../../services/api";
import PatientSidebar from "../../components/patient/PatientSidebar";
import PatientHeader from "../../components/patient/PatientHeader";

const DOCTOR_FEATURE_ENABLED = false;

export default function MyDoctor() {

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await API.get("/doctors");
      setDoctors(res.data);
    } catch (err) {
      console.error("Error fetching doctors:", err.response?.data || err.message);
    }
  };

  if (!DOCTOR_FEATURE_ENABLED) {
    return (
      <div className="flex bg-gray-50">
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-4">Doctor feature is currently disabled</h1>
          <p className="text-gray-600">The doctor request and consulting workflow is not available at this time.</p>
        </div>
      </div>
    );
  }

  const sendRequest = async () => {
    if (!selectedDoctor) return alert("Please select a doctor");

    try {
      await API.post("/request-doctor", {
        doctor_id: selectedDoctor
      });

      setMessage("Request sent successfully! Waiting for doctor's approval.");
      setSelectedDoctor(null);
      // Refresh doctors list
      fetchDoctors();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.msg || err.message;
      console.error("Error sending request:", errorMsg);
      
      // Handle specific errors
      if (err.response?.status === 400 && errorMsg.includes("already exists")) {
        alert("You have already sent a request to this doctor. Please wait for their response.");
      } else if (err.response?.status === 400 && errorMsg.includes("Invalid doctor")) {
        alert("This doctor is no longer available. Please select another doctor.");
      } else if (err.response?.status === 403) {
        alert("You don't have permission to send doctor requests.");
      } else {
        alert("Failed to send request: " + errorMsg);
      }
    }
  };

  return (
    <div className="flex bg-gray-50">

      <PatientSidebar />

      <div className="flex-1">
        <PatientHeader />

        <div className="p-8 max-w-4xl">

          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">

            <h2 className="text-2xl font-semibold text-blue-700 mb-6">
              Select Consulting Doctor
            </h2>

            <div className="space-y-4">

              {doctors.length === 0 ? (
                <p className="text-gray-600">No doctors are currently registered. Please create a doctor account or contact the administrator.</p>
              ) : (
                doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className={`border p-4 rounded-lg cursor-pointer transition
                    ${selectedDoctor === doc.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200"}`}
                    onClick={() => setSelectedDoctor(doc.id)}
                  >
                    Dr. {doc.name}
                  </div>
                ))
              )}

            </div>

            <button
              onClick={sendRequest}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Send Consultation Request
            </button>

            {message && (
              <p className="mt-4 text-green-600 font-medium">
                {message}
              </p>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}