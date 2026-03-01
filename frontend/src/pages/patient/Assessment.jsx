import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import PatientSidebar from "../../components/patient/PatientSidebar";
import PatientHeader from "../../components/patient/PatientHeader";

function InputSection({ children }) {
  return <div className="space-y-5">{children}</div>;
}

const featureList = [
  "Age",
  "Gender_Male",
  "Gender_Other",
  "Country_Other",
  "Country_United Kingdom",
  "Country_United States",
  "self_employed_Yes",
  "family_history_Yes",
  "work_interfere_Often",
  "work_interfere_Rarely",
  "work_interfere_Sometimes",
  "no_employees_100-500",
  "no_employees_26-100",
  "no_employees_500-1000",
  "no_employees_6-25",
  "no_employees_More than 1000",
  "remote_work_Yes",
  "tech_company_Yes",
  "benefits_No",
  "benefits_Yes",
  "care_options_Not sure",
  "care_options_Yes",
  "wellness_program_No",
  "wellness_program_Yes",
  "seek_help_No",
  "seek_help_Yes",
  "anonymity_No",
  "anonymity_Yes",
  "leave_Somewhat difficult",
  "leave_Somewhat easy",
  "leave_Very difficult",
  "leave_Very easy",
  "mental_health_consequence_No",
  "mental_health_consequence_Yes",
  "phys_health_consequence_No",
  "phys_health_consequence_Yes",
  "coworkers_Some of them",
  "coworkers_Yes",
  "supervisor_Some of them",
  "supervisor_Yes",
  "mental_health_interview_No",
  "mental_health_interview_Yes",
  "phys_health_interview_No",
  "phys_health_interview_Yes",
  "mental_vs_physical_No",
  "mental_vs_physical_Yes",
  "obs_consequence_Yes"
];

