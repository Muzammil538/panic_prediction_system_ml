import { useState } from "react";
import API from "../../services/api";
import PatientSidebar from "../../components/patient/PatientSidebar";
import PatientHeader from "../../components/patient/PatientHeader";
import PredictionResultModal from "../../components/patient/PredictionResultModal";

export default function PatientAssessment() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    family_history: "",
    previous_anxiety: "",

    panic_frequency: "",
    attack_triggers: [],
    attack_duration: "",
    activity_impact: "",

    symptoms: {
      fast_heartbeat: 0,
      sweating: 0,
      shaking: 0,
      dizziness: 0,
      chest_discomfort: 0,
      shortness_breath: 0,
      nausea: 0,
      fear_losing_control: 0,
      fear_dying: 0,
      detached_reality: 0,
    },

    stress_level: "",

    sleep_hours: "",
    sleep_quality: "",
    caffeine: "",
    alcohol: "",
    smoking: "",
    screen_time: "",
    physical_activity: "",
    social_support: "",

    psychiatric_history: [],
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTrigger = (value) => {
    if (formData.attack_triggers.includes(value)) {
      setFormData({
        ...formData,
        attack_triggers: formData.attack_triggers.filter((v) => v !== value),
      });
    } else {
      setFormData({
        ...formData,
        attack_triggers: [...formData.attack_triggers, value],
      });
    }
  };

  const handlePsychHistory = (value) => {
    if (formData.psychiatric_history.includes(value)) {
      setFormData({
        ...formData,
        psychiatric_history: formData.psychiatric_history.filter(
          (v) => v !== value,
        ),
      });
    } else {
      setFormData({
        ...formData,
        psychiatric_history: [...formData.psychiatric_history, value],
      });
    }
  };

  const handleSymptom = (e) => {
    const name = e.target.name;

    setFormData({
      ...formData,
      symptoms: {
        ...formData.symptoms,
        [name]: e.target.checked ? 1 : 0,
      },
    });
  };

  const validateForm = () => {
    if (!formData.age || !formData.gender || !formData.stress_level) {
      alert("Please fill required fields");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const symptomCount = Object.values(formData.symptoms).reduce(
        (a, b) => a + b,
        0,
      );

      const payload = {
        ...formData,
        symptom_count: symptomCount,
      };

      const res = await API.post("/predict", payload);

      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Prediction failed");
    }

    setLoading(false);
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <PatientSidebar />

      <div className="flex-1">
        <PatientHeader />

        <div className="p-8 max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* SECTION 1 */}

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-6">
                Section 1: Basic Details
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="age"
                  placeholder="Age (18-70)"
                  min="18"
                  max="70"
                  value={formData.age}
                  onChange={handleChange}
                  className="border p-3 rounded"
                />

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="border p-3 rounded"
                >
                  <option value="">Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>

                <select
                  name="family_history"
                  value={formData.family_history}
                  onChange={handleChange}
                  className="border p-3 rounded"
                >
                  <option value="">Family History of Anxiety/Panic</option>
                  <option>Yes</option>
                  <option>No</option>
                  <option>Dont know</option>
                </select>

                <select
                  name="previous_anxiety"
                  value={formData.previous_anxiety}
                  onChange={handleChange}
                  className="border p-3 rounded"
                >
                  <option value="">Previously Diagnosed Anxiety</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
            </div>

            {/* SECTION 2 */}

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-6">
                Section 2: Recent Panic Experience (Last 30 Days)
              </h2>

              <select
                name="panic_frequency"
                value={formData.panic_frequency}
                onChange={handleChange}
                className="border p-3 rounded w-full mb-4"
              >
                <option value="">Panic attacks in last 30 days</option>
                <option>None</option>
                <option>1-2</option>
                <option>3-5</option>
                <option>More than 5</option>
              </select>

              <p className="font-medium mb-2">When do they usually happen?</p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  "During stress",
                  "In crowded places",
                  "At night",
                  "Without reason",
                  "Before exams/work",
                ].map((item) => (
                  <label key={item}>
                    <input
                      type="checkbox"
                      value={item}
                      onChange={() => handleTrigger(item)}
                      className="mr-2"
                    />

                    {item}
                  </label>
                ))}
              </div>

              <select
                name="attack_duration"
                value={formData.attack_duration}
                onChange={handleChange}
                className="border p-3 rounded w-full mb-4"
              >
                <option value="">Average attack duration</option>
                <option>{"<5 min"}</option>
                <option>5-15 min</option>
                <option>{">15 min"}</option>
              </select>

              <select
                name="activity_impact"
                value={formData.activity_impact}
                onChange={handleChange}
                className="border p-3 rounded w-full"
              >
                <option value="">Do attacks affect daily activities?</option>
                <option>No</option>
                <option>Sometimes</option>
                <option>Frequently</option>
              </select>
            </div>

            {/* SECTION 3 */}

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-6">
                Section 3: Symptoms During Attack
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ["fast_heartbeat", "Fast heartbeat"],
                  ["sweating", "Sweating"],
                  ["shaking", "Shaking"],
                  ["dizziness", "Dizziness"],
                  ["chest_discomfort", "Chest discomfort"],
                  ["shortness_breath", "Shortness of breath"],
                  ["nausea", "Nausea"],
                  ["fear_losing_control", "Fear of losing control"],
                  ["fear_dying", "Fear of dying"],
                  ["detached_reality", "Feeling detached from reality"],
                ].map(([key, label]) => (
                  <label key={key}>
                    <input
                      type="checkbox"
                      name={key}
                      onChange={handleSymptom}
                      className="mr-2"
                    />

                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* SECTION 4 */}

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-6">
                Section 4: Stress Level
              </h2>

              <select
                name="stress_level"
                value={formData.stress_level}
                onChange={handleChange}
                className="border p-3 rounded w-full"
              >
                <option value="">Current Stress Level</option>
                <option>Low</option>
                <option>Moderate</option>
                <option>High</option>
              </select>
            </div>

            {/* SECTION 5 */}

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-6">
                Section 5: Lifestyle Factors
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <select
                  name="sleep_hours"
                  onChange={handleChange}
                  className="border p-3 rounded"
                >
                  <option value="">Sleep Hours</option>
                  <option>{"<5"}</option>
                  <option>5-7</option>
                  <option>{">7"}</option>
                </select>

                <select
                  name="sleep_quality"
                  onChange={handleChange}
                  className="border p-3 rounded"
                >
                  <option value="">Sleep Quality</option>
                  <option>Good</option>
                  <option>Disturbed</option>
                  <option>Very poor</option>
                </select>

                <select
                  name="caffeine"
                  onChange={handleChange}
                  className="border p-3 rounded"
                >
                  <option value="">Caffeine Intake</option>
                  <option>None</option>
                  <option>1-2</option>
                  <option>3-4</option>
                  <option>{">4"}</option>
                </select>

                <select
                  name="alcohol"
                  onChange={handleChange}
                  className="border p-3 rounded"
                >
                  <option value="">Alcohol Use</option>
                  <option>None</option>
                  <option>Occasionally</option>
                  <option>Frequently</option>
                </select>

                <select
                  name="smoking"
                  onChange={handleChange}
                  className="border p-3 rounded"
                >
                  <option value="">Smoking</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>

                <select
                  name="screen_time"
                  onChange={handleChange}
                  className="border p-3 rounded"
                >
                  <option value="">Screen Time</option>
                  <option>{"<2 hrs"}</option>
                  <option>2-5 hrs</option>
                  <option>{">5 hrs"}</option>
                </select>

                <select
                  name="physical_activity"
                  onChange={handleChange}
                  className="border p-3 rounded"
                >
                  <option value="">Physical Activity</option>
                  <option>Regular</option>
                  <option>Sometimes</option>
                  <option>None</option>
                </select>

                <select
                  name="social_support"
                  onChange={handleChange}
                  className="border p-3 rounded"
                >
                  <option value="">Social Support</option>
                  <option>Strong</option>
                  <option>Moderate</option>
                  <option>Weak</option>
                </select>
              </div>
            </div>

            {/* SECTION 6 */}

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-6">
                Section 6: Psychiatric History
              </h2>

              <div className="grid grid-cols-2 gap-2">
                {[
                  "None",
                  "Anxiety Disorder",
                  "Depression",
                  "Panic Disorder",
                  "PTSD",
                  "Other",
                ].map((item) => (
                  <label key={item}>
                    <input
                      type="checkbox"
                      value={item}
                      onChange={() => handlePsychHistory(item)}
                      className="mr-2"
                    />

                    {item}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              {loading ? "Submitting..." : "Submit Assessment"}
            </button>
          </form>
        </div>
      </div>
      <PredictionResultModal result={result} onClose={() => setResult(null)} />
    </div>
  );
}
