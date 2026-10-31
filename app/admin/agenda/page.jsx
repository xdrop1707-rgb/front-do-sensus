// app/admin/agenda/page.jsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { deletarConsultaNoBanco } from "./actions";

export default function Agenda() {
  const supabase = createClient();

  const [consultas, setConsultas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [consultaSelecionada, setConsultaSelecionada] = useState(null);

  useEffect(() => {
    async function buscarConsultas() {
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
      const { data: psicologo } = await supabase
        .from("psicologos")
        .select("id")
        .eq("id_usuario", usuario.id)
        .single();

      const { data: consultasData } = await supabase
        .from("consultas")
        .select("*")
        .eq("id_psicologo", psicologo.id)
        .neq("status", "cancelada")
        .order("data_hora_consulta", { ascending: true });

      if (!consultasData) {
        setCarregando(false);
        return;
      }

      const consultasComNomes = [];
      const URL_API = "https://api-clinica-ml.onrender.com/classificar";

      for (const consulta of consultasData) {
        let nomePaciente = `Paciente (ID: ${consulta.id_cliente?.substring(0, 4) || "Desconhecido"})`;
        let emailPaciente = "E-mail não cadastrado";
        let iaNivel = "baixa";
        let iaCor = "🟢";

        const { data: cliente } = await supabase
          .from("clientes")
          .select("id_usuario")
          .eq("id", consulta.id_cliente)
          .maybeSingle();
        if (cliente && cliente.id_usuario) {
          const { data: usuarioPaciente } = await supabase
            .from("usuarios")
            .select("nome, email")
            .eq("id", cliente.id_usuario)
            .maybeSingle();
          if (usuarioPaciente) {
            nomePaciente = usuarioPaciente.nome || nomePaciente;
            emailPaciente = usuarioPaciente.email || emailPaciente;
          }
        }

        const textoParaIA =
          consulta.motivo_triagem ||
          localStorage.getItem(`motivo_consulta_${consulta.id}`) ||
          "Não informado";

        try {
          const respostaIA = await fetch(URL_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ motivo: textoParaIA }),
          });
          const dadosIA = await respostaIA.json();
          iaNivel = dadosIA.nivel;
          iaCor = dadosIA.cor;
        } catch (e) {
          console.log("Erro na IA", e);
        }

        consultasComNomes.push({
          ...consulta,
          nome_paciente: nomePaciente,
          email_paciente: emailPaciente,
          ia_nivel: iaNivel,
          ia_cor: iaCor,
          texto_triagem: textoParaIA,
        });
      }

      setConsultas(consultasComNomes);
      setCarregando(false);
    }
    buscarConsultas();
  }, []);

  const handleConfirmar = async (id_consulta) => {
    await supabase
      .from("consultas")
      .update({ status: "confirmada" })
      .eq("id", id_consulta);
    setConsultas((prev) =>
      prev.map((c) =>
        c.id === id_consulta ? { ...c, status: "confirmada" } : c,
      ),
    );
    setConsultaSelecionada(null);
    alert("Consulta confirmada!");
  };

  const handleNegar = async (id_consulta) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja NEGAR esta consulta?",
    );
    if (confirmar) {
      const resultado = await deletarConsultaNoBanco(id_consulta);
      if (resultado.error) {
        alert("Erro ao apagar: " + resultado.error);
        return;
      }
      setConsultas((prev) => prev.filter((c) => c.id !== id_consulta));
      setConsultaSelecionada(null);
    }
  };

  const consultasPorDia = consultas.reduce((acc, consulta) => {
    const dataObj = new Date(consulta.data_hora_consulta);
    const dia = dataObj.toLocaleDateString("pt-BR");
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(consulta);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 bg-[#E6F0F3] min-h-screen relative">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#004E6E]">
          Minha Agenda
        </h1>
        <p className="text-gray-600 mt-1 text-sm md:text-base">
          Acompanhe suas consultas e compromissos.
        </p>
      </div>

      {carregando ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#004E6E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#004E6E] mt-4 font-semibold">
            Analisando triagens com IA...
          </p>
        </div>
      ) : consultas.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="bg-[#E6F0F3] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[#004E6E]">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Nenhuma consulta agendada
          </h3>
          <p className="text-gray-500">Sua agenda está livre no momento.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(consultasPorDia).map(([dia, consultasDoDia]) => (
            <div key={dia}>
              {/* Cabeçalho do Dia */}
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-lg font-bold text-[#004E6E] bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
                  {dia}
                </h2>
                <div className="h-px bg-[#004E6E]/10 flex-1"></div>
              </div>

              <div className="space-y-4">
                {consultasDoDia.map((consulta) => {
                  const hora = new Date(
                    consulta.data_hora_consulta,
                  ).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <div
                      key={consulta.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow"
                    >
                      {/* Lado Esquerdo: Hora e Info */}
                      <div className="flex items-start md:items-center gap-5">
                        <div className="bg-[#E6F0F3] text-[#004E6E] font-bold p-3 rounded-xl text-lg w-24 text-center flex-shrink-0">
                          {hora}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-lg text-gray-800">
                              {consulta.nome_paciente}
                            </h3>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                                consulta.ia_nivel === "alta"
                                  ? "bg-red-100 text-red-700"
                                  : consulta.ia_nivel === "media"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                              }`}
                            >
                              {consulta.ia_cor}{" "}
                              {consulta.ia_nivel.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {consulta.tipo_agendamento || "Consulta Individual"}{" "}
                            • {consulta.modalidade || "Presencial"}
                          </p>

                          <button
                            onClick={() => setConsultaSelecionada(consulta)}
                            className="text-sm text-[#00a3c4] font-semibold hover:underline mt-2 inline-flex items-center gap-1"
                          >
                            Ver Detalhes
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Lado Direito: Status e Ações */}
                      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${
                            consulta.status === "confirmada" ||
                            consulta.status === "realizada"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {consulta.status || "Agendada"}
                        </span>
                        <button
                          onClick={() => handleNegar(consulta.id)}
                          className="px-4 py-1.5 text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
                        >
                          Negar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE DETALHES */}
      {consultaSelecionada && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#004E6E] mb-6">
              Detalhes da Consulta
            </h2>

            <div className="space-y-5 mb-8">
              <div className="bg-[#F9FAFB] p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                  Paciente
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {consultaSelecionada.nome_paciente}
                </p>
                <p className="text-sm text-gray-500">
                  {consultaSelecionada.email_paciente}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                  Motivo da Triagem
                </p>
                <p className="text-gray-700 bg-[#F9FAFB] p-4 rounded-xl border border-gray-100 italic">
                  "{consultaSelecionada.texto_triagem}"
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                  Classificação da IA
                </p>
                <span
                  className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
                    consultaSelecionada.ia_nivel === "alta"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : consultaSelecionada.ia_nivel === "media"
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        : "bg-green-100 text-green-700 border border-green-200"
                  }`}
                >
                  {consultaSelecionada.ia_cor} Urgência{" "}
                  {consultaSelecionada.ia_nivel.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-3">
              <button
                onClick={() => setConsultaSelecionada(null)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => handleConfirmar(consultaSelecionada.id)}
                disabled={consultaSelecionada.status === "confirmada"}
                className="flex-1 py-3 rounded-xl bg-[#005C8A] text-white font-semibold hover:bg-[#004a70] disabled:opacity-50 transition-colors shadow-md"
              >
                {consultaSelecionada.status === "confirmada"
                  ? "Já Confirmada"
                  : "Confirmar Consulta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
