import { useState } from "react";
import API from "../../services/api";
import PatientSidebar from "../../components/patient/PatientSidebar";
import PatientHeader from "../../components/patient/PatientHeader";

export default function PatientAssessment() {
  const [form, setForm] = useState({
    Age: "",
    Gender: "",
    Panic_Attack_Frequency: "",
    Duration_Minutes: "",
    Trigger: "",

    Heart_Rate: 0,
    Sweating: 0,
    Shortness_of_Breath: 0,
    Dizziness: 0,
    Chest_Pain: 0,
    Trembling: 0,

    Sleep_Hours: "",
    Caffeine_Intake: "",
    Alcohol_Consumption: "",
    Smoking: "",
    Exercise_Frequency: "",

    Medical_History: "",
    Medication: "",
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSlider = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const validate = () => {
    if (!form.Age || form.Age < 18 || form.Age > 70) {
      alert("Age must be between 18 and 70");
      return false;
    }

    if (!form.Gender) {
      alert("Please select gender");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const res = await API.post("/predict", form);
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Prediction failed");
    }
  };

  const Slider = ({ label, name }) => (
    <div className="space-y-1">
      <label className="text-gray-700 font-medium">{label}</label>
      <input
        type="range"
        min="0"
        max="5"
        value={form[name]}
        onChange={(e) => handleSlider(name, Number(e.target.value))}
        className="w-full"
      />
      <div className="text-sm text-gray-500">Severity: {form[name]}</div>
    </div>
  );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <PatientSidebar />

      <div className="flex-1">
        <PatientHeader />

        <div className="p-8 max-w-5xl mx-auto space-y-8">

          <h1 className="text-2xl font-semibold text-gray-800">
            Panic Assessment Form
          </h1>

          {/* SECTION 1 */}
          <div className="bg-white p-6 rounded-xl shadow border">
            <h2 className="font-semibold text-gray-700 mb-4">Basic Details</h2>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="Age"
                placeholder="Age"
                min="18"
                max="70"
                value={form.Age}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              <select
                name="Gender"
                value={form.Gender}
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* SECTION 2 */}
          <div className="bg-white p-6 rounded-xl shadow border">
            <h2 className="font-semibold text-gray-700 mb-4">
              Panic Attack Details
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <select
                name="Panic_Attack_Frequency"
                value={form.Panic_Attack_Frequency}
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Frequency</option>
                <option value="0">None</option>
                <option value="2">1–2</option>
                <option value="4">3–5</option>
                <option value="6">More than 5</option>
              </select>

              <select
                name="Duration_Minutes"
                value={form.Duration_Minutes}
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Duration</option>
                <option value="3">Less than 5 min</option>
                <option value="10">5–15 min</option>
                <option value="20">More than 15 min</option>
              </select>

              <select
                name="Trigger"
                value={form.Trigger}
                onChange={handleChange}
                className="border p-2 rounded col-span-2"
              >
                <option value="">Trigger</option>
                <option>Stress</option>
                <option>Crowds</option>
                <option>Night</option>
                <option>Random</option>
              </select>
            </div>
          </div>

          {/* SECTION 3 */}
          <div className="bg-white p-6 rounded-xl shadow border">
            <h2 className="font-semibold text-gray-700 mb-4">
              Symptoms Severity (0–5)
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <Slider label="Heart Rate" name="Heart_Rate" />
              <Slider label="Sweating" name="Sweating" />
              <Slider label="Shortness of Breath" name="Shortness_of_Breath" />
              <Slider label="Dizziness" name="Dizziness" />
              <Slider label="Chest Pain" name="Chest_Pain" />
              <Slider label="Trembling" name="Trembling" />
            </div>
          </div>

          {/* SECTION 4 */}
          <div className="bg-white p-6 rounded-xl shadow border">
            <h2 className="font-semibold text-gray-700 mb-4">Lifestyle</h2>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="Sleep_Hours"
                placeholder="Sleep Hours"
                value={form.Sleep_Hours}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              <select
                name="Caffeine_Intake"
                value={form.Caffeine_Intake}
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Caffeine</option>
                <option value="0">None</option>
                <option value="2">1–2</option>
                <option value="4">3–4</option>
                <option value="6">More</option>
              </select>

              <select
                name="Alcohol_Consumption"
                value={form.Alcohol_Consumption}
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Alcohol</option>
                <option value="0">None</option>
                <option value="2">Occasional</option>
                <option value="4">Frequent</option>
              </select>

              <select
                name="Smoking"
                value={form.Smoking}
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Smoking</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>

              <select
                name="Exercise_Frequency"
                value={form.Exercise_Frequency}
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Exercise</option>
                <option value="3">Regular</option>
                <option value="1">Sometimes</option>
                <option value="0">None</option>
              </select>
            </div>
          </div>

          {/* SECTION 5 */}
          <div className="bg-white p-6 rounded-xl shadow border">
            <h2 className="font-semibold text-gray-700 mb-4">
              Medical History
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <select
                name="Medical_History"
                value={form.Medical_History}
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Medical History</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>

              <select
                name="Medication"
                value={form.Medication}
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Medication</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Submit Assessment
          </button>

          {/* RESULT */}
          {result && (
            <div className="bg-white p-6 rounded-xl shadow border mt-6">
              <h2 className="font-semibold text-lg text-gray-700 mb-2">
                Result
              </h2>

              <p>Risk Score: {result.risk_score}%</p>
              <p>Severity: {result.severity}</p>
              <p>Trend: {result.trend}</p>

              <p className="mt-2 font-medium">
                Influential Factors:
              </p>
              <ul className="list-disc ml-6">
                {result.top_factors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}