"use client";

import { useState, useEffect } from "react";
import { buscarMinhasConsultas, cancelarConsulta } from "./actions";

export default function MinhasConsultas() {
  const [carregando, setCarregando] = useState(true);
  const [consultas, setConsultas] = useState([]);
  const [cancelando, setCancelando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function carregarConsultas() {
      const resultado = await buscarMinhasConsultas();
      if (resultado.error) {
        setMensagem(resultado.error);
      } else {
        setConsultas(resultado.consultas || []);
      }
      setCarregando(false);
    }
    carregarConsultas();
  }, []);

  const handleCancelar = async (id) => {
    if (!window.confirm("Tem certeza que deseja cancelar esta consulta?")) {
      return;
    }
    setCancelando(true);
    const resultado = await cancelarConsulta(id);
    if (resultado.error) {
      alert("Erro ao cancelar: " + resultado.error);
    } else {
      // Remove a consulta da lista imediatamente
      setConsultas((prev) => prev.filter((c) => c.id !== id));
      alert("Consulta cancelada com sucesso!");
    }
    setCancelando(false);
  };

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#E6F0F3]">
        <div className="w-12 h-12 border-4 border-[#004E6E] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#004E6E] mt-4 font-semibold">
          Carregando suas consultas...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[80vh] bg-[#E6F0F3] py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#004E6E]">
            Minhas Consultas
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Acompanhe seu histórico e as orientações do seu psicólogo.
          </p>
        </div>

        {mensagem && (
          <div className="p-4 rounded-lg mb-6 text-sm bg-red-100 text-red-700">
            {mensagem}
          </div>
        )}

        <div className="space-y-8">
          <section>
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
              Consultas Agendadas
            </h2>
            {consultas.length === 0 ? (
              <div className="bg-white border border-gray-100 p-6 rounded-2xl text-gray-500 text-center text-sm md:text-base shadow-sm">
                Você ainda não tem consultas agendadas.
              </div>
            ) : (
              <div className="space-y-4">
                {consultas.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white border border-gray-100 p-5 md:p-6 rounded-2xl shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-3">
                      <h3 className="font-bold text-base md:text-lg text-[#004E6E]">
                        {c.psicologo_nome} — {c.psicologo_especialidade}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase self-start ${
                          c.status === "realizada"
                            ? "bg-green-100 text-green-700"
                            : c.status === "cancelada"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(c.data_hora_consulta).toLocaleString("pt-BR")} •{" "}
                      {c.modalidade}
                    </p>

                    {/* Bloco de Pagamento removido para não quebrar a tela */}

                    {c.observacoes && (
                      <p className="text-sm text-gray-600 bg-[#F9FAFB] p-3 rounded-lg mt-4 break-words">
                        <strong>Observações:</strong> {c.observacoes}
                      </p>
                    )}

                    {c.status === "agendada" && (
                      <button
                        onClick={() => handleCancelar(c.id)}
                        disabled={cancelando}
                        className="mt-4 px-4 py-2 text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
                      >
                        Cancelar Consulta
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
