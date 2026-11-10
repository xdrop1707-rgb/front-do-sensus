"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { cancelarConsulta } from "./actions";

export default function MinhasConsultas() {
  const supabase = createClient();
  const [carregando, setCarregando] = useState(true);
  const [consultas, setConsultas] = useState([]);
  const [comunicacoes, setComunicacoes] = useState([]);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    async function buscarDados() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCarregando(false);
        return;
      }

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!usuario) {
        setCarregando(false);
        return;
      }

      const { data: cliente } = await supabase
        .from("clientes")
        .select("id")
        .eq("id_usuario", usuario.id)
        .single();

      if (!cliente) {
        setCarregando(false);
        return;
      }

      const { data: consultasData } = await supabase
        .from("consultas")
        .select(`
          id,
          data_hora_consulta,
          status,
          modalidade,
          observacoes,
          psicologos!consultas_id_psicologo_fkey (
            especialidade,
            usuarios!psicologos_id_usuario_fkey (nome)
          )
        `)
        .eq("id_cliente", cliente.id)
        .order("data_hora_consulta", { ascending: false });

      if (consultasData) setConsultas(consultasData);

      const { data: comunicacoesData } = await supabase
        .from("comunicacoes")
        .select("id, assunto, conteudo, status, data_envio")
        .eq("id_cliente", cliente.id)
        .order("data_envio", { ascending: false });

      if (comunicacoesData) setComunicacoes(comunicacoesData);

      setCarregando(false);
    }
    buscarDados();
  }, [supabase]);

  const handleCancelar = async (id) => {
    if (!window.confirm("Tem certeza que deseja cancelar esta consulta?")) {
      return;
    }

    setCancelando(true);
    const resultado = await cancelarConsulta(id);

    if (resultado.error) {
      alert("Erro ao cancelar: " + resultado.error);
    } else {
      setConsultas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "cancelada" } : c))
      );
      alert("Consulta cancelada com sucesso!");
    }
    setCancelando(false);
  };

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#004E6E] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 font-semibold">Carregando suas consultas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#004E6E]">Minhas Consultas</h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">Acompanhe seu histórico e as orientações do seu psicólogo.</p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Consultas Agendadas</h2>
          {consultas.length === 0 ? (
            <div className="bg-white border border-gray-100 p-6 rounded-2xl text-gray-500 text-center text-sm md:text-base">
              Você ainda não tem consultas agendadas.
            </div>
          ) : (
            <div className="space-y-4">
              {consultas.map((c) => (
                <div key={c.id} className="bg-white border border-gray-100 p-5 md:p-6 rounded-2xl shadow-sm">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-3">
                    <h3 className="font-bold text-base md:text-lg text-gray-800">
                      {c.psicologos?.usuarios?.nome || "Psicólogo"} — {c.psicologos?.especialidade}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase self-start ${
                      c.status === "realizada" ? "bg-green-100 text-green-700" :
                      c.status === "cancelada" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(c.data_hora_consulta).toLocaleString("pt-BR")} • {c.modalidade}
                  </p>

                  {c.observacoes && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mt-4 break-words">
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

        <section>
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Orientações e Feedbacks</h2>
          {comunicacoes.length === 0 ? (
            <div className="bg-white border border-gray-100 p-6 rounded-2xl text-gray-500 text-center text-sm md:text-base">
              Nenhuma orientação ou feedback recebido ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {comunicacoes.map((com) => (
                <div key={com.id} className="bg-white border border-gray-100 p-5 md:p-6 rounded-2xl shadow-sm">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                    <h3 className="font-bold text-base md:text-lg text-gray-800">{com.assunto}</h3>
                    <span className="text-xs text-gray-400">
                      {com.data_envio ? new Date(com.data_envio).toLocaleDateString("pt-BR") : ""}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap break-words">{com.conteudo}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
