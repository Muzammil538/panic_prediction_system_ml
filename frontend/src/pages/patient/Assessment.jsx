import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import PatientSidebar from "../../components/patient/PatientSidebar";
import PatientHeader from "../../components/patient/PatientHeader";

// Exact mapping from the LabelEncoder used on the dataset
const DATASET_MAPPING = {
  Gender: { Female: 0, Male: 1 },
  "Family History": { No: 0, Yes: 1 },
  "Personal History": { No: 0, Yes: 1 },
  "Current Stressors": { High: 0, Low: 1, Moderate: 2 },
  Severity: { Mild: 0, Moderate: 1, Severe: 2 },
  "Impact on Life": { Mild: 0, Moderate: 1, Significant: 2 },
  Demographics: { Rural: 0, Urban: 1 },
  "Medical History": { Asthma: 0, Diabetes: 1, "Heart disease": 2, Unknown: 3 },
  "Psychiatric History": {
    "Anxiety disorder": 0,
    "Bipolar disorder": 1,
    "Depressive disorder": 2,
    Unknown: 3,
  },
  "Substance Use": { Alcohol: 0, Drugs: 1, Unknown: 2 },
  "Coping Mechanisms": {
    Exercise: 0,
    Meditation: 1,
    "Seeking therapy": 2,
    Socializing: 3,
  },
  "Social Support": { High: 0, Low: 1, Moderate: 2 },
  "Lifestyle Factors": { Diet: 0, Exercise: 1, "Sleep quality": 2 },
  "Panic Disorder Diagnosis": { No: 0, Yes: 1 },
};

const SYMPTOM_OPTIONS = [
  "Chest pain",
  "Dizziness",
  "Fear of losing control",
  "Panic attacks",
  "Shortness of breath",
  "Other",
];

