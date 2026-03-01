export default function RiskSummaryCard({ risk = 0, severity = "Low" }) {
  const severityColor =
    severity === "High"
      ? "text-red-600"
      : severity === "Moderate"
      ? "text-yellow-600"
      : "text-green-600";

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Latest Risk Assessment
      </h3>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-4xl font-bold text-blue-600">{risk}%</p>
          <p className={`font-semibold ${severityColor}`}>
            {severity} Risk
          </p>
        </div>

        <div className="w-24 h-24 rounded-full border-8 border-blue-200 flex items-center justify-center text-blue-600 font-bold">
          {risk}%
        </div>
      </div>
    </div>
  );
}