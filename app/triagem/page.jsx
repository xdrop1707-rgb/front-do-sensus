"use client";

import { useState } from "react";
import { criarTriagem } from "./actions";
import Link from "next/link";

export default function Triagem() {
  const [motivo, setMotivo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem("");

    const formData = new FormData();
    formData.append("motivo", motivo);

    const resultado = await criarTriagem(formData);

    if (resultado.error) {
      setMensagem(`Erro: ${resultado.error}`);
    } else {
      setEnviado(true);
    }
    setCarregando(false);
  };

  if (enviado) {
    return (
      <div className="max-w-2xl mx-auto px-8 py-16 text-center">
        <div className="bg-white border border-sensus-border rounded-2xl p-12">
          <h1 className="text-3xl font-bold text-sensus-primary mb-4">Obrigado!</h1>
          <p className="text-sensus-muted mb-8">Sua solicitação de triagem foi recebida com sucesso. Nossa equipe entrará em contato em breve.</p>
          <Link href="/especialistas" className="inline-block bg-sensus-primary text-white px-6 py-3 rounded-full font-semibold">
            Ver Especialistas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-16">
      <h1 className="text-3xl font-bold text-sensus-primary mb-2">Solicitar Triagem</h1>
      <p className="text-sensus-muted mb-8">Conte-nos brevemente o que está sentindo. Suas informações são confidenciais.</p>

      {mensagem && (
        <div className="p-4 rounded-lg mb-6 text-sm bg-red-100 text-red-700">{mensagem}</div>
      )}

      <form onSubmit={enviar} className="bg-white border border-sensus-border rounded-2xl p-8 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Motivo da Consulta</label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={6}
            placeholder="Descreva brevemente o que te traz aqui hoje..."
            className="w-full border border-sensus-border rounded-lg px-4 py-3"
            required
          />
        </div>
        <button type="submit" disabled={carregando} className="w-full bg-sensus-primary text-white rounded-full py-3 font-semibold hover:opacity-90 disabled:opacity-50">
          {carregando ? "Enviando..." : "Enviar Solicitação"}
        </button>
      </form>
    </div>
  );
}