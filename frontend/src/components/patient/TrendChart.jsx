import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TrendChart({ data }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Risk Trend Over Time
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="timestampMs"
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />

          <YAxis domain={[0, 100]} />

          <Tooltip
            formatter={(value) => `${value}%`}
            labelFormatter={(label) => new Date(label).toLocaleString()}
          />

          <Line
            type="monotone"
            dataKey="risk"
            stroke="#2563eb"
            strokeWidth={3}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
