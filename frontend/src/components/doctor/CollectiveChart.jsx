import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#16a34a", "#eab308", "#dc2626"];

export default function CollectiveChart({ data }) {
  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">
        Severity Distribution
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={80}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}