// app/admin/prontuario/GraficoTest.jsx
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

/**
 * Mapeia o texto de humor_predominante para escala 1-5.
 * Aceita variações de caixa e sinônimos comuns.
 */
function mapearHumor(texto) {
  if (!texto) return null;
  const t = String(texto).trim().toLowerCase();

  const mapa = {
    // Nível 1
    "muito ruim": 1,
    péssimo: 1,
    pessimo: 1,
    crítico: 1,
    critico: 1,
    // Nível 2
    ruim: 2,
    negativo: 2,
    baixo: 2,
    // Nível 3
    neutro: 3,
    estável: 3,
    estavel: 3,
    regular: 3,
    // Nível 4
    bom: 4,
    positivo: 4,
    // Nível 5
    "muito bom": 5,
    ótimo: 5,
    otimo: 5,
    excelente: 5,
  };

  return mapa[t] ?? null;
}

/**
 * Formata um timestamp para "dd Mmm" (ex: "10 Out").
 */
function formatarData(valor) {
  if (!valor) return null;
  const d = new Date(valor);
  if (isNaN(d.getTime())) return null;

  const meses = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  const dia = String(d.getDate()).padStart(2, "0");
  return `${dia} ${meses[d.getMonth()]}`;
}

export default function GraficoHumor({ dados = [] }) {
  const dadosGrafico = (Array.isArray(dados) ? dados : [])
    .map((item) => {
      const dataFormatada = formatarData(item.data_anotacao);
      const humor = mapearHumor(item.humor_predominante);
      if (!dataFormatada || humor === null) return null;
      return { data: dataFormatada, humor };
    })
    .filter(Boolean);

  const temDados = dadosGrafico.length > 0;

  return (
    <div className="w-full h-64 bg-white p-4 rounded-xl border border-gray-100">
      <h3 className="text-sm font-bold text-gray-700 mb-4">
        Evolução do Humor
      </h3>

      {temDados ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dadosGrafico}>
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
            <YAxis
              hide
              domain={[0, 5]}
              ticks={[1, 2, 3, 4, 5]}
            />
            <Tooltip
              formatter={(value) => {
                const labels = {
                  1: "Muito Ruim",
                  2: "Ruim",
                  3: "Neutro",
                  4: "Bom",
                  5: "Muito Bom",
                };
                return [labels[value] || value, "Humor"];
              }}
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
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-sm text-gray-400 text-center">
            Nenhum registro de humor para este paciente ainda.
            <br />
            <span className="text-xs">
              O gráfico aparecerá após os primeiros prontuários.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}