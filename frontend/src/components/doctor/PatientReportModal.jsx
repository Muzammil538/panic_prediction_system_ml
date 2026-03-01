import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function PatientReportModal({ reports, onClose }) {

  if (!reports) return null;

  const trendData = reports.map(r => ({
    date: new Date(r.timestamp).toLocaleDateString(),
    risk: r.risk_score
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-3xl p-8 rounded-xl shadow-lg">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-blue-700">
            Patient Risk Report
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {reports.length === 0 ? (
          <p className="text-gray-600">No assessments yet.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="risk"
                  stroke="#2563eb"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-2">
              {reports.map((r, i) => (
                <div
                  key={i}
                  className="border p-3 rounded-lg text-sm"
                >
                  {new Date(r.timestamp).toLocaleString()} —
                  <span className="font-semibold ml-2">
                    {r.risk_score}% ({r.severity})
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}