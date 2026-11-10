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
  });

  useEffect(() => {
    async function carregarDashboard() {
      // 1. Busca pacientes ativos
      const { data: pacientesData } = await supabase
        .from("vw_pacientes_ativos")
        .select("id");

      // 2. Busca triagens pendentes reais (contando todas as que estão na tabela)
      const { data: triagensData } = await supabase
        .from("triagens")
        .select("id");

      // 3. Busca as consultas de HOJE
      const hoje = new Date().toISOString().split("T")[0];
      const { data: consultasHoje } = await supabase
        .from("consultas")
        .select("id")
        .gte("data_hora_consulta", `${hoje}T00:00:00`)
        .lte("data_hora_consulta", `${hoje}T23:59:59`);

      setDados({
        totalPacientes: pacientesData?.length || 0,
        // 👇 Aqui ele conta o tamanho do array de triagens do banco 👇
        triagensPendentes: triagensData?.length || 0,
        sessoesHoje: consultasHoje?.length || 0,
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        {/* Card Pacientes */}
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

        {/* Card Triagens */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium text-sm mb-1">
              Triagens Pendentes
            </p>
            {/* 👇 Exibindo o número real 👇 */}
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

        {/* Card Sessões */}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#004E6E]">Ações Rápidas</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin/novo-registro"
              className="flex flex-col items-center justify-center p-4 bg-[#F9FAFB] rounded-2xl hover:bg-[#E6F0F3] transition-colors border border-gray-100 text-center group"
            >
              <span className="text-sm font-semibold text-gray-700">
                Novo Paciente
              </span>
            </Link>
            <Link
              href="/admin/triagens"
              className="flex flex-col items-center justify-center p-4 bg-[#F9FAFB] rounded-2xl hover:bg-[#E6F0F3] transition-colors border border-gray-100 text-center group"
            >
              <span className="text-sm font-semibold text-gray-700">
                Ver Triagens
              </span>
            </Link>
          </div>
        </div>

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
              O modelo está analisando os sintomas dos pacientes em tempo real.
            </p>
            <Link
              href="/admin/agenda"
              className="inline-block bg-[#00a3c4] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-opacity-90 transition"
            >
              Ver Agenda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
