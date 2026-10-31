// app/admin/prontuario/page.jsx
"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import GraficoHumor from "./GraficoTest";
import { useSearchParams } from "next/navigation";

const EditorTexto = dynamic(() => import("./EditorTexto"), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-200 rounded-xl bg-white p-4 h-[300px] flex items-center justify-center text-gray-400">
      Carregando editor...
    </div>
  ),
});

function ConteudoProntuario() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const pacienteId = searchParams.get("id");

  const [textoProntuario, setTextoProntuario] = useState("");
  const [assuntoFeedback, setAssuntoFeedback] = useState("");
  const [mensagemFeedback, setMensagemFeedback] = useState("");
  const [comunicacoes, setComunicacoes] = useState([]);
  const [consultaAtual, setConsultaAtual] = useState(null);
  const [resumoIA, setResumoIA] = useState("");
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [paciente, setPaciente] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function buscarDados() {
      if (!pacienteId) return;

      const { data: cliente } = await supabase
        .from("clientes")
        .select("id_usuario")
        .eq("id", pacienteId)
        .maybeSingle();

      if (cliente && cliente.id_usuario) {
        const { data: usuario } = await supabase
          .from("usuarios")
          .select("nome, email, data_nascimento")
          .eq("id", cliente.id_usuario)
          .maybeSingle();

        if (usuario) setPaciente(usuario);
      }

      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        const { data: usuarioLogado } = await supabase
          .from("usuarios")
          .select("id")
          .eq("auth_user_id", user.user.id)
          .single();

        if (usuarioLogado) {
          const { data: psicologo } = await supabase
            .from("psicologos")
            .select("id")
            .eq("id_usuario", usuarioLogado.id)
            .single();

          if (psicologo) {
            const { data: consulta } = await supabase
              .from("consultas")
              .select("id, data_hora_consulta, status")
              .eq("id_cliente", pacienteId)
              .eq("id_psicologo", psicologo.id)
              .in("status", ["agendada", "confirmada", "em_andamento"])
              .order("data_hora_consulta", { ascending: true })
              .limit(1)
              .maybeSingle();

            if (consulta) setConsultaAtual(consulta);
          }
        }
      }

      const { data, error } = await supabase
        .from("comunicacoes")
        .select("*")
        .eq("id_cliente", pacienteId)
        .order("data_envio", { ascending: false });

      if (!error && data) setComunicacoes(data);
    }

    buscarDados();
  }, [pacienteId]);

  const handleSalvar = async () => {
    if (!consultaAtual) {
      alert(
        "Não há consulta agendada para este paciente. Agende uma consulta primeiro.",
      );
      return;
    }

    if (!textoProntuario) {
      alert("Escreva algo no prontuário antes de salvar.");
      return;
    }

    setSalvando(true);

    const { error } = await supabase.rpc("sp_realizar_consulta", {
      p_consulta_id: consultaAtual.id,
      p_prontuario: textoProntuario,
      p_status_clinico: "Estável",
      p_humor_predominante: "Positivo",
      p_revisao_medicacao: false,
      p_intervencoes: "Nenhuma",
      p_plano_proximo: "Continuar acompanhamento",
    });

    if (error) {
      alert("Erro ao salvar no banco: " + error.message);
    } else {
      alert("Prontuário salvo com sucesso!");
      setConsultaAtual(null);
      setTextoProntuario("");
    }

    setSalvando(false);
  };

  const handleEnviarFeedback = async () => {
    if (!assuntoFeedback || !mensagemFeedback) {
      alert("Por favor, preencha o assunto e a mensagem antes de enviar.");
      return;
    }

    if (!consultaAtual) {
      alert(
        "Atenção: Salve o prontuário primeiro para vincular o feedback à consulta.",
      );
      return;
    }

    const { error } = await supabase.rpc("sp_enviar_feedback", {
      p_id_consulta: consultaAtual.id,
      p_assunto: assuntoFeedback,
      p_conteudo: mensagemFeedback,
      p_tipo: "feedback",
    });

    if (error) {
      alert("Erro ao enviar feedback: " + error.message);
    } else {
      alert("Feedback enviado com sucesso!");
      setAssuntoFeedback("");
      setMensagemFeedback("");
      window.location.reload();
    }
  };

  const handleGerarResumo = async () => {
    if (!textoProntuario) {
      alert("Escreva algo no prontuário primeiro para a IA resumir.");
      return;
    }

    setCarregandoIA(true);
    setResumoIA("");

    try {
      const response = await fetch("/api/ia/resumo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: textoProntuario }),
      });

      const data = await response.json();

      if (data.error) {
        alert("Erro da IA: " + data.error);
      } else {
        setResumoIA(data.resumo);
      }
    } catch (err) {
      alert("Erro de conexão com a IA: " + err.message);
    } finally {
      setCarregandoIA(false);
    }
  };

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return "Idade não informada";
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate()))
      idade--;
    return `${idade} anos`;
  };

  return (
    <div className="p-4 md:p-8 bg-[#E6F0F3] min-h-screen">
      {/* CABEÇALHO DO PACIENTE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#E6F0F3] rounded-full flex items-center justify-center text-2xl font-bold text-[#005C8A]">
            {paciente?.nome ? paciente.nome.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#004E6E]">
              {paciente?.nome || "Paciente não encontrado"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ID: {pacienteId?.substring(0, 8) || "N/A"}... •{" "}
              {calcularIdade(paciente?.data_nascimento)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {consultaAtual ? (
            <span className="px-4 py-2 bg-green-100 text-green-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Consulta:{" "}
              {new Date(consultaAtual.data_hora_consulta).toLocaleString(
                "pt-BR",
              )}
            </span>
          ) : (
            <span className="px-4 py-2 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              Sem consulta agendada
            </span>
          )}
          <button className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors bg-white shadow-sm">
            Histórico Completo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUNA 1: PRONTUÁRIO */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h2 className="text-lg font-bold text-[#004E6E] mb-4 flex items-center gap-2">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Prontuário Clínico
          </h2>
          <div className="flex-1">
            <EditorTexto onSalvar={setTextoProntuario} />
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Salvar Automático
            </button>
            <button
              onClick={handleSalvar}
              disabled={salvando || !consultaAtual}
              className="flex-1 px-4 py-2.5 bg-[#005C8A] text-white rounded-xl text-sm font-semibold hover:bg-[#004a70] disabled:opacity-50 transition-colors shadow-md shadow-[#005C8A]/20"
            >
              {salvando ? "Salvando..." : "Salvar com Segurança"}
            </button>
          </div>
        </div>

        {/* COLUNA 2: IA E GRÁFICO */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h2 className="text-lg font-bold text-[#004E6E] mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[#00a3c4]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Assistente Clínico IA
          </h2>
          <div className="space-y-4 flex-1 flex flex-col">
            <button
              onClick={handleGerarResumo}
              disabled={carregandoIA}
              className="w-full bg-[#00a3c4] text-white py-3 rounded-xl font-semibold shadow-md shadow-[#00a3c4]/20 hover:bg-opacity-90 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
            >
              {carregandoIA ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analisando...
                </>
              ) : (
                "Gerar Resumo Inteligente"
              )}
            </button>

            <div className="bg-[#F9FAFB] border border-gray-100 rounded-2xl p-4 flex-1 flex flex-col justify-center min-h-[250px]">
              {resumoIA ? (
                <div className="h-full">
                  <h3 className="text-sm font-bold text-[#004E6E] mb-2">
                    Resumo Gerado:
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {resumoIA}
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <GraficoHumor />
                  <p className="text-xs text-gray-400 mt-4 text-center max-w-[200px]">
                    Escreva no prontuário e clique no botão acima para a IA
                    gerar um resumo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUNA 3: FEEDBACK */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h2 className="text-lg font-bold text-[#004E6E] mb-4 flex items-center gap-2">
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
            Feedback / Tarefas
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Assunto
              </label>
              <input
                type="text"
                value={assuntoFeedback}
                onChange={(e) => setAssuntoFeedback(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none transition-all"
                placeholder="Orientações da sessão"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mensagem
              </label>
              <textarea
                value={mensagemFeedback}
                onChange={(e) => setMensagemFeedback(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm h-32 focus:ring-2 focus:ring-[#005C8A] outline-none transition-all resize-none"
                placeholder="Escreva o feedback para o paciente..."
              ></textarea>
            </div>
            <button
              onClick={handleEnviarFeedback}
              className="w-full bg-[#005C8A] text-white py-3 rounded-xl font-semibold shadow-md shadow-[#005C8A]/20 hover:bg-[#004a70] transition-all"
            >
              Enviar por E-mail
            </button>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Comunicações Anteriores
            </h3>
            {comunicacoes.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-xl">
                Nenhuma comunicação encontrada.
              </p>
            ) : (
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                {comunicacoes.map((com) => (
                  <div
                    key={com.id}
                    className="bg-[#F9FAFB] p-3 rounded-xl border border-gray-100 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {com.assunto}
                      </p>
                      <p className="text-xs text-gray-500">
                        {com.data_envio
                          ? new Date(com.data_envio).toLocaleDateString("pt-BR")
                          : "Data indisponível"}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase">
                      {com.status || "ENVIADO"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TelaProntuario() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#E6F0F3]">
          <div className="w-12 h-12 border-4 border-[#004E6E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#004E6E] mt-4 font-semibold">
            Carregando prontuário...
          </p>
        </div>
      }
    >
      <ConteudoProntuario />
    </Suspense>
  );
}
