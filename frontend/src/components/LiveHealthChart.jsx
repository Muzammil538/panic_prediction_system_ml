import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function LiveHealthChart({ data }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Live Health Monitoring
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="time" />
          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="heart_rate"
          />

          <Line
            type="monotone"
            dataKey="stress_level"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}