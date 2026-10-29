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
  const [idConsultaSalva, setIdConsultaSalva] = useState(null);

  const [resumoIA, setResumoIA] = useState("");
  const [carregandoIA, setCarregandoIA] = useState(false);

  const [paciente, setPaciente] = useState(null);

  // Busca os dados do paciente
  useEffect(() => {
    async function buscarPaciente() {
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

        if (usuario) {
          setPaciente(usuario);
        }
      }
    }
    buscarPaciente();
  }, [pacienteId]);

  // Busca as comunicações APENAS do paciente selecionado
  useEffect(() => {
    async function buscarComunicacoes() {
      if (!pacienteId) return;

      const { data, error } = await supabase
        .from("comunicacoes")
        .select("*")
        .eq("id_cliente", pacienteId) // <-- FILTRO PELO PACIENTE
        .order("data_envio", { ascending: false });

      if (!error && data) {
        setComunicacoes(data);
      }
    }
    buscarComunicacoes();
  }, [pacienteId]); // <-- Dependência do pacienteId

  const handleSalvar = async () => {
    try {
      const idConsultaTeste = crypto.randomUUID();
      const { data, error } = await supabase.rpc("sp_realizar_consulta", {
        p_consulta_id: idConsultaTeste,
        p_id_psicologo: "33333333-3333-3333-3333-333333333333",
        p_prontuario: textoProntuario || "Texto de teste do prontuário",
        p_status_clinico: "Estável",
        p_humor_predominante: "Positivo",
        p_revisao_medicacao: false,
        p_intervencoes: "Nenhuma",
        p_plano_proximo: "Continuar acompanhamento",
      });

      if (error) {
        alert("Erro ao salvar no banco: " + error.message);
      } else {
        setIdConsultaSalva(idConsultaTeste);
        alert("Sucesso! Consulta salva.");
      }
    } catch (err) {
      alert("Erro inesperado: " + err.message);
    }
  };

  const handleEnviarFeedback = async () => {
    if (!assuntoFeedback || !mensagemFeedback) {
      alert("Por favor, preencha o assunto e a mensagem antes de enviar.");
      return;
    }
    if (!idConsultaSalva) {
      alert("Atenção: Salve o prontuário primeiro.");
      return;
    }

    try {
      const { data, error } = await supabase.rpc("sp_enviar_feedback", {
        p_id_consulta: idConsultaSalva,
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
    } catch (err) {
      alert("Erro inesperado: " + err.message);
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
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return `${idade} anos`;
  };

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-500">
            {paciente?.nome ? paciente.nome.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {paciente?.nome || "Paciente não encontrado"}
            </h1>
            <p className="text-sm text-gray-500">
              ID: {pacienteId?.substring(0, 8) || "N/A"}... •{" "}
              {calcularIdade(paciente?.data_nascimento)}
            </p>
          </div>
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
          Histórico Completo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Prontuário Clínico
          </h2>
          <EditorTexto onSalvar={setTextoProntuario} />
          <div className="mt-4 flex gap-4">
            <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
              Salvar Automaticamente
            </button>
            <button
              onClick={handleSalvar}
              className="flex-1 px-4 py-2 bg-[#005C8A] text-white rounded-lg text-sm font-medium hover:bg-[#004a70]"
            >
              Salvar com Segurança
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-[#005C8A] mb-4 flex items-center gap-2">
            ✨ Assistente Clínico IA
          </h2>
          <div className="space-y-4">
            <button
              onClick={handleGerarResumo}
              disabled={carregandoIA}
              className="w-full bg-[#005C8A] text-white py-3 rounded-xl font-medium shadow-sm hover:bg-[#004a70] disabled:opacity-50 transition-colors"
            >
              {carregandoIA
                ? "Analisando prontuário..."
                : "Gerar Resumo Inteligente"}
            </button>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 min-h-64">
              {resumoIA ? (
                <div>
                  <h3 className="text-sm font-bold text-[#005C8A] mb-2">
                    Resumo Gerado:
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {resumoIA}
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <GraficoHumor />
                  <p className="text-xs text-gray-400 mt-4 text-center">
                    Escreva no prontuário e clique no botão acima para gerar o
                    resumo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Feedback / Tarefas
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assunto
              </label>
              <input
                type="text"
                value={assuntoFeedback}
                onChange={(e) => setAssuntoFeedback(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                placeholder="Orientações da sessão"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem
              </label>
              <textarea
                value={mensagemFeedback}
                onChange={(e) => setMensagemFeedback(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm h-32"
                placeholder="Escreva o feedback..."
              ></textarea>
            </div>
            <button
              onClick={handleEnviarFeedback}
              className="w-full bg-[#005C8A] text-white py-2 rounded-lg font-medium shadow-sm hover:bg-[#004a70]"
            >
              Enviar por E-mail
            </button>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              🕒 Comunicações Anteriores
            </h3>
            {comunicacoes.length === 0 ? (
              <p className="text-xs text-gray-400">
                Nenhuma comunicação encontrada.
              </p>
            ) : (
              <div className="space-y-3">
                {comunicacoes.map((com) => (
                  <div
                    key={com.id}
                    className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
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
        <div className="p-8 text-gray-500">Carregando prontuário...</div>
      }
    >
      <ConteudoProntuario />
    </Suspense>
  );
}
