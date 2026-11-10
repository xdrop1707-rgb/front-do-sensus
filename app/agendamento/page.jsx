"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { agendarConsulta } from "./actions";

const HORARIOS_BASE = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

function gerarHorariosDisponiveis(dataSelecionada) {
  if (!dataSelecionada) return HORARIOS_BASE;

  const agora = new Date();
  const dataHoje = agora.toISOString().split("T")[0];

  if (dataSelecionada !== dataHoje) return HORARIOS_BASE;

  const limite = agora.getTime() + 30 * 60 * 1000;

  return HORARIOS_BASE.filter((h) => {
    const [hh, mm] = h.split(":").map(Number);
    const horarioDate = new Date();
    horarioDate.setHours(hh, mm, 0, 0);
    return horarioDate.getTime() > limite;
  });
}

export default function Agendamento() {
  const [psicologos, setPsicologos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [precisaTriagem, setPrecisaTriagem] = useState(false);
  const [profissional, setProfissional] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [modalidade, setModalidade] = useState("presencial");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // ✅ Flag de montagem no cliente (evita prerender de data)
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMontado(true);

    const supabase = createClient();

    async function verificarTriagemEBuscarPsicologos() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setCarregando(false);
        return;
      }

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (usuario) {
        const { data: cliente } = await supabase
          .from("clientes")
          .select("id")
          .eq("id_usuario", usuario.id)
          .single();

        if (!cliente) {
          setPrecisaTriagem(true);
          setCarregando(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from("psicologos")
        .select(
          `
          id,
          especialidade,
          valor_consulta,
          usuarios!psicologos_id_usuario_fkey (nome)
        `,
        )
        .eq("disponivel", true);

      if (!error && data) setPsicologos(data);
      setCarregando(false);
    }

    verificarTriagemEBuscarPsicologos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensagem("");

    const horariosValidos = gerarHorariosDisponiveis(data);
    if (!horariosValidos.includes(horario)) {
      setMensagem(
        "Este horário não está mais disponível. Escolha outro horário ou data.",
      );
      setEnviando(false);
      return;
    }

    const motivoTriagemSalvo =
      localStorage.getItem("motivo_triagem") ||
      "Paciente não detalhou o motivo";

    const formData = new FormData();
    formData.append("psicologo", profissional);
    formData.append("data", data);
    formData.append("horario", horario);
    formData.append("modalidade", modalidade);
    formData.append("motivo_triagem", motivoTriagemSalvo);

    const resultado = await agendarConsulta(formData);

    if (resultado.error) {
      setMensagem(`Erro: ${resultado.error}`);
    } else {
      setSucesso(true);
    }
    setEnviando(false);
  };

  const psicologoSelecionado = psicologos.find((p) => p.id === profissional);

  if (carregando) {
    return (
      <div className="w-full min-h-[80vh] bg-[#E6F0F3] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#004E6E] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4 font-semibold">Carregando...</p>
      </div>
    );
  }

  if (precisaTriagem) {
    return (
      <div className="w-full min-h-[80vh] bg-[#E6F0F3] py-12 md:py-20 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 md:px-8 w-full">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 text-center shadow-xl">
            <h1 className="text-2xl font-bold text-[#004E6E] mb-4">
              Triagem Necessária
            </h1>
            <p className="text-gray-500 mb-8">
              Antes de agendar uma consulta, precisamos entender como podemos te
              ajudar. Por favor, faça sua triagem primeiro.
            </p>
            <Link
              href="/triagem"
              className="inline-block bg-[#00a3c4] text-white px-6 py-3 rounded-full font-semibold hover:bg-opacity-90 shadow-md transition"
            >
              Fazer Triagem Agora
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="w-full min-h-[80vh] bg-[#E6F0F3] py-12 md:py-20 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 md:px-8 w-full">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 text-center shadow-xl">
            <h1 className="text-3xl font-bold text-[#004E6E] mb-4">
              Agendamento Solicitado!
            </h1>
            <p className="text-gray-500 mb-8">
              Sua consulta foi agendada com sucesso.
            </p>
            <Link
              href="/"
              className="inline-block bg-[#00a3c4] text-white px-6 py-3 rounded-full font-semibold hover:bg-opacity-90 shadow-md transition"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[80vh] bg-[#E6F0F3] py-12 md:py-20">
      <div className="max-w-2xl mx-auto px-4 md:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#004E6E] mb-2">
          Solicitar Agendamento
        </h1>
        <p className="text-gray-600 mb-8 text-sm md:text-base">
          Escolha o profissional, a data e o horário de sua preferência.
        </p>

        {mensagem && (
          <div className="p-4 rounded-lg mb-6 text-sm bg-red-100 text-red-700 border border-red-200">
            {mensagem}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl"
        >
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Profissional
            </label>
            <select
              value={profissional}
              onChange={(e) => setProfissional(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm md:text-base focus:ring-2 focus:ring-[#004E6E] outline-none"
              required
            >
              <option value="">Selecione um profissional</option>
              {psicologos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.usuarios?.nome} — {p.especialidade} (R${" "}
                  {p.valor_consulta?.toFixed(2).replace(".", ",") || "0,00"})
                </option>
              ))}
            </select>
          </div>

          {psicologoSelecionado && (
            <div className="bg-[#E6F0F3] p-4 rounded-xl border border-[#004E6E]/10">
              <p className="text-sm text-gray-600">
                Valor da consulta:{" "}
                <strong className="text-[#004E6E]">
                  R${" "}
                  {psicologoSelecionado.valor_consulta
                    ?.toFixed(2)
                    .replace(".", ",") || "0,00"}
                </strong>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Modalidade
            </label>
            <div className="flex gap-4">
              {["presencial", "online"].map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setModalidade(mod)}
                  className={`flex-1 py-3 rounded-lg border font-semibold capitalize transition-colors ${
                    modalidade === mod
                      ? "bg-[#004E6E] text-white border-[#004E6E]"
                      : "bg-white text-[#004E6E] border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Data
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => {
                setData(e.target.value);
                setHorario("");
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm md:text-base focus:ring-2 focus:ring-[#004E6E] outline-none"
              required
              min={montado ? new Date().toISOString().split("T")[0] : undefined}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Horário disponível
            </label>
            <div className="grid grid-cols-3 gap-3">
              {gerarHorariosDisponiveis(data).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHorario(h)}
                  className={`py-2 rounded-lg border font-semibold transition-colors ${
                    horario === h
                      ? "bg-[#004E6E] text-white border-[#004E6E]"
                      : "bg-white text-[#004E6E] border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {h}
                </button>
              ))}
              {gerarHorariosDisponiveis(data).length === 0 && (
                <p className="col-span-3 text-sm text-gray-500 text-center py-2">
                  Não há horários disponíveis para hoje. Escolha outra data.
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full flex justify-center items-center gap-2 bg-[#00a3c4] text-white rounded-full py-3 font-semibold hover:bg-opacity-90 disabled:opacity-50 transition-all shadow-md mt-4"
          >
            {enviando ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Agendando...
              </>
            ) : (
              "Confirmar Agendamento"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}