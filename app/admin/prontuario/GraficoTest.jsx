// app/admin/prontuario/GraficoHumor.jsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Dados falsos só para ver o gráfico funcionando.
// Depois a gente puxa da tabela 'prontuario' do banco.
const data = [
  { data: "10 Out", humor: 3 },
  { data: "12 Out", humor: 4 },
  { data: "15 Out", humor: 3 },
  { data: "18 Out", humor: 5 },
  { data: "24 Out", humor: 4 },
];

export default function GraficoHumor() {
  return (
    <div className="w-full h-64 bg-white p-4 rounded-xl border border-gray-100">
      <h3 className="text-sm font-bold text-gray-700 mb-4">
        Evolução do Humor
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
          />
          <XAxis
            dataKey="data"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
          />
          <YAxis hide domain={[0, 5]} />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="humor"
            stroke="#005C8A"
            strokeWidth={3}
            dot={{ r: 4, fill: "#005C8A", strokeWidth: 2, stroke: "#fff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