export default function PatientAssessment() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    "Participant ID": "",
    Age: "",
    Gender: "",

    "Family History": "",
    "Personal History": "",
    "Current Stressors": "",

    "Impact on Life": "",
    Demographics: "",

    "Medical History": "",
    "Psychiatric History": "",

    "Substance Use": "",
    "Coping Mechanisms": "",
    "Social Support": "",
    "Lifestyle Factors": "",

    "Panic Disorder Diagnosis": "",
  });

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [symptomSeverity, setSymptomSeverity] = useState({});
  const [currentSymptomSelect, setCurrentSymptomSelect] = useState("");

  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // -------------------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddSymptom = () => {
    if (currentSymptomSelect && !selectedSymptoms.includes(currentSymptomSelect)) {
      setSelectedSymptoms([...selectedSymptoms, currentSymptomSelect]);
      setSymptomSeverity({ ...symptomSeverity, [currentSymptomSelect]: 0 });
    }
    setCurrentSymptomSelect("");
  };

  const handleSymptomSlider = (symptom, value) => {
    setSymptomSeverity({ ...symptomSeverity, [symptom]: value });
  };

  const handleRemoveSymptom = (symptom) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    const updatedSeverity = { ...symptomSeverity };
    delete updatedSeverity[symptom];
    setSymptomSeverity(updatedSeverity);
  };

  // -------------------------
  const validate = () => {
    if (!form.Age || form.Age < 18 || form.Age > 70) {
      alert("Age must be 18–70");
      return false;
    }
    if (!form.Gender) {
      alert("Select gender");
      return false;
    }
    // ensure required selects are chosen
    const requiredKeys = [
      "Family History",
      "Personal History",
      "Current Stressors",
      "Impact on Life",
      "Demographics",
      "Medical History",
      "Psychiatric History",
      "Substance Use",
      "Coping Mechanisms",
      "Social Support",
      "Lifestyle Factors",
      "Panic Disorder Diagnosis",
    ];

    for (const key of requiredKeys) {
      if (!form[key]) {
        alert(`Please select an option for ${key}`);
        return false;
      }
    }

    return true;
  };

  // -------------------------
  const handleSubmit = async () => {
    if (!validate()) return;

    // Calculate overall average severity from symptoms
    let totalSeverity = 0;
    selectedSymptoms.forEach((s) => {
      totalSeverity += symptomSeverity[s];
    });

    const avgSeverity =
      selectedSymptoms.length > 0
        ? totalSeverity / selectedSymptoms.length
        : 0;

    const rawSeverityStr =
      avgSeverity < 2 ? "Mild" : avgSeverity < 4 ? "Moderate" : "Severe";

    // Map symptoms string (Replacing "Other" with "Unknown")
    const mappedSymptoms = selectedSymptoms.map((s) =>
      s === "Other" ? "Unknown" : s
    );

    // Build Payload with dataset mapped values
    const payload = {
      "Participant ID": form["Participant ID"],
      Age: Number(form.Age),
      Gender: DATASET_MAPPING.Gender[form.Gender],

      "Family History": DATASET_MAPPING["Family History"][form["Family History"]],
      "Personal History": DATASET_MAPPING["Personal History"][form["Personal History"]],
      "Current Stressors": DATASET_MAPPING["Current Stressors"][form["Current Stressors"]],
      
      Severity: DATASET_MAPPING.Severity[rawSeverityStr],
      
      "Impact on Life": DATASET_MAPPING["Impact on Life"][form["Impact on Life"]],
      Demographics: DATASET_MAPPING.Demographics[form.Demographics],

      "Medical History": DATASET_MAPPING["Medical History"][form["Medical History"]],
      "Psychiatric History": DATASET_MAPPING["Psychiatric History"][form["Psychiatric History"]],
      "Substance Use": DATASET_MAPPING["Substance Use"][form["Substance Use"]],
      "Coping Mechanisms": DATASET_MAPPING["Coping Mechanisms"][form["Coping Mechanisms"]],
      "Social Support": DATASET_MAPPING["Social Support"][form["Social Support"]],
      "Lifestyle Factors": DATASET_MAPPING["Lifestyle Factors"][form["Lifestyle Factors"]],
      
      "Panic Disorder Diagnosis": DATASET_MAPPING["Panic Disorder Diagnosis"][form["Panic Disorder Diagnosis"]],
      
      Symptoms: mappedSymptoms.join(", "),
    };

    try {
      const res = await API.post("/predict", payload);
      setResult(res.data);
      setShowModal(true);

      setTimeout(() => {
        navigate("/patient/dashboard");
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Prediction failed. " + (err.response?.data?.message || ""));
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <PatientSidebar />

      <div className="flex-1">
        <PatientHeader />

        <div className="p-8 max-w-6xl mx-auto space-y-8">
          <h1 className="text-2xl font-semibold">Panic Assessment</h1>

          {/* BASIC */}
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="font-medium text-gray-700 mb-4">Basic Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                name="Participant ID"
                placeholder="Participant ID"
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                name="Age"
                type="number"
                placeholder="Age"
                onChange={handleChange}
                className="border p-2 rounded"
              />

              <select
                name="Gender"
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Gender</option>
                {Object.keys(DATASET_MAPPING.Gender).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <select
                name="Demographics"
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Demographics</option>
                {Object.keys(DATASET_MAPPING.Demographics).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* HISTORY */}
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="font-medium text-gray-700 mb-4">History & Environment</h2>
            <div className="grid grid-cols-2 gap-4">
              <select
                name="Family History"
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Family History</option>
                {Object.keys(DATASET_MAPPING["Family History"]).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <select
                name="Personal History"
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Personal History</option>
                {Object.keys(DATASET_MAPPING["Personal History"]).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <select
                name="Medical History"
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Medical History</option>
                {Object.keys(DATASET_MAPPING["Medical History"]).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <select
                name="Psychiatric History"
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Psychiatric History</option>
                {Object.keys(DATASET_MAPPING["Psychiatric History"]).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              
              <select
                name="Substance Use"
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Substance Use</option>
                {Object.keys(DATASET_MAPPING["Substance Use"]).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <select
                name="Current Stressors"
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Current Stressors</option>
                {Object.keys(DATASET_MAPPING["Current Stressors"]).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SYMPTOMS & SEVERITY */}
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="font-semibold mb-4">Symptoms & Severity (0–5)</h2>
            <div className="flex gap-4 mb-6">
              <select
                className="border p-2 rounded flex-1"
                value={currentSymptomSelect}
                onChange={(e) => setCurrentSymptomSelect(e.target.value)}
              >
                <option value="">Select a symptom...</option>
                {SYMPTOM_OPTIONS.filter((s) => !selectedSymptoms.includes(s)).map(
                  (symptom) => (
                    <option key={symptom} value={symptom}>
                      {symptom}
                    </option>
                  )
                )}
              </select>
              <button
                onClick={handleAddSymptom}
                disabled={!currentSymptomSelect}
                className="bg-blue-600 text-white px-4 py-2 rounded shrink-0 disabled:bg-blue-300"
              >
                Add Symptom
              </button>
            </div>

            {selectedSymptoms.length > 0 && (
              <div className="space-y-4">
                {selectedSymptoms.map((symptom) => (
                  <div key={symptom} className="flex items-center gap-4 border p-3 rounded bg-gray-50">
                    <div className="flex-1">
                      <label className="text-sm font-medium">{symptom}</label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        value={symptomSeverity[symptom]}
                        onChange={(e) =>
                          handleSymptomSlider(symptom, Number(e.target.value))
                        }
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Severity: {symptomSeverity[symptom]}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveSymptom(symptom)}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            {selectedSymptoms.length === 0 && (
              <p className="text-sm text-gray-500 italic">No symptoms selected.</p>
            )}
          </div>

          {/* OTHER */}
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="font-medium text-gray-700 mb-4">Lifestyle & Support</h2>
            <div className="grid grid-cols-2 gap-4">
              <select
                name="Coping Mechanisms"
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Coping Mechanisms</option>
                {Object.keys(DATASET_MAPPING["Coping Mechanisms"]).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <select
                name="Social Support"
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Social Support</option>
                {Object.keys(DATASET_MAPPING["Social Support"]).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <select
                name="Lifestyle Factors"
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Lifestyle</option>
                {Object.keys(DATASET_MAPPING["Lifestyle Factors"]).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <select
                name="Impact on Life"
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Impact on Life</option>
                {Object.keys(DATASET_MAPPING["Impact on Life"]).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <select
                name="Panic Disorder Diagnosis"
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Panic Disorder Diagnosis</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold w-full hover:bg-blue-700 transition"
          >
            Submit Assessment
          </button>
        </div>
      </div>
      
      {showModal && result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-sm w-full text-center space-y-4">
            <h2 className="text-xl font-bold">Assessment Complete</h2>
            <p className="text-gray-700">Severity: <span className="font-semibold">{result.severity}</span></p>
            <p className="text-gray-700">Risk Score: <span className="font-semibold">{result.risk_score}%</span></p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}