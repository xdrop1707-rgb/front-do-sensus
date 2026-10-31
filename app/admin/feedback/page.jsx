// app/admin/feedback/page.jsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CentralFeedback() {
  const supabase = createClient();

  const [comunicacoes, setComunicacoes] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarComunicacoes() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !user.email) {
        setCarregando(false);
        return;
      }

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("id")
        .eq("email", user.email)
        .single();
      if (!usuario) {
        setCarregando(false);
        return;
      }

      const { data: psicologo } = await supabase
        .from("psicologos")
        .select("id")
        .eq("id_usuario", usuario.id)
        .single();
      if (!psicologo) {
        setCarregando(false);
        return;
      }

      const { data, error } = await supabase
        .from("comunicacoes")
        .select("*")
        .eq("id_psicologo", psicologo.id)
        .order("data_envio", { ascending: false });

      if (!error && data) {
        setComunicacoes(data);
      }
      setCarregando(false);
    }
    buscarComunicacoes();
  }, []);

  const handleExcluir = async (id) => {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir este feedback? Essa ação não pode ser desfeita.",
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("comunicacoes")
        .delete()
        .eq("id", id);
      if (error) {
        alert("Erro ao excluir: " + error.message);
      } else {
        setComunicacoes((prev) => prev.filter((com) => com.id !== id));
      }
    } catch (err) {
      alert("Erro inesperado: " + err.message);
    }
  };

  const comunicacoesFiltradas = comunicacoes.filter((com) => {
    const termoBusca = busca.toLowerCase();
    const assunto = (com.assunto || "").toLowerCase();
    const conteudo = (com.conteudo || "").toLowerCase();
    return assunto.includes(termoBusca) || conteudo.includes(termoBusca);
  });

  return (
    <div className="p-4 md:p-8 bg-[#E6F0F3] min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#004E6E]">
          Central de Feedback
        </h1>
        <p className="text-gray-600 mt-1 text-sm md:text-base">
          Histórico de todas as comunicações que você enviou.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8">
        {/* Barra de Busca */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por assunto ou conteúdo..."
              className="w-full pl-10 pr-4 border border-gray-300 rounded-xl py-2.5 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none transition-all"
            />
          </div>
        </div>

        {carregando ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#004E6E] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4 font-medium">
              Carregando feedbacks...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comunicacoesFiltradas.length > 0 ? (
              comunicacoesFiltradas.map((com) => (
                <div
                  key={com.id}
                  className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white group"
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
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {com.assunto}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {com.tipo || "Orientação"} • Enviado em{" "}
                          {com.data_envio
                            ? new Date(com.data_envio).toLocaleDateString(
                                "pt-BR",
                              )
                            : "Data indisponível"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-start">
                      <span className="bg-green-100 text-green-700 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                        {com.status || "ENVIADO"}
                      </span>
                      <button
                        onClick={() => handleExcluir(com.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir feedback"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#F9FAFB] p-4 rounded-xl border border-gray-50 mt-4">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {com.conteudo}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
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
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Nenhum feedback encontrado
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Você ainda não enviou nenhuma orientação ou feedback para seus
                  pacientes.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
