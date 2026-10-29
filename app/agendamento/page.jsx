"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { agendarConsulta } from "./actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

const horariosDisponiveis = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

export default function Agendamento() {
  const [psicologos, setPsicologos] = useState([]);
  const [carregandoPsicologos, setCarregandoPsicologos] = useState(true);
  const [profissional, setProfissional] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [modalidade, setModalidade] = useState("presencial");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  // Busca a lista de psicólogos do banco
  useEffect(() => {
    async function buscarPsicologos() {
      const { data, error } = await supabase
        .from("psicologos")
        .select(`
          id,
          especialidade,
          campus,
          sala,
          usuarios!psicologos_id_usuario_fkey (nome)
        `)
        .eq("disponivel", true);

      if (!error && data) {
        setPsicologos(data);
      }
      setCarregandoPsicologos(false);
    }
    buscarPsicologos();
  }, [supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensagem("");

    const formData = new FormData();
    formData.append("psicologo", profissional);
    formData.append("data", data);
    formData.append("horario", horario);
    formData.append("modalidade", modalidade);

    const resultado = await agendarConsulta(formData);

    if (resultado.error) {
      setMensagem(`Erro: ${resultado.error}`);
    } else {
      setSucesso(true);
    }
    setEnviando(false);
  };

  if (sucesso) {
    return (
      <div className="max-w-2xl mx-auto px-8 py-16 text-center">
        <div className="bg-white border border-sensus-border rounded-2xl p-12">
          <h1 className="text-3xl font-bold text-sensus-primary mb-4">Agendamento Solicitado!</h1>
          <p className="text-sensus-muted mb-8">Sua consulta foi agendada com sucesso. Você receberá um lembrete por e-mail.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/especialistas" className="bg-sensus-primary text-white px-6 py-3 rounded-full font-semibold">
              Ver Outros Horários
            </Link>
            <Link href="/" className="border border-sensus-border px-6 py-3 rounded-full font-semibold">
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-16">
      <h1 className="text-3xl font-bold text-sensus-primary mb-2">Solicitar Agendamento</h1>
      <p className="text-sensus-muted mb-8">Escolha o profissional, a data e o horário de sua preferência.</p>

      {mensagem && (
        <div className="p-4 rounded-lg mb-6 text-sm bg-red-100 text-red-700">{mensagem}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-sensus-border rounded-2xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Profissional</label>
          <select
            value={profissional}
            onChange={(e) => setProfissional(e.target.value)}
            className="w-full border border-sensus-border rounded-lg px-4 py-3"
            required
            disabled={carregandoPsicologos}
          >
            <option value="">
              {carregandoPsicologos ? "Carregando..." : "Selecione um profissional"}
            </option>
            {psicologos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.usuarios?.nome} — {p.especialidade}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Modalidade</label>
          <div className="flex gap-4">
            {["presencial", "online"].map((mod) => (
              <button
                key={mod}
                type="button"
                onClick={() => setModalidade(mod)}
                className={`flex-1 py-3 rounded-lg border font-semibold capitalize ${
                  modalidade === mod
                    ? "bg-sensus-primary text-white border-sensus-primary"
                    : "bg-white text-sensus-primary border-sensus-border"
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full border border-sensus-border rounded-lg px-4 py-3"
            required
            min={new Date().toISOString().split("T")[0]} // Impede datas no passado
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Horário disponível</label>
          <div className="grid grid-cols-3 gap-3">
            {horariosDisponiveis.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHorario(h)}
                className={`py-2 rounded-lg border font-semibold ${
                  horario === h
                    ? "bg-sensus-primary text-white border-sensus-primary"
                    : "bg-white text-sensus-primary border-sensus-border"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-sensus-primary text-white rounded-full py-3 font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {enviando ? "Agendando..." : "Confirmar Agendamento"}
        </button>
      </form>
    </div>
  );
}