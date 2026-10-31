// app/admin/page.jsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function Dashboard() {
  const supabase = createClient();
  const [carregando, setCarregando] = useState(true);
  const [dados, setDados] = useState({
    totalPacientes: 0,
    triagensPendentes: 0,
    sessoesHoje: 0,
    proximasConsultas: [], // Lista para preencher
  });

  useEffect(() => {
    async function carregarDashboard() {
      // 1. Busca total de pacientes
      const { data: pacientesData } = await supabase
        .from("vw_pacientes_ativos")
        .select("id");

      // 2. Busca as próximas consultas de hoje/amanhã para simular
      const { data: consultasData } = await supabase
        .from("consultas")
        .select(
          `
          id, 
          data_hora_consulta, 
          status,
          observacoes,
          clientes (usuarios (nome))
        `,
        )
        .order("data_hora_consulta", { ascending: true })
        .limit(3); // Pega as 3 primeiras da lista

      // Formata os dados para a tela
      const proximas =
        consultasData?.map((c) => ({
          id: c.id,
          hora: new Date(c.data_hora_consulta).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          paciente: c.clientes?.usuarios?.nome || "Paciente",
          // Simulando a cor da IA baseada no texto para visual (o correto seria salvar no banco)
          statusIA:
            c.observacoes?.includes("machucar") ||
            c.observacoes?.includes("desistir")
              ? "alta"
              : "baixa",
        })) || [];

      setDados({
        totalPacientes: pacientesData?.length || 0,
        triagensPendentes: 1,
        sessoesHoje: 1,
        proximasConsultas: proximas,
      });

      setCarregando(false);
    }
    carregarDashboard();
  }, [supabase]);

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#E6F0F3]">
        <div className="w-12 h-12 border-4 border-[#004E6E] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#004E6E] mt-4 font-semibold">
          Carregando painel...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-[#E6F0F3] min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#004E6E]">
          Olá, Psicólogo(a)!
        </h1>
        <p className="text-gray-600 mt-1 text-sm md:text-base">
          Aqui está o resumo do seu dia na clínica.
        </p>
      </div>

      {/* CARDS DE ESTATÍSTICA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium text-sm mb-1">
              Pacientes Ativos
            </p>
            <h2 className="text-4xl font-bold text-[#005C8A]">
              {dados.totalPacientes}
            </h2>
          </div>
          <div className="bg-[#E6F0F3] p-4 rounded-2xl text-[#005C8A]">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium text-sm mb-1">
              Triagens Pendentes
            </p>
            <h2 className="text-4xl font-bold text-yellow-600">
              {dados.triagensPendentes}
            </h2>
          </div>
          <div className="bg-yellow-50 p-4 rounded-2xl text-yellow-600">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium text-sm mb-1">
              Sessões Hoje
            </p>
            <h2 className="text-4xl font-bold text-[#00a3c4]">
              {dados.sessoesHoje}
            </h2>
          </div>
          <div className="bg-[#E6F0F3] p-4 rounded-2xl text-[#00a3c4]">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 👇 ÁREA INFERIOR: INFORMAÇÕES ÚTEIS 👇 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Próximas Consultas (Ocupa 2 colunas no PC) */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#004E6E]">
              Próximas Consultas
            </h2>
            <Link
              href="/admin/agenda"
              className="text-sm font-semibold text-[#00a3c4] hover:underline"
            >
              Ver Agenda Completa
            </Link>
          </div>

          <div className="space-y-4">
            {dados.proximasConsultas.length > 0 ? (
              dados.proximasConsultas.map((consulta) => (
                <div
                  key={consulta.id}
                  className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-2xl border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white text-[#004E6E] font-bold p-3 rounded-xl shadow-sm border border-gray-100 min-w-[70px] text-center">
                      {consulta.hora}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        {consulta.paciente}
                      </p>
                      <p className="text-sm text-gray-500">
                        Consulta Individual • Presencial
                      </p>
                    </div>
                  </div>
                  {consulta.statusIA === "alta" ? (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                      🔴 Alta
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                      🟢 Baixa
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-6">
                Nenhuma consulta agendada para os próximos dias.
              </p>
            )}
          </div>
        </div>

        {/* 2. Card da IA (Ocupa 1 coluna) */}
        <div className="bg-[#004E6E] rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>

          <div className="relative z-10">
            <div className="inline-block bg-[#00a3c4] text-white text-[10px] font-bold px-2 py-1 rounded mb-4 uppercase tracking-wide">
              Inteligência Artificial
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Triagem Inteligente Ativa
            </h2>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed">
              O modelo está analisando os sintomas relatados pelos pacientes e
              classificando a urgência em tempo real.
            </p>
            <Link
              href="/admin/agenda"
              className="inline-block bg-[#00a3c4] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-opacity-90 transition"
            >
              Ver Triagens na Agenda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
