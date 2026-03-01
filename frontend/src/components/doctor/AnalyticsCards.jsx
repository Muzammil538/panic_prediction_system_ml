export default function AnalyticsCards({ totalPatients, avgRisk }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-200 p-6 rounded-xl">
        <h3 className="text-gray-600">Total Patients</h3>
        <p className="text-3xl font-bold text-blue-600">
          {totalPatients}
        </p>
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded-xl">
        <h3 className="text-gray-600">Average Risk Score</h3>
        <p className="text-3xl font-bold text-blue-600">
          {avgRisk}%
        </p>
      </div>
    </div>
  );
}