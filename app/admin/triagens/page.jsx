"use client";

import { useState, useEffect } from "react";
import { buscarTriagensPendentes } from "./actions";
import Link from "next/link";

export default function TriagensPendentes() {
  const [triagens, setTriagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function carregarTriagens() {
      const resultado = await buscarTriagensPendentes();
      if (resultado.error) {
        setMensagem(resultado.error);
      } else {
        setTriagens(resultado.triagens || []);
      }
      setCarregando(false);
    }
    carregarTriagens();
  }, []);

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#E6F0F3]">
        <div className="w-12 h-12 border-4 border-[#004E6E] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#004E6E] mt-4 font-semibold">
          Carregando triagens...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-[#E6F0F3] min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#004E6E]">
          Triagens Pendentes
        </h1>
        <p className="text-gray-600 mt-1 text-sm md:text-base">
          Analise as solicitações de triagem e inicie o atendimento.
        </p>
      </div>

      {mensagem && (
        <div className="p-4 rounded-lg mb-6 text-sm bg-red-100 text-red-700">
          {mensagem}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
        {triagens.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-[#E6F0F3] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#004E6E]">
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Nenhuma triagem pendente
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Todas as triagens foram analisadas. Bom trabalho!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {triagens.map((t) => (
              <div
                key={t.id}
                className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-[#E6F0F3] p-2.5 rounded-xl text-[#004E6E] flex-shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {t.paciente_nome || "Paciente"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {t.paciente_email || ""} • Solicitado em{" "}
                        {new Date(t.data_solicitacao).toLocaleDateString(
                          "pt-BR",
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-start">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        t.prioridade === "emergencia"
                          ? "bg-red-100 text-red-700"
                          : t.prioridade === "alta"
                            ? "bg-orange-100 text-orange-700"
                            : t.prioridade === "normal"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                      }`}
                    >
                      {t.prioridade || "normal"}
                    </span>
                    <Link
                      href={`/admin/prontuario?id=${t.paciente_id}`}
                      className="px-4 py-2 bg-[#005C8A] text-white rounded-lg text-xs font-semibold hover:bg-[#004a70] transition-colors"
                    >
                      Agendar / Atender
                    </Link>
                  </div>
                </div>

                <div className="bg-[#F9FAFB] p-4 rounded-xl border border-gray-50 mt-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {t.motivo || "Nenhum motivo informado."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
