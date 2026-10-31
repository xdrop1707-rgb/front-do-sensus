"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function Especialistas() {
  const [psicologos, setPsicologos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("Todos");
  const supabase = createClient();

  useEffect(() => {
    async function buscarPsicologos() {
      const { data, error } = await supabase
        .from("psicologos")
        .select(
          `
          id,
          especialidade,
          campus,
          sala,
          disponivel,
          usuarios!psicologos_id_usuario_fkey (nome)
        `,
        )
        .eq("disponivel", true);

      if (!error && data) {
        setPsicologos(data);
      }
      setCarregando(false);
    }
    buscarPsicologos();
  }, [supabase]);

  const filtrados =
    filtro === "Todos"
      ? psicologos
      : psicologos.filter((p) => p.modalidade === filtro);

  return (
    <div className="w-full min-h-[70vh] bg-[#F9FAFB] py-12 md:py-20 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex-1 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#004E6E]">
            Horários Disponíveis
          </h1>
          <span className="bg-white text-gray-600 text-[11px] px-3 py-1.5 rounded-full font-bold tracking-wide border border-gray-200 shadow-sm">
            Mostrando {filtrados.length} resultados
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {["Todos", "Presencial", "Online"].map((opcao) => (
            <button
              key={opcao}
              onClick={() => setFiltro(opcao)}
              className={`px-5 py-2 rounded-full text-xs font-bold border transition-colors ${
                filtro === opcao
                  ? "bg-[#004E6E] text-white border-[#004E6E]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#004E6E] hover:text-[#004E6E] shadow-sm"
              }`}
            >
              {opcao}
            </button>
          ))}
        </div>

        {carregando ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#004E6E] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4 font-semibold">
              Carregando especialistas...
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filtrados.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-5">
                    <span className="text-[11px] px-2.5 py-1 rounded-md font-bold bg-[#E6F0F3] text-[#004E6E]">
                      Online e Presencial
                    </span>
                  </div>

                  <h2 className="text-lg md:text-[17px] font-bold text-gray-800 mb-2">
                    {p.usuarios?.nome}
                  </h2>
                  <p className="text-gray-500 text-sm mb-6 flex-grow leading-snug">
                    {p.especialidade}
                  </p>

                  <div className="space-y-2.5 text-xs text-gray-500 mb-8">
                    <p className="flex items-center gap-2.5">
                      <svg
                        className="w-4 h-4 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                      <span>
                        {p.campus || "Campus Central"} -{" "}
                        {p.sala || "Consultório"}
                      </span>
                    </p>
                  </div>

                  <Link
                    href={`/agendamento?psicologo=${p.id}`}
                    className="w-full border border-gray-300 text-gray-700 rounded-full py-2.5 text-sm font-semibold hover:bg-[#004E6E] hover:text-white hover:border-[#004E6E] transition-colors text-center block"
                  >
                    Selecionar Horário
                  </Link>
                </div>
              ))}
            </div>

            {/* 👇 Banner Menor e mais Discreto 👇 */}
            <div className="bg-[#004E6E] rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white mb-1">
                  Não sabe por onde começar?
                </h2>
                <p className="text-blue-100 text-sm">
                  Faça nossa triagem e a IA te ajuda a encontrar o profissional
                  ideal.
                </p>
              </div>
              <Link
                href="/triagem"
                className="whitespace-nowrap bg-[#00a3c4] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-opacity-90 transition"
              >
                Fazer Triagem
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