export default function Assessment() {

  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const generateEmptyFeatureObject = () => {
    const obj = {};
    featureList.forEach(f => obj[f] = 0);
    return obj;
  };

  const setCategory = (payload, prefix, value) => {
    featureList.forEach(f => {
      if (f.startsWith(prefix)) payload[f] = 0;
    });
    if (value) payload[value] = 1;
  };

  const handleSubmit = async () => {

    let payload = generateEmptyFeatureObject();
    payload.Age = Number(formData.Age || 30);

    // Gender
    if (formData.gender === "Male") payload["Gender_Male"] = 1;
    if (formData.gender === "Other") payload["Gender_Other"] = 1;

    // Country
    setCategory(payload, "Country_", formData.country);

    // Self Employed
    if (formData.selfEmployed === "Yes")
      payload["self_employed_Yes"] = 1;

    // Family History
    if (formData.familyHistory === "Yes")
      payload["family_history_Yes"] = 1;

    // Work Interference
    setCategory(payload, "work_interfere_", formData.workInterfere);

    // Employees
    setCategory(payload, "no_employees_", formData.employees);

    // Remote Work
    if (formData.remoteWork === "Yes")
      payload["remote_work_Yes"] = 1;

    // Tech Company
    if (formData.techCompany === "Yes")
      payload["tech_company_Yes"] = 1;

    // Benefits
    setCategory(payload, "benefits_", formData.benefits);

    // Care Options
    setCategory(payload, "care_options_", formData.careOptions);

    // Wellness Program
    setCategory(payload, "wellness_program_", formData.wellness);

    // Seek Help
    setCategory(payload, "seek_help_", formData.seekHelp);

    // Anonymity
    setCategory(payload, "anonymity_", formData.anonymity);

    // Leave
    setCategory(payload, "leave_", formData.leave);

    // Mental Consequence
    setCategory(payload, "mental_health_consequence_", formData.mentalConsequence);

    // Physical Consequence
    setCategory(payload, "phys_health_consequence_", formData.physConsequence);

    // Coworkers
    setCategory(payload, "coworkers_", formData.coworkers);

    // Supervisor
    setCategory(payload, "supervisor_", formData.supervisor);

    // Interviews
    setCategory(payload, "mental_health_interview_", formData.mentalInterview);
    setCategory(payload, "phys_health_interview_", formData.physInterview);

    // Mental vs Physical
    setCategory(payload, "mental_vs_physical_", formData.mentalVsPhysical);

    if (formData.obsConsequence === "Yes")
      payload["obs_consequence_Yes"] = 1;

    try {
      setLoading(true);
      await API.post("/predict", payload);
      navigate("/patient/dashboard");
    } catch (err) {
      console.error("Assessment submission error:", err.response?.data || err.message);
      alert("Submission failed: " + (err.response?.data?.message || err.response?.data?.msg || err.message));
      setLoading(false);
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
              Mental Health Assessment
            </h2>

            {/* STEP INDICATOR */}
            <div className="flex justify-between mb-8">
              {[1,2,3,4,5].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step === s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
                >
                  {s}
                </div>
              ))}
            </div>

            {/* STEP CONTENT */}
            {step === 1 && (
              <InputSection>
                <div>
                  <label htmlFor="age" className="block text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    placeholder="Age"
                    className="w-full border p-3 rounded-lg"
                    onChange={(e)=>setFormData({...formData,Age:e.target.value})}
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    className="w-full border p-3 rounded-lg"
                    onChange={(e)=>setFormData({...formData,gender:e.target.value})}>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="country" className="block text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    className="w-full border p-3 rounded-lg"
                    onChange={(e)=>setFormData({...formData,country:e.target.value})}>
                    <option value="">Select Country</option>
                    <option value="Country_United States">United States</option>
                    <option value="Country_United Kingdom">United Kingdom</option>
                    <option value="Country_Other">Other</option>
                  </select>
                </div>
              </InputSection>
            )}

            {step === 2 && (
              <InputSection>
                <div>
                  <label htmlFor="workInterfere" className="block text-gray-700 mb-1">
                    Work Interference
                  </label>
                  <select
                    id="workInterfere"
                    name="workInterfere"
                    className="w-full border p-3 rounded-lg"
                    onChange={(e)=>setFormData({...formData,workInterfere:e.target.value})}>
                    <option value="">Work Interference</option>
                    <option value="work_interfere_Often">Often</option>
                    <option value="work_interfere_Sometimes">Sometimes</option>
                    <option value="work_interfere_Rarely">Rarely</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    How often does your mental health affect your work performance?
                  </p>
                </div>

                <div>
                  <label htmlFor="employees" className="block text-gray-700 mb-1">
                    Company Size
                  </label>
                  <select
                    id="employees"
                    name="employees"
                    className="w-full border p-3 rounded-lg"
                    onChange={(e)=>setFormData({...formData,employees:e.target.value})}>
                    <option value="">Company Size</option>
                    <option value="no_employees_6-25">6-25</option>
                    <option value="no_employees_26-100">26-100</option>
                    <option value="no_employees_100-500">100-500</option>
                    <option value="no_employees_500-1000">500-1000</option>
                    <option value="no_employees_More than 1000">More than 1000</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    The approximate size of the company you work for.
                  </p>
                </div>
              </InputSection>
            )}

            {step === 3 && (
              <InputSection>
                <div>
                  <label htmlFor="benefits" className="block text-gray-700 mb-1">
                    Benefits
                  </label>
                  <select
                    id="benefits"
                    name="benefits"
                    className="w-full border p-3 rounded-lg"
                    onChange={(e)=>setFormData({...formData,benefits:e.target.value})}>
                    <option value="">Benefits</option>
                    <option value="benefits_Yes">Yes</option>
                    <option value="benefits_No">No</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Does your employer provide mental health benefits?
                  </p>
                </div>

                <div>
                  <label htmlFor="wellness" className="block text-gray-700 mb-1">
                    Wellness Program
                  </label>
                  <select
                    id="wellness"
                    name="wellness"
                    className="w-full border p-3 rounded-lg"
                    onChange={(e)=>setFormData({...formData,wellness:e.target.value})}>
                    <option value="">Wellness Program</option>
                    <option value="wellness_program_Yes">Yes</option>
                    <option value="wellness_program_No">No</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Is there a wellness program available at work?
                  </p>
                </div>
              </InputSection>
            )}

            {step === 4 && (
              <InputSection>
                <div>
                  <label htmlFor="mentalConsequence" className="block text-gray-700 mb-1">
                    Mental Health Consequence
                  </label>
                  <select
                    id="mentalConsequence"
                    name="mentalConsequence"
                    className="w-full border p-3 rounded-lg"
                    onChange={(e)=>setFormData({...formData,mentalConsequence:e.target.value})}>
                    <option value="">Mental Health Consequence</option>
                    <option value="mental_health_consequence_Yes">Yes</option>
                    <option value="mental_health_consequence_No">No</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Would your mental health issues have consequences at work?
                  </p>
                </div>

                <div>
                  <label htmlFor="physConsequence" className="block text-gray-700 mb-1">
                    Physical Health Consequence
                  </label>
                  <select
                    id="physConsequence"
                    name="physConsequence"
                    className="w-full border p-3 rounded-lg"
                    onChange={(e)=>setFormData({...formData,physConsequence:e.target.value})}>
                    <option value="">Physical Health Consequence</option>
                    <option value="phys_health_consequence_Yes">Yes</option>
                    <option value="phys_health_consequence_No">No</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Would physical health issues affect your ability to work?
                  </p>
                </div>
              </InputSection>
            )}

            {step === 5 && (
              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                  {loading ? "Analyzing..." : "Submit Assessment"}
                </button>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  onClick={()=>setStep(step-1)}
                  className="px-4 py-2 bg-gray-200 rounded-lg">
                  Back
                </button>
              )}

              {step < 5 && (
                <button
                  onClick={()=>setStep(step+1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  Next
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}